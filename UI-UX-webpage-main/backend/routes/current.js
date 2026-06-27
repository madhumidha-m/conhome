
const enrollPool = require('../db_enroll')
const autoPool = require('../db_autohome')
const router = require('express').Router()


router.post('/', async (req, res) => {
  try {

    // Data received from ESP32
    const {
      device_id,
      current,
      power,
      energy_kwh,
      cost
    } = req.body;

    // Step 1: Check whether the device is enrolled
    const enrolled = await enrollPool.query(
      `SELECT * FROM enroll_table WHERE device_id = $1`,
      [device_id]
    );

    // If the device is not enrolled, stop here
    if (enrolled.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Device not enrolled"
      });
    }

    // Step 2: Save energy data in autohome database
    await autoPool.query(
      `INSERT INTO energy_logs
      (device_id, current, power, energy_kwh, cost)
      VALUES ($1, $2, $3, $4, $5)`,
      [device_id, current, power, energy_kwh, cost]
    );

    res.json({
      success: true,
      message: "Energy data stored successfully"
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
});

router.get('/', async(req,res)=>{
  const result = await autoPool.query(
    `SELECT * FROM energy_logs
     ORDER BY created_at DESC
     LIMIT 50`
  )

  res.json(result.rows)
})

module.exports = router
