const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: 'autohome',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
})

pool.connect()
  .then(() => console.log('Autohome DB connected'))
  .catch(err => console.error('Autohome DB error:', err))

module.exports = pool
