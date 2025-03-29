

const GETproductDetails=(req,res)=>{
    res.send("Fetching all products")
}

const POSTproductDetails=(req,res)=>{
    res.send("Adding a new product")
}

const GETproductDetailsUserId=(req,res)=>{
    const id=parseInt(req.params.id)
    res.send(`Fetching user with ID: ${id}`)
}


module.exports={
    GETproductDetails,
    POSTproductDetails,
    GETproductDetailsUserId
}

