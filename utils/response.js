// const moment = require('moment')
module.exports = {
  successResponse: (res, httpCode, ...rest) => {
    res.status(httpCode).send(rest)
    res.end()
  },
  errorResponse: (res, httpCode, ...rest) => {
    res.status(httpCode).send(rest)
    res.end()
  },
  response: (res, httpCode, rest) => {
    res.status(httpCode).send(rest)
    res.end()
  },
  responses: (res, response) => {
    if (response?.errors?.length > 0) {
      res.status(response.httpCode).send({
        status: response.httpCode,
        success: false,
        message: response?.errors[0].message,
      })
      res.end()
    } else if (response.httpCode === 400) {
      res.status(response.httpCode).send({
        status: response.httpCode,
        success: false,
        message: response.message,
      })
      res.end()
    } else {
      res.status(response.httpCode).send({
        status: response.httpCode,
        success: true,
        message: response.message,
        ...(response.count !== undefined && { count: response.count }), 
        data: response.data,
      });
      
      res.end()
    }
  },
  redirect: (req, res, response) => {
    console.log('response.path...........=> ', response.path)

    res.status(response.status).redirect(response.path)
  },
  render: async (req, res, response) => {

    res.status(response.httpCode).render(response.path, {
      ...response,
      error: req.flash('error'),
      // moment,
      success: req.flash('success'),
      user: req.user,
    })
  }
}
