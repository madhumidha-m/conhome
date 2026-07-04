
const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: 'enroll_db',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
})

pool.connect()
  .then(() => console.log('Enroll DB connected'))
  .catch(err => console.error('Enroll DB error:', err))

module.exports = pool