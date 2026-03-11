const express = require('express')
const router = express.Router()
const db = require('./mysql')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const authGuard = require('./auth-guard')
require('dotenv').config()

const SECRET_KEY = process.env.JWT_SECRET
const upload = multer()

// LOGIN
router.post('/login', (req, res) => {
    const { teacherId, password } = req.body
    const sql = 'SELECT teacherId, teacherName, email, `password` FROM teachers WHERE teacherId = ?'
    db.query(sql, [teacherId], async (err, result) => {
        if (err) return res.status(500).json({ msg: 'Database Error' })
        if (result.length === 0) return res.status(200).json({ msg: 'Teacher ID Not Found.' })

        const teacher = result[0]
        const match = await bcrypt.compare(password, teacher.password)
        if (!match) return res.status(200).json({ msg: 'Password Wrong.' })

        const token = jwt.sign(
            { teacherId: teacher.teacherId, teacherName: teacher.teacherName },
            SECRET_KEY,
            { expiresIn: '1h' }
        )
        res.status(200).json({ msg: 'Login Success.', token: token })
    })
})

// GET ALL TEACHERS
router.get('/', authGuard, (req, res) => {
    db.query('SELECT teacherId, teacherName, email FROM teachers', (err, result) => {
        if (err) return res.status(500).json({ msg: 'Database Error' })
        res.status(200).json({ result: 1, data: result, user: req.user })
    })
})

// GET TEACHER BY ID
router.get('/:id', authGuard, (req, res) => {
    const sql = 'SELECT teacherId, teacherName, email FROM teachers WHERE teacherId = ?'
    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ msg: 'Database Error' })
        if (result.length === 0) return res.status(404).json({ msg: 'Teacher ID Not Found.' })
        res.status(200).json({ result: 1, data: result[0] })
    })
})

// CREATE TEACHER
router.post('/', authGuard, async (req, res) => {
    const { teacherId, teacherName, email, password } = req.body
    const hashed = await bcrypt.hash(password, 10)
    const sql = 'INSERT INTO teachers (teacherId, teacherName, email, `password`) VALUES (?, ?, ?, ?)'
    db.query(sql, [teacherId, teacherName, email, hashed], (err, result) => {
        if (err) return res.status(500).json({ msg: 'Database Error' })
        res.status(201).json({ msg: 'Teacher Created.' })
    })
})

// UPDATE TEACHER
router.put('/:id', authGuard, async (req, res) => {
    const { teacherName, email, password } = req.body
    const hashed = await bcrypt.hash(password, 10)
    const sql = 'UPDATE teachers SET teacherName=?, email=?, `password`=? WHERE teacherId=?'
    db.query(sql, [teacherName, email, hashed, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ msg: 'Database Error' })
        if (result.affectedRows === 0) return res.status(404).json({ msg: 'Teacher ID Not Found.' })
        res.status(200).json({ msg: 'Teacher Updated.' })
    })
})

// DELETE TEACHER
router.delete('/:id', authGuard, (req, res) => {
    db.query('DELETE FROM teachers WHERE teacherId = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ msg: 'Database Error' })
        if (result.affectedRows === 0) return res.status(404).json({ msg: 'Teacher ID Not Found.' })
        res.status(200).json({ msg: 'Teacher Deleted.' })
    })
})

// UPLOAD PICTURE
router.post('/:id/picture', authGuard, upload.single('picture'), (req, res) => {
    if (!req.file) return res.status(400).json({ msg: 'No File.' })
    const sql = 'UPDATE teachers SET picture=? WHERE teacherId=?'
    db.query(sql, [req.file.buffer, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ msg: 'Database Error' })
        res.status(200).json({ msg: 'Picture Uploaded.' })
    })
})

module.exports = router