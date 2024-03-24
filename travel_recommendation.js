// Function to fetch data from JSON file
function fetchData() {
    fetch('travel_recommendation_api.json')
        .then(response => response.json())
        .then(data => {
            // Once data is fetched, store it in a variable for further processingc
            console.log(data);
            processData(data);
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Function to process fetched data
function processData(data) {
    // Add event listener to the search button
    var searchButton = document.getElementById("searchButton");
    searchButton.addEventListener("click", function(event) {
        event.preventDefault(); // Prevent the default form submission behavior
        
        // Retrieve the keyword entered by the user
        var keyword = document.getElementById("searchInput").value.toLowerCase();

        // Check if the keyword matches any predefined categories
        switch (keyword) {
            case "beach":
            case "beaches":
                displayResults(data.beaches, keyword);
                break;
            case "temple":
            case "temples":
                displayResults(data.temples, keyword);
                break;
            case "country":
            case "countries":
                displayResults(data.countries, keyword);
                break;
            default:
                alert("No matching results found for '" + keyword + "'.");
                break;
        }
    });
}


// Function to display results
function displayResults(results, keyword) {
    // Clear previous results
    var resultsContainer = document.getElementById("resultsContainer");
    resultsContainer.innerHTML = '';

    // Display new results based on the keyword
    if (keyword === "country" || keyword === "countries") {
        results.forEach(country => {
            country.cities.forEach(city => {
                // Create elements to display result (e.g., name, image, description)
                var resultElement = document.createElement("div");
                resultElement.classList.add("result");
    
                var nameElement = document.createElement("h3");
                nameElement.textContent = city.name + ' - ' + country.name;
    
                var descriptionElement = document.createElement("p");
                descriptionElement.textContent = city.description;
    
                // Append elements to the results container
                resultElement.appendChild(nameElement);
                // Append image HTML to result container
                resultElement.innerHTML += `<img src="${city.imageUrl}" alt="${city.name}" style=width:400px; height:5000px>`;
                resultElement.appendChild(descriptionElement);
                
                resultsContainer.appendChild(resultElement);
                
        })});
        document.querySelector('.text-center').innerHTML = '';
    } else {
        // Display other types of results (beaches, temples)
        results.forEach(result => {
            var resultElement = document.createElement("div");
            resultElement.classList.add("result");

            var nameElement = document.createElement("h3");
            nameElement.textContent = result.name;

            var descriptionElement = document.createElement("p");
            descriptionElement.textContent = result.description;

            resultElement.appendChild(nameElement);
            resultElement.innerHTML += `<img src="${result.imageUrl}" alt="${result.name}" style=width:400px; height:5000px>`;
            resultElement.appendChild(descriptionElement);

            resultsContainer.appendChild(resultElement);
        });
        document.querySelector('.text-center').innerHTML = '';
    }
}




// Fetch data when the page is loaded
document.addEventListener("DOMContentLoaded", function() {
    fetchData();
});
