function handleSubmit(event) {
    event.preventDefault();
  
    const companyName = event.target.companyName.value;
    const prosName = event.target.prosName.value;
    const consName = event.target.consName.value;
    const rating = event.target.rating.value;
  
    const obj = {
      companyName,
      prosName,
      consName,
      rating
    };
  
    // Ensure the API URL matches your backend route
    axios.post("/api/reviews", obj)
      .then(response => {
        alert("Review submitted successfully!");
        event.target.reset(); // Clear form after submission
      })
      .catch(error => {
        console.error("Error submitting review:", error);
      });
  }
  
  function searchSubmit(event) {
    event.preventDefault();
    const searchValue = event.target.companyNameSearch.value;
  
    // Fetch reviews based on company name
    axios.get(`/api/reviews?company=${searchValue}`)
      .then(response => {
        const reviews = response.data; // Assuming the response contains an array of reviews
        let average = 0;
        let count = 0;
  
        // Clear previous results
        document.getElementById("prosandcons").innerHTML = "";
  
        reviews.forEach(element => {
          average += parseFloat(element.rating); // Ensure rating is a number
          count++;
          displayList(element);
        });
  
        // Update UI with search results
        document.getElementById("companySpan").textContent = searchValue;
        document.getElementById("RatingSpan").textContent = count > 0 ? (average / count).toFixed(1) : "No reviews yet";
      })
      .catch(error => {
        console.error("Error fetching reviews:", error);
      });
  }
  
  function displayList(element) {
    const ulElement = document.getElementById("prosandcons");
  
    const liElement = document.createElement("li");
    liElement.innerHTML = `
      <strong>Pros:</strong> ${element.prosName} <br>
      <strong>Cons:</strong> ${element.consName}
    `;
  
    ulElement.appendChild(liElement);
  }
  