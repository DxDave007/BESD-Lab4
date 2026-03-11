const express = require('express')
const bodyParser = require('body-parser')
const teacherRouter = require('./teacher')
const cors = require('cors')
const app = express()
const port = 3000

const corsOptions = {
    origin: 'http://localhost:4200',
    methods: 'GET, POST, PUT, DELETE',
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/teachers', teacherRouter)
app.use('/public', express.static('public'))

const db = require('./mysql')
require('dotenv').config()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// LOGIN
app.post('/login', (req, res) => {
    const { teacherId, password } = req.body
    const sql = 'SELECT teacherId, teacherName, email, `password` FROM teachers WHERE teacherId = ?'

    db.query(sql, [teacherId], async (err, result) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ msg: 'Database Error' })
        }

        if (result.length === 0) {
            return res.status(200).json({ msg: 'Teacher ID Not Found.' })
        }

        const teacher = result[0]
        const match = await bcrypt.compare(password, teacher.password)

        if (!match) {
            return res.status(200).json({ msg: 'Password Wrong.' })
        }

        const token = jwt.sign(
            { teacherId: teacher.teacherId, teacherName: teacher.teacherName },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        )

        return res.status(200).json({ msg: 'Login Success.', token: token })
    })
})

app.get('/', (req, res) => {
    res.status(200).json({ msg: 'Server OK.' })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})