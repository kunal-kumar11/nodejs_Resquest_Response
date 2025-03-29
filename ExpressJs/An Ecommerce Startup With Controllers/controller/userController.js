


const GETuserDetails=(req,res)=>{
    res.send("Fetching all users")
}

const POSTuserDetails=(req,res)=>{
    res.send("Adding a new user")
}


const GETuserDetailsById=(req,res)=>{
    const id=parseInt(req.params.id)
    res.send(`Fetching user with ID: ${id}`)
}


module.exports={
    GETuserDetails,
    POSTuserDetails,
    GETuserDetailsById
}