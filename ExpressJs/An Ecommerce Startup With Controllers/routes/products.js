const express = require('express')

const route=express.Router()

const productController=require('../controller/productController')

route.get('/',productController.GETproductDetails)


route.post('/',productController.POSTproductDetails)


route.get('/:id',productController.GETproductDetailsUserId)

module.exports=route