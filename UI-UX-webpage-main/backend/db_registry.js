


const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: 'register',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
})

pool.connect()
  .then(() => console.log('Registry DB connected'))
  .catch(err => console.error('Registry DB error:', err))

module.exports = pool