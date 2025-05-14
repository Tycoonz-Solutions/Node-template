'use strict';
const { responses } = require('../../../utils/response');
const resgisterService = require('../../../services/api/v1/register.service');
const httpCode = require('../../../utils/httpCodes');

module.exports = {
  register: async (req, res) => {
    try {
      
      const data = await resgisterService.register(req);

      responses(res, data)
    } catch (error) {
      responses(res, {
        httpCode: httpCode.BAD_REQUEST,
        errors: [{ message: error.message }]
      })
    }
  },
  
};
