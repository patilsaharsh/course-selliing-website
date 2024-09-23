const {Router} = require("express")

const courseRouter = Router()
const {purchaseModel, courseModel} = require("../db")
const {userMiddleware} = require("../middleware/user")


courseRouter.post("/purchase",userMiddleware,async function(req,res){
  const userId = req.userId
  const courseId = req.body.courseId
  await purchaseModel.create({
    userId ,
    courseId
  })

  res.json({
    message : "You have successfuly bought the course"
  })
})

courseRouter.get("/preview",async function(req,res){
  const courses = await courseModel.find({});
  res.json({
    courses
  })


})




module.exports = {
  courseRouter : courseRouter
}