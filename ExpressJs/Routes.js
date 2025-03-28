const express= require('express')

const app=express()


app.use((req,res,next)=>{
    
    console.log("Server has been created")

    next()
})


// Routes
app.get('/orders', (req, res) => {
    res.json({ message: "Here is the list of all orders." });
});

app.post('/orders', (req, res) => {
    res.json({ message: "A new order has been created." });
});

app.get('/users', (req, res) => {
    res.json({ message: "Here is the list of all users." });
});

app.post('/users', (req, res) => {
    res.json({ message: "A new user has been added." });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
