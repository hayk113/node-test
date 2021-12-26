const express = require('express')
const mongoose = require('mongoose');
const authRouter = require('./api/authRouter');
//const authMiddleware = require('./api/middleware/authMiddleware');


const PORT = process.env.PORT || 8080

const app = express()

app.use(express.json())
app.use('/api', authRouter)

const url = 'mongodb://mongo:27017/users'


const start = async() => {
    try {
        await mongoose.connect(url,{ useNewUrlParser: true , useUnifiedTopology: true })
        app.listen(PORT, () => {
            console.log(`Server has been started on port ${PORT}....`)
        })
    } catch (error) {
        console.log(error);
    }
}

start()