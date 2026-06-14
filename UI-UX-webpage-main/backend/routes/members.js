const router = require('express').Router()
const pool = require('../db')
const jwt = require('jsonwebtoken')

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token' })
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next() }
  catch { res.status(401).json({ error: 'Invalid token' }) }
}

router.get('/', auth, async (req, res) => {
  const result = await pool.query('SELECT * FROM members WHERE home_owner_id=$1', [req.user.userId])
  res.json(result.rows)
})

router.post('/', auth, async (req, res) => {
  const { name, role } = req.body
  const result = await pool.query(
    'INSERT INTO members (member_id, home_owner_id, name, role) VALUES (gen_random_uuid(), $1, $2, $3) RETURNING *',
    [req.user.userId, name, role]
  )
  res.json(result.rows[0])
})

router.delete('/:id', auth, async (req, res) => {
  await pool.query('DELETE FROM members WHERE member_id=$1 AND home_owner_id=$2', [req.params.id, req.user.userId])
  res.json({ success: true })
})

module.exports = router