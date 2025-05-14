const mongoose = require('mongoose')
const { color, log } = require('console-log-colors')
mongoose.set('strictQuery', false)

mongoose.connect(process.env.MONGODB_URL)
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error: '))
db.once('open', () => {
  log(color.greenBright(' ******************************************** '))
  log(color.greenBright(' *******                              ******* '))
  log(color.greenBright(' ****** MongoDb Connected successfully ****** '))
  log(color.greenBright(' *******                              ******* '))
  log(color.greenBright(' ******************************************** '))
})
