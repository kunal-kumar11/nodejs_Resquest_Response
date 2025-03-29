const express = require('express')

const route=express.Router()

const userController=require('../controller/userController')

route.get('/',userController.GETuserDetails)


route.post('/',userController.POSTuserDetails)


route.get('/:id',userController.GETuserDetailsById)

module.exports=route