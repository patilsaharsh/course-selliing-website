const {Router} = require("express")
const { z } = require("zod")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")


const adminRouter = Router()

// const {JWT_ADMIN_SECRET} = require("../config")
const {adminModel, courseModel} = require("../db")

const {adminMiddleware} = require("../middleware/admin")

adminRouter.post("/signup",async function(req,res){

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
    await adminModel.create({
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




adminRouter.post("/signin",async function(req,res){
  const email = req.body.email
  const password = req.body.password
 


  try {
  const admin =  await adminModel.findOne({
    email:email
   
  })
  
  const passwordMatch = await bcrypt.compare(password,admin.password)
  if (passwordMatch) {
    const token = jwt.sign({
      id : admin._id
    },process.env.JWT_ADMIN_SECRET)
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

adminRouter.post("/course",adminMiddleware,async function(req,res){
  const adminId = req.adminId ;
  const {title,description,price,imageUrl} = req.body ;
  const course = await courseModel.create({
    title,
    description,
    price,
    imageUrl,
    creatorId : adminId

  })

  res.json({
    message : "Course created",
    courseId : course._id
  })

})


adminRouter.put("/course",adminMiddleware,async function(req,res){
  const adminId = req.adminId
  // const oldTitle = req.body.oldTitle
  const title = req.body.title
  const {description,price,imageUrl,courseId} = req.body
  try{
  const course = await courseModel.findOne({
    creatorId : adminId,
    // title: oldTitle
    _id : courseId
  })
  
  findCourse = course._id
  
  const updatedCourse = await courseModel.findByIdAndUpdate(
    findCourse ,                  
    { title,
      description,
      price,
      imageUrl 

    },        
    
  );
  res.json({
    message: "Course updated"
  })
}catch(e){
  res.json({
    message:"Course does not exist"
  })
}
})


adminRouter.get("/course/bulk",adminMiddleware,async function(req,res){
  const adminId = req.adminId
  const  courses = await courseModel.find({
    creatorId : adminId
  })

  res.json({
    courses : courses
  })
})




module.exports ={
  adminRouter : adminRouter
}