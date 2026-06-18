const router = require('express').Router()
const pool = require('../db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body
  try {
    const hash = await bcrypt.hash(password, 12)
   const short = require('short-uuid')
const userId = short.generate()  // generates "mhvXdrZT4jP5T8vBxuvm75" — 22 chars instead of 36

const result = await pool.query(
  'INSERT INTO users (user_id, name, email, password_hash, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
  [userId, name, email, hash]
)
    res.json({ user: result.rows[0] })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email])
    if (!result.rows.length) return res.status(401).json({ error: 'User not found' })
    const user = result.rows[0]
    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) return res.status(401).json({ error: 'Wrong password' })
    const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, name: user.name, userId: user.user_id })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router