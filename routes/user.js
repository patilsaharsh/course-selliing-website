const {Router} = require("express")
const { z } = require("zod")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const userRouter = Router()
const {userModel, purchaseModel, courseModel} = require("../db")
// const {JWT_USER_SECRET} = require("../config")
const { userMiddleware } = require("../middleware/user")
userRouter.post("/signup",async function(req,res){

  const requiredBody = z.object({
    firstName:z.string().min(3).max(20) , 
    lastName:z.string().min(3).max(10) ,
    email:z.string().email() ,
    password:z.string().min(5).max(20)
  })
  const parseDataWithSuccess = requiredBody.safeParse(req.body)
  
  if(!parseDataWithSuccess){
    res.json({
      message : "Incorrect format", 
      Error : parseDataWithSuccess.Error.message
    })
  }
  const firstName = req.body.firstName
  const lastName = req.body.lastName
  const email = req.body.email
  const password = req.body.password

  errorThrown = false

  try {
    const hashedPassword =  await bcrypt.hash(password,5)
    console.log(hashedPassword)
    await userModel.create({
      firstName:firstName,
      lastName:lastName,
      email : email,
      password : hashedPassword,
    
  })
}catch(e){
  console.log(e);
  
  res.json({
    message : "User already exists"
  })
  
  errorThrown = true 
}

if(!errorThrown){
  res.json({
    message:"Signed up successfully"
  })
}


})




userRouter.post("/signin",async function(req,res){
  const email = req.body.email
  const password = req.body.password
 


  try {
  const user =  await userModel.findOne({
    email:email
   
  })
  
  const passwordMatch = await bcrypt.compare(password,user.password)
  if (passwordMatch) {
    const token = jwt.sign({
      id : user._id
    },process.env.JWT_USER_SECRET)
    res.json({
    
   token : token 
    })
  }else{
    console.error(error.message)
  }
  
  } catch (error) {
  res.status(403).json({
    message:"Incorrect credentials"
  })
}
})







userRouter.get("/purchases",userMiddleware,async function(req,res){
  const userId = req.userId
  const purchases =  await purchaseModel.find({
    userId 
  })
  
  const courseData = await courseModel.find({
    _id : {$in : purchases.map(x => x.courseId)}
  })

  res.json({
    purchases,
    courseData
    
  })

})


module.exports = {
  userRouter : userRouter
}