

const GETcartDetails=(req,res)=>{
    const id=parseInt(req.params.userId)
    res.send(`Fetching cart for user with ID: ${id}`)
}

const POSTcartDetails=(req,res)=>{
    const id=parseInt(req.params.userId)
    res.send(`Adding product to cart for user with ID: ${id}`)
}

module.exports={GETcartDetails}



