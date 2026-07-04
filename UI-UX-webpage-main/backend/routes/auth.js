const router = require('express').Router()
const pool = require('../db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const otpGenerator = require('otp-generator')
const sendOTP = require('../utils/mail')

// Register
router.post('/register', async (req, res) => {

  const { name, email, password } = req.body

  try {

    // Check if email already exists
    const existing = await pool.query(
      'SELECT * FROM users WHERE email=$1',
      [email]
    )

    if (existing.rows.length > 0) {
      return res.status(400).json({
        error: 'Email already registered'
      })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Save temporarily
    await pool.query(
      `INSERT INTO pending_users
      (email,name,password_hash)
      VALUES($1,$2,$3)
      ON CONFLICT(email)
      DO UPDATE SET
      name=EXCLUDED.name,
      password_hash=EXCLUDED.password_hash`,
      [email,name,passwordHash]
    )

    // Generate 6 digit OTP
    const otp = otpGenerator.generate(6,{
      upperCaseAlphabets:false,
      lowerCaseAlphabets:false,
      specialChars:false
    })

    // Hash OTP
    const otpHash = await bcrypt.hash(otp,10)

    // Save OTP
    await pool.query(
      `INSERT INTO otp_verifications
      (email,otp_hash,expires_at)
      VALUES($1,$2,NOW()+INTERVAL '10 minutes')
      ON CONFLICT(email)
      DO UPDATE SET
      otp_hash=EXCLUDED.otp_hash,
      verified=false,
      attempts=0,
      expires_at=NOW()+INTERVAL '10 minutes'`,
      [email,otpHash]
    )

    // Send Email
    await sendOTP(email,otp)

    res.json({
      success:true,
      message:"OTP Sent"
    })

  } catch(err){

    res.status(500).json({
      error:err.message
    })

  }

})
router.post('/verify-otp', async (req, res) => {

  const { email, otp } = req.body

  try {

    // Get OTP record
    const otpResult = await pool.query(
      'SELECT * FROM otp_verifications WHERE email=$1',
      [email]
    )

    if (otpResult.rows.length === 0) {
      return res.status(400).json({
        error: 'OTP not found'
      })
    }

    const otpData = otpResult.rows[0]

    // Check expiry
    if (new Date() > new Date(otpData.expires_at)) {
      return res.status(400).json({
        error: 'OTP Expired'
      })
    }

    // Compare OTP
    const validOTP = await bcrypt.compare(
      otp,
      otpData.otp_hash
    )

    if (!validOTP) {
      return res.status(400).json({
        error: 'Invalid OTP'
      })
    }

    // Read pending user
    const pending = await pool.query(
      'SELECT * FROM pending_users WHERE email=$1',
      [email]
    )

    if (pending.rows.length === 0) {
      return res.status(400).json({
        error: 'Pending user not found'
      })
    }

    const short = require('short-uuid')
    const userId = short.generate()

    // Insert into users
    const user = pending.rows[0]

    await pool.query(
      `INSERT INTO users
      (user_id,name,email,password_hash,created_at)
      VALUES($1,$2,$3,$4,NOW())`,
      [
        userId,
        user.name,
        user.email,
        user.password_hash
      ]
    )

    // Cleanup
    await pool.query(
      'DELETE FROM pending_users WHERE email=$1',
      [email]
    )
    

    await pool.query(
      'DELETE FROM otp_verifications WHERE email=$1',
      [email]
    )
    // Generate login token
const token = jwt.sign(
  { userId: userId },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
)

 res.json({
  success: true,
  token,
  userId,
  name: user.name,
  email: user.email
})

  }
  catch(err){

    res.status(500).json({
      error:err.message
    })

  }

})
// Resend OTP
router.post('/resend-otp', async (req, res) => {

  const { email } = req.body

  try {

    // Check pending user
    const pending = await pool.query(
      'SELECT * FROM pending_users WHERE email=$1',
      [email]
    )

    if (pending.rows.length === 0) {
      return res.status(400).json({
        error: 'User not found'
      })
    }

    // Generate new OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false
    })

    // Hash OTP
    const otpHash = await bcrypt.hash(otp, 10)

    // Update OTP
    await pool.query(
      `UPDATE otp_verifications
       SET otp_hash=$1,
           verified=false,
           attempts=0,
           expires_at=NOW()+INTERVAL '10 minutes'
       WHERE email=$2`,
      [otpHash, email]
    )

    // Send new OTP email
    await sendOTP(email, otp)

    res.json({
      success: true,
      message: 'OTP Sent Again'
    })

  } catch (err) {

    res.status(500).json({
      error: err.message
    })

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