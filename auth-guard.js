// Midleware ขอดูบัตรผ่าน
const jwt = require('jsonwebtoken')
require('dotenv').config()

const SECRET_KEY = process.env.JWT_SECRET

const authGuard = (req, res, next) => {
    // ดึง TOKEN
    const authHeader = req.headers['authorization']

    const token = authHeader && authHeader.split(' ')[1]

    // กรณีไม่มี TOKEN ส่งมา
    if (!token) {
        return res.status(401).json({msg: 'Token Not Found.'})
    }

    // CHECK TOKEN
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({msg: 'Token Error or Expired.'})
        }

        // TOKEN PASS
        req.user = user
        next()
    })
}

module.exports = authGuard