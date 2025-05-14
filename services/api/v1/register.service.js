'use strict';

const { z, ZodError } = require('zod');
const UserModel = require('../../../models/User');
const userSerializer = require('../../../serializer/user.serializer');
const httpCodes = require('../../../utils/httpCodes');
const { generateHashPassword } = require('../../../helper/bcrypt.helper');
const sendEmail = require('../../../externalServices/nodeMailer');
const { tempToken } = require('../../../helper/jwt.helper');

// Zod Schema for validation
const registerSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phoneNumber: z.string().optional(),
  countryCode: z.string().optional(),
  isoCode: z.string().optional(),
  gender: z.enum(['male', 'female', 'other'], { required_error: 'Gender is required' }),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date of birth',
  }),
});

module.exports = {
  register: async (req) => {
    try {
      const body = req.body;
      const file = req.file;

      // ✅ Validate body with zod
      const validatedData = registerSchema.parse(body);

      // Check if email already exists
      const existingUser = await UserModel.findOne({ email: validatedData.email.toLowerCase() });
      if (existingUser) {
        return {
          httpCode: httpCodes.BAD_REQUEST,
          message: 'Email already registered'
        };
      }

      // Hash the password
      const hashedPassword = await generateHashPassword(validatedData.password);

      // Profile image
      const profileImagePath = file ? `/uploads/${file.filename}` : '';
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = Date.now() + 5 * 60 * 1000;

      // Create user
      const user = await UserModel.create({
        fullName: validatedData.fullName,
        email: validatedData.email.toLowerCase(),
        password: hashedPassword,
        phoneNumber: validatedData.phoneNumber || '',
        countryCode: validatedData.countryCode || '',
        isoCode: validatedData.isoCode || '',
        profileImage: profileImagePath,
        gender: validatedData.gender,
        dob: validatedData.dob,
        otp: otp,
        otpExpires: otpExpiry,
        isEmailVerified: false
      });

      const payload = {
        email: validatedData.email,
        id: user._id,
      };
      const token = await tempToken(payload);

      await sendEmail({
        to: validatedData.email,
        subject: '🔐 Your Project name OTP - Valid for 5 Minutes',
        text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
        html: `
          <div style="font-family: 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f4; padding: 30px;">
            <div style="max-width: 550px; margin: auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); overflow: hidden;">
               <div style="background: linear-gradient(135deg, #f6812c, #f89135); padding: 20px; color: white; text-align: center;">
                <h1 style="margin: 0; font-size: 22px;">🔐 Project name</h1>
              </div>
              <div style="padding: 30px;">
                <p style="font-size: 16px; margin: 0 0 10px;">Hi there,</p>
               
                <p style="font-size: 15px; color: #444;">Please use the OTP below to continue:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <span style="display: inline-block; background-color: #f7f7f7; padding: 18px 30px; font-size: 28px; font-weight: bold; color: #e41c34; border-radius: 10px; letter-spacing: 4px;">
                    ${otp}
                  </span>
                </div>
                <p style="font-size: 14px; color: #666;">
                  This OTP is valid for <strong>5 minutes</strong>. If you didn’t request this, please ignore the email.
                </p>
                <p style="margin-top: 40px; font-size: 13px; color: #999;">— The MyTicket Team</p>
              </div>
            </div>
          </div>
        `,
      });

      // Serialize
      const serializedUser = userSerializer.serialize({
        // ...user.toObject(),
        token
      });


      return {
        httpCode: httpCodes.OK,
        message: 'User registered successfully, please check your email for OTP',
        ...serializedUser
      };
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0]; // Only return the first error message
        return {
          httpCode: httpCodes.BAD_REQUEST,
          message: `${firstError.path.join('.')} - ${firstError.message}`
        };
      }
      return {
        httpCode: httpCodes.BAD_REQUEST,
        message: error.message || 'Registration failed'
      };
    }
  }
};
