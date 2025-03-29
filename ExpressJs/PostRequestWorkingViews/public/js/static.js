function handleSubmit(event){
 
    event.preventDefault()

    const productInput = document.getElementById('product').value;
     
    const obj={
        productInput
    }
    axios.post("http://localhost:4500/api/product", obj)
    .then((result) => {
        console.log("Response from server:", result.data);
    })
    .catch((error) => {
        console.error("Error sending data:", error);
    });

    console.log("Server is working fine")
     
}