const jwt = require('jsonwebtoken');
const httpCode = require('../utils/httpCodes.js');


module.exports = (req, res, next) => {
  const authorizationHeaders = req.headers.authorization || req.headers.Authorization;

  const jwtToken = authorizationHeaders
  ? `${authorizationHeaders}`.split('Bearer ')[1]
  : '';
  
  // 🔒 Token not provided
  if (!jwtToken) {
    return res.status(httpCode.UNAUTHORIZED).json({
      status: httpCode.UNAUTHORIZED,
      success: false,
      message: 'Access token not provided',
    });
  }

  // ✅ Verify token using temporary secret
  jwt.verify(jwtToken, process.env.JWT_TEMP_SECRET, (err, decoded) => {
    
    if (err) {
      return res.status(httpCode.UNAUTHORIZED).json({
        status: httpCode.UNAUTHORIZED,
        success: false,
        message: 'Invalid or expired token',
      });
    }

    req.token = decoded;
    next();
  });
};


