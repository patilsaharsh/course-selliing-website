const express = require("express")
require('dotenv').config()
console.log(process.env.MONGO_URL)
console.log(process.env.JWT_ADMIN_SECRET)
console.log(process.env.JWT_USER_SECRET)

const mongoose = require("mongoose")

const app = express()
app.use(express.json())



const {userRouter} = require("./routes/user")
const {courseRouter} = require("./routes/course")
const {adminRouter} = require("./routes/admin")


app.use("/user",userRouter)


app.use("/course",courseRouter)


app.use("/admin",adminRouter)



async function main(){
  await mongoose.connect(process.env.MONGO_URL)


  app.listen(3000,function(){
    console.log("App is listening at port 3000....")
  })
}
main()
