'use strict';
const { responses } = require('../../../utils/response');
const loginService = require('../../../services/api/v1/auth.service');
const httpCode = require('../../../utils/httpCodes');

module.exports = {
  login: async (req, res) => {
    try {
      const login = await loginService.login(req);

      responses(res, login)
    } catch (error) {
      responses(res, {
        httpCode: httpCode.BAD_REQUEST,
        errors: [{ message: error.message }]
      })
    }
  },
  changePassword: async (req, res) => {
    try {
      const changePassword = await loginService.changePassword(req);

      responses(res, changePassword)
    } catch (error) {
      responses(res, {
        httpCode: httpCode.BAD_REQUEST,
        errors: [{ message: error.message }]
      })
    }
  },
  forgotPassword: async (req, res) => {
    try {
      const forgotPassword = await loginService.forgotPassword(req);

      responses(res, forgotPassword)
    } catch (error) {
      responses(res, {
        httpCode: httpCode.BAD_REQUEST,
        errors: [{ message: error.message }]
      })
    }
  },
  verifyOtp: async (req, res) => {
    try {
      const verifyOtp = await loginService.verifyOtp(req);

      responses(res, verifyOtp)
    } catch (error) {
      responses(res, {
        httpCode: httpCode.BAD_REQUEST,
        errors: [{ message: error.message }]
      })
    }
  },
  emailVerifyOtp: async (req, res) => {
    try {
      const verifyOtp = await loginService.verifyEmailOtp(req);

      responses(res, verifyOtp)
    } catch (error) {
      responses(res, {
        httpCode: httpCode.BAD_REQUEST,
        errors: [{ message: error.message }]
      })
    }
  },
  newPassword: async (req, res) => {
    try {
      const password = await loginService.setNewPassword(req);

      responses(res, password)
    } catch (error) {
      responses(res, {
        httpCode: httpCode.BAD_REQUEST,
        errors: [{ message: error.message }]
      })
    }
  },
};
