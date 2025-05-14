const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Load env first!
require('./config/Database/mongodb');
const { color, log } = require('console-log-colors')
const generalResponse = require('./utils/response')
const httpCodes = require('./utils/httpCodes')
const morgan = require('morgan')


const app = express();
app.use(cors());
app.use(express.json());

app.use(morgan('dev'));



app.use('/uploads', require('express').static('public/uploads'));


app.listen(process.env.PORT, () => {
    log(color.blueBright(' ******************************************** '))
    log(color.blueBright(' *******                              ******* '))
    log(
        color.blueBright(
            ` *******   Server started at ${process.env.PORT}     ******* `
        )
    )
    log(color.blueBright(' *******                              ******* '))
    log(color.blueBright(' ******************************************** '))
})


const allRoutes = require('./routes/router')

// settinig all the routes
app.use('/api/v1', allRoutes)

app.get('/', async (req, res) => {
    generalResponse.successResponse(res, httpCodes.OK, {
        status: true,
        message: 'Project name Website Backend is Running....'
    })
})



