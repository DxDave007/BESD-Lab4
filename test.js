const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect

chai.use(chaiHttp)

const url = 'http://localhost:3000'

// TestCase1: Server ทำงานเป็นปกติ
describe('TestCase1: Server ทำงานเป็นปกติ', () => {
    it('ใช้งาน Server ปกติ', (done) => {
        chai.request(url).get('/').end((err, res) => {
            expect(res).to.have.status(200)
            done()
        })
    })
})

// TestCase2: Authentication
describe('TestCase2: Authentication', () => {
    it('TestCCase1: Correct Login', async () => {
        const res = await chai.request(url)
            .post('/login')
            .send({
                teacherId: 'T00',
                password: '12345678'
            })
        expect(res).to.have.status(200)
        expect(res.body.msg).to.equal('Login Success.')
    })

    it('TestCCase2: Teacher ID Not Found', async () => {
        const res = await chai.request(url)
            .post('/login')
            .send({
                teacherId: 'T99',
                password: '12345678'
            })
        expect(res).to.have.status(200)
        expect(res.body.msg).to.equal('Teacher ID Not Found.')
    })

    it('TestCCase3: Password Wrong', async () => {
        const res = await chai.request(url)
            .post('/login')
            .send({
                teacherId: 'T00',
                password: 'wrongpassword'
            })
        expect(res).to.have.status(200)
        expect(res.body.msg).to.equal('Password Wrong.')
    })
})