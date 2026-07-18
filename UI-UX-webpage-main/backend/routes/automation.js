const router = require('express').Router()
const pool = require('../db')
const jwt = require('jsonwebtoken')

// ======================================
// Authentication Middleware
// ======================================
function auth(req, res, next) {

    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
        return res.status(401).json({
            error: 'No token provided'
        })
    }

    try {

        req.user = jwt.verify(token, process.env.JWT_SECRET)

        next()

    } catch (err) {

        return res.status(401).json({
            error: 'Invalid token'
        })

    }

}

// ======================================
// Create Automation Rule
// ======================================
router.post('/', auth, async (req, res) => {

    const {
        room_id,
        sensor,
        condition,
        threshold,
        device_id,
        action
    } = req.body

    try {

        const result = await pool.query(

            `INSERT INTO automation_rules
            (
                user_id,
                room_id,
                sensor,
                condition,
                threshold,
                device_id,
                action
            )

            VALUES($1,$2,$3,$4,$5,$6,$7)

            RETURNING *`,

            [
                req.user.userId,
                room_id,
                sensor,
                condition,
                threshold,
                device_id,
                action
            ]

        )

        res.json({

            success: true,
            message: "Automation rule created successfully",
            rule: result.rows[0]

        })

    } catch (err) {

        console.log(err)

        res.status(500).json({
            error: err.message
        })

    }

})


// ======================================
// Get Rooms
// ======================================
router.get('/rooms', auth, async (req, res) => {

    try {

        const rooms = await pool.query(

            `SELECT room_id, room_name
             FROM rooms
             WHERE user_id=$1
             ORDER BY room_name`,

            [req.user.userId]

        )

        res.json(rooms.rows)

    } catch (err) {

        res.status(500).json({
            error: err.message
        })

    }

})


// ======================================
// Get Appliances By Room
// ======================================
router.get('/appliances/:roomId', auth, async (req, res) => {

    try {

        const appliances = await pool.query(

            `SELECT
                appliance_id,
                appliance_name
             FROM appliances
             WHERE room_id=$1
             ORDER BY appliance_name`,

            [req.params.roomId]

        )

        res.json(appliances.rows)

    } catch (err) {

        res.status(500).json({
            error: err.message
        })

    }

})



// =============================
// GET ALL AUTOMATION RULES
// =============================

router.get("/", auth, async (req, res) => {

    try {

        const result = await pool.query(

            `
            SELECT
                ar.id,
                ar.sensor,
                ar.condition,
                ar.threshold,
                ar.action,
                ar.enabled,

                r.room_name,

                a.appliance_name

            FROM automation_rules ar

            LEFT JOIN rooms r
            ON ar.room_id = r.room_id

            LEFT JOIN appliances a
            ON ar.device_id = a.appliance_id

            WHERE ar.user_id = $1

            ORDER BY ar.created_at DESC
            `,

            [req.user.userId]

        )

        res.json(result.rows)

    }

    catch(err){

        res.status(500).json({
            error: err.message
        })

    }

})


// =============================
// DELETE AUTOMATION RULE
// =============================

router.delete("/:id", auth, async (req, res) => {

    try {

        await pool.query(

            `
            DELETE FROM automation_rules
            WHERE id=$1
            AND user_id=$2
            `,

            [
                req.params.id,
                req.user.userId
            ]

        )

        res.json({
            success:true
        })

    }

    catch(err){

        res.status(500).json({
            error: err.message
        })

    }

})


module.exports = router