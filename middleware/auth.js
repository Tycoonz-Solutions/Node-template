const jwt = require('jsonwebtoken');
const httpCode = require('../utils/httpCodes');
const UserModel = require('../models/User'); // Adjust path if needed

module.exports = async (req, res, next) => {
  try {
    const authorizationHeaders = req.headers.authorization || req.headers.Authorization;
    const jwtToken = authorizationHeaders?.split('Bearer ')[1] || '';

    // 🔒 Token not provided
    if (!jwtToken) {
      return res.status(httpCode.UNAUTHORIZED).json({
        status: httpCode.UNAUTHORIZED,
        success: false,
        message: 'Access token not provided',
      });
    }

    // ✅ Verify token
    jwt.verify(jwtToken, process.env.TOKEN_KEY, async (err, decoded) => {
      if (err) {
        return res.status(httpCode.UNAUTHORIZED).json({
          status: httpCode.UNAUTHORIZED,
          success: false,
          message: 'Invalid or expired token',
        });
      }

      // 🔍 Check email verification
      const user = await UserModel.findById(decoded._id); // assuming _id is stored in token
      if (!user) {
        return res.status(httpCode.UNAUTHORIZED).json({
          status: httpCode.UNAUTHORIZED,
          success: false,
          message: 'User not found',
        });
      }

      if (!user.isEmailVerified) {
        return res.status(httpCode.UNAUTHORIZED).json({
          status: httpCode.UNAUTHORIZED,
          success: false,
          message: 'Please verify your email to proceed',
        });
      }

      // ✅ Attach token payload
      req.token = decoded;
      next();
    });
  } catch (error) {
    return res.status(httpCode.INTERNAL_SERVER_ERROR).json({
      status: httpCode.INTERNAL_SERVER_ERROR,
      success: false,
      message: 'Server error in auth middleware',
    });
  }
};
