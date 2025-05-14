'use strict';

const UserModel = require('../../../models/User');
const userSerializer = require('../../../serializer/user.serializer');
const httpCodes = require('../../../utils/httpCodes');
const { compare, generateHashPassword } = require('../../../helper/bcrypt.helper');
const { token: generateToken, tempToken } = require('../../../helper/jwt.helper');
const sendEmail = require('../../../externalServices/nodeMailer');

module.exports = {
  login: async (req) => {
    try {
      const { email, password } = req.body;

      // 1. Check if user exists
      const user = await UserModel.findOne({ email })
      if (!user || user.isDeleted === true) {
        return {
          httpCode: httpCodes.UNAUTHORIZED,
          message: 'Invalid email or password'
        };
      }

      // 2. Compare password
      const isMatch = await compare(password, user.password);
      if (!isMatch) {
        return {
          httpCode: httpCodes.UNAUTHORIZED,
          message: 'Invalid email or password'
        };
      }

      // 3. Generate JWT token
      const jwt = await generateToken({
        id: user._id,
        email: user.email,
      });

      // 4. Serialize and return user
      const serializedUser = userSerializer.serialize({
        ...user.toObject(),
        token: jwt
      });

      return {
        httpCode: httpCodes.OK,
        message: 'Login successful',
        ...serializedUser
      };
    } catch (error) {
      console.error('Login Error:', error);
      return {
        httpCode: httpCodes.BAD_REQUEST,
        message: error.message || 'Login failed'
      };
    }
  },
  changePassword: async (req) => {
    try {
      const userId = req.token?._id;
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        throw new Error('Both old and new passwords are required');
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const isMatch = await compare(oldPassword, user.password);
      if (!isMatch) {
        throw new Error('Old password is incorrect');
      }

      const newHashed = await generateHashPassword(newPassword);
      user.password = newHashed;
      await user.save();

      return {
        httpCode: httpCodes.OK,
        message: 'Password changed successfully'
      };
    } catch (error) {
      console.error('Change Password Error:', error);
      return {
        httpCode: httpCodes.BAD_REQUEST,
        message: error.message || 'Failed to change password'
      };
    }
  },
  forgotPassword: async (req, data) => {
    const { email } = req.body;
    try {
      if (!email) {
        return {
          httpCode: httpCodes.BAD_REQUEST,
          message: 'Email is required',
        };
      }

      const user = await UserModel.findOne({ email });
      if (!user) {
        return {
          httpCode: httpCodes.NOT_FOUND,
          message: 'User not found with this email',
        };
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = Date.now() + 5 * 60 * 1000;

      user.resetPasswordToken = otp;
      user.resetPasswordExpires = otpExpiry;

      await user.save();

      const payload = {
        email: email,
        id: user.id
      }

      const token = await tempToken(payload);



      await sendEmail({
        to: email,
        subject: '🔐 Your Project name OTP - Valid for 5 Minutes',
        text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
        html: `
          <div style="font-family: 'Segoe UI', Roboto, sans-serif; background: #f4f4f4; padding: 30px;">
            <div style="max-width: 550px; margin: auto; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); overflow: hidden;">
              <div style="background: linear-gradient(135deg, #f6812c, #f89135); padding: 20px; color: white; text-align: center;">
                <h1 style="margin: 0; font-size: 22px;">🔐 Project name Password Reset</h1>
              </div>
              <div style="padding: 30px;">
                <p style="font-size: 16px;">Hello,</p>
                <p style="font-size: 15px; color: #444;">
                  You requested to reset your password on <strong style="color: #f6812c;">Project name</strong>.
                </p>
                <p style="font-size: 15px; color: #444;">Please use the OTP below to continue:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <span style="display: inline-block; background: #f7f7f7; padding: 18px 30px; font-size: 28px; font-weight: bold; color: #e41c34; border-radius: 10px; letter-spacing: 4px;">
                    ${otp}
                  </span>
                </div>
                <p style="font-size: 14px; color: #666;">
                  This OTP is valid for <strong>5 minutes</strong>. If you didn’t request this, please ignore the email.
                </p>
                <p style="margin-top: 40px; font-size: 13px; color: #999;">— The Project name Team</p>
              </div>
            </div>
          </div>
        `,
      });
      return {
        httpCode: httpCodes.OK,
        message: 'OTP sent to your email',
        data: { token }
      };

    } catch (error) {
      return {
        httpCode: httpCodes.BAD_REQUEST,
        message: 'Failed to send OTP',
        errors: [{ message: error.message || 'Failed to send OTP' }]
      };
    }
  },
  verifyOtp: async (req) => {
    const { otp } = req.body;
    const { email } = req?.token;

    try {
      if (!email || !otp) {
        return {
          httpCode: httpCodes.BAD_REQUEST,
          message: 'Email and OTP are required',
        };
      }

      const user = await UserModel.findOne({ email });
      if (!user) {
        return {
          httpCode: httpCodes.NOT_FOUND,
          message: 'User not found with this email',
        };
      }

      if (user.resetPasswordToken !== otp || Date.now() > user.resetPasswordExpires) {
        return {
          httpCode: httpCodes.UNAUTHORIZED,
          message: 'Invalid or expired OTP',
        };
      }

      const payload = {
        email: user.email,
        otp: otp,
        id: user._id,
      };
      const token = await tempToken(payload);

      

      return {
        httpCode: httpCodes.OK,
        message: 'OTP verified successfully',
        data: { token }

      };
    } catch (error) {
      return {
        httpCode: httpCodes.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to verify OTP',
      };
    }
  },
  verifyEmailOtp: async (req) => {
    const { otp } = req.body;
    const { email } = req?.token;

    try {
      if (!email || !otp) {
        return {
          httpCode: httpCodes.BAD_REQUEST,
          message: 'Email and OTP are required',
        };
      }

      const user = await UserModel.findOne({ email });
      if (!user) {
        return {
          httpCode: httpCodes.NOT_FOUND,
          message: 'User not found with this email',
        };
      }

      if (user.otp !== otp || Date.now() > user.otpExpires) {
        return {
          httpCode: httpCodes.UNAUTHORIZED,
          message: 'Invalid or expired OTP',
        };
      }

      user.otp = undefined;
      user.otpExpires = undefined;
      user.isEmailVerified = true;

      await user.save()

      

      return {
        httpCode: httpCodes.OK,
        message: 'OTP verified successfully',
      };
    } catch (error) {
      return {
        httpCode: httpCodes.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to verify OTP',
      };
    }
  },
  setNewPassword: async (req) => {
    const { newPassword } = req.body;
    const { otp, email } = req?.token;
    try {
      if (!email || !otp || !newPassword) {
        return {
          httpCode: httpCodes.BAD_REQUEST,
          message: 'Email and OTP are required',
        };
      }

      const user = await UserModel.findOne({ email });
      if (!user) {
        return {
          httpCode: httpCodes.NOT_FOUND,
          message: 'User not found with this email',
        };
      }

      if (user.resetPasswordToken !== otp || Date.now() > user.resetPasswordExpires) {
        return {
          httpCode: httpCodes.UNAUTHORIZED,
          message: 'Invalid or expired OTP',
        };
      }


      const hashedPassword = await generateHashPassword(newPassword);
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      await sendEmail({
        to: email,
        subject: '🔐 Your Project name Password has been reset',
        text: `Your password has been successfully reset.`,
        html: `
          <div style="font-family: 'Segoe UI', Roboto, sans-serif; background: #f4f4f4; padding: 30px;">
            <div style="max-width: 550px; margin: auto; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); overflow: hidden;">
              <div style="background: linear-gradient(135deg, #f6812c, #f89135); padding: 20px; color: white; text-align: center;">
                <h1 style="margin: 0; font-size: 22px;">🔐 Project name Password Reset</h1>
              </div>
              <div style="padding: 30px;">
                <p style="font-size: 16px;">Hello,</p>
                <p style="font-size: 15px; color: #444;">
                  Your password has been successfully reset on <strong style="color: #f6812c;">Project name</strong>.
                </p>
                <p style="font-size: 15px; color: #444;">You can now log in with your new password.</p>
                <p style="margin-top: 40px; font-size: 13px; color: #999;">— The Project name Team</p>
              </div>
            </div>
          </div>
        `,
      });

      return {
        httpCode: httpCodes.OK,
        message: 'Pssword updated successfully',
      };
    } catch (error) {
      return {
        httpCode: httpCodes.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to verify OTP',
      };
    }
  },
};
