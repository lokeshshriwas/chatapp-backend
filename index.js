require('dotenv').config()
const express = require("express")
const app = express()
const port = process.env.PORT
const chats = require("./Data/data.js")
const connectDb = require('./config/db.js')
const userRoute = require("./routes/userRoute.js")
const chatRoute = require("./routes/chatRoute.js")
const { NotFound, ErrorHandler } = require('./middleware/errorMiddleware.js')

connectDb()
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use("/api/user" , userRoute)
app.use("/api/chat" , chatRoute)

app.use(NotFound)
app.use(ErrorHandler)

app.listen(port, ()=>{
    console.log(`listing to port ${port}`)
})