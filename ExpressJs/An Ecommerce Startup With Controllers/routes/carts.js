const express = require('express')

const route=express.Router()

const cartsController=require('../controller/cartsController')


route.get('/:userId',cartsController.GETcartDetails)


// route.post('/:userId',cartsController.POSTcartDetails)

module.exports=route