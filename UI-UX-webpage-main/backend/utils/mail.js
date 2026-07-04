const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

async function sendOTP(email, otp) {

    await transporter.sendMail({
        from: `"ConHome" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "ConHome Email Verification",

        html: `
        <div style="font-family:Arial;padding:20px">
            <h2>ConHome Verification</h2>

            <p>Your verification code is</p>

            <h1 style="letter-spacing:5px">${otp}</h1>

            <p>This code expires in 10 minutes.</p>

            <p>Do not share this code with anyone.</p>
        </div>
        `
    })

}

module.exports = sendOTP