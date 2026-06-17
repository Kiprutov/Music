const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const {sequelize} = require('./models')
const config = require('./config/config')

const app = express()
app.use(morgan('combine'))
app.use(bodyParser.json())

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : ['http://localhost:8080']

app.use(cors({
  origin: corsOrigins,
  credentials: true
}))

require('./routes')(app)

sequelize.sync()
    .then(() => {
      app.listen(config.port, () => {
        console.log(`API listening on port ${config.port}`)
      })
    })
