// Firebase Initialization
const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyBefCmGsu7yw1tGTTZocR7TYUx_ajb8ggI",
    authDomain: "filmserieregister.firebaseapp.com",
    projectId: "filmserieregister",
    storageBucket: "filmserieregister.appspot.com",
    messagingSenderId: "839487770608",
    appId: "1:839487770608:web:8b81f40ecc47899e88d735",
    measurementId: "G-D0221MJR6F"
});

// Firebase Firestore setup
const db = firebaseApp.firestore();

// API Configuration
const apiKey = '72a1384581e1572b80f575a92e50132c';
const accessToken = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MmExMzg0NTgxZTE1NzJiODBmNTc1YTkyZTUwMTMyYyIsIm5iZiI6MTczMDc5MjYwNi4wNDM0ODg1LCJzdWIiOiI2NzIxZGVkNDBjZDhhMmE1MDNhY2QwMTkiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.W7Hpk7oae37s9YsvTBKI7d4WVTkFlsB-gewiBmmttLM';

// Global movie list
let movieList = [];

// Functions for Movie CRUD Operations
function addItem() {
    const title = document.getElementById("title").value;
    const year = document.getElementById("year").value;
    const image = document.getElementById("image").value;
    const genre = document.getElementById("genre").value;
    const director = document.getElementById("director").value;

    db.collection("movies").doc(title).set({
        title,
        year,
        genre,
        director,
        image
    }).then(() => {
        displayMovies();
    });
    clearForm();
}



// Fetch movies from TMDB API
async function searchTMDB() {
    const query = document.getElementById('search-input').value;
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`;

    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json;charset=utf-8',
            }
        });
        const data = await response.json();
        displaySearchResults(data.results);
    } catch (error) {
        console.error("Failed to fetch from TMDB:", error);
    }
}

function displaySearchResults(results) {
    const searchResults = document.getElementById('search-results');
    searchResults.innerHTML = '';

    results.forEach(movie => {
        const div = document.createElement('div');
        div.textContent = `${movie.title} (${movie.release_date ? movie.release_date.slice(0, 4) : 'Ukjent'})`;
        div.addEventListener('click', () => addMovieFromTMDB(movie));
        searchResults.appendChild(div);
    });
}

function addMovieFromTMDB(movie) {
    const newMovie = {
        title: movie.title,
        genre: movie.genre_ids.join(', '),
        year: movie.release_date ? movie.release_date.slice(0, 4) : 'Ukjent',
        director: 'Ukjent', // TMDB API doesn't provide director in search results
        rating: movie.vote_average,
    };
    movieList.push(newMovie);
    displayMovies();
}

// Display Movies from Firestore
function displayMovies() {
    db.collection("movies").get().then((querySnapshot) => {
        let items = "";
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const imageUrl = data.image || "https://via.placeholder.com/150";

            items += `
                <div class='movie-card'>
                    <img src='${imageUrl}' alt='${data.title}' onerror="this.src='https://via.placeholder.com/150';">
                    <div>
                        <h2>${data.title}</h2>
                        <p>Year: ${data.year}</p>
                        <p>Genre: ${data.genre}</p>
                        <p>Director: ${data.director}</p>
                        <button onclick="openEditModal('${doc.id}')">Edit</button>
                        <button onclick="confirmDelete('${doc.id}')">Delete</button>
                    </div>
                </div>`;
        });
        document.getElementById("movies").innerHTML = items;
    }).catch((error) => {
        console.error("Error displaying movies:", error);
    });
}


let currentEditId = ""; // To store the id of the movie being edited

// Open the modal and populate it with movie data
function openEditModal(docId) {
    currentEditId = docId;

    // Fetch movie data from Firestore
    db.collection("movies").doc(docId).get().then((doc) => {
        if (doc.exists) {
            const movie = doc.data();

            // Populate the form fields with movie data
            document.getElementById("inptitle").value = movie.title;
            document.getElementById("inpgenre").value = movie.genre;
            document.getElementById("inpimage").value = movie.image;
            document.getElementById("inpyear").value = movie.year;
            document.getElementById("inpdirector").value = movie.director;
            document.getElementById("inprating").value = movie.rating;

            // Display the modal
            document.getElementById("editModal").style.display = "block";
        }
    }).catch((error) => {
        console.error("Error fetching movie for edit:", error);
    });
}



// Save edited movie data
function saveEditedMovie() {
    const updatedTitle = document.getElementById("inptitle").value;
    const updatedGenre = document.getElementById("inpgenre").value;
    const updatedImage = document.getElementById("inpimage").value;
    const updatedYear = document.getElementById("inpyear").value;
    const updatedDirector = document.getElementById("inpdirector").value;
    const updatedRating = document.getElementById("inprating").value;

    if (currentEditId) {
        db.collection("movies").doc(currentEditId).update({
            title: updatedTitle,
            genre: updatedGenre,
            image: updatedImage,
            year: updatedYear,
            director: updatedDirector,
            rating: updatedRating
        }).then(() => {
            console.log("Movie updated successfully!");
            closeEditModal(); // Close modal after saving
            displayMovies(); // Refresh the movie list
        }).catch((error) => {
            console.error("Error updating movie:", error);
        });
    }
}



// Close the modal
function closeEditModal() {
    document.getElementById("editModal").style.display = "none";
    currentEditId = ""; // Reset the edit id
}


// Delete a movie from Firestore
function deleteMovie(docid) {
    db.collection("movies").doc(docid).delete()
        .then(() => {
            console.log("Movie successfully deleted!");
            alert("Movie has been deleted!");
            displayMovies();
        }).catch((error) => {
            console.error("Error removing movie:", error);
        });
}

// Confirm deletion
function confirmDelete(docid) {
    const confirmation = confirm("Are you sure you want to delete this movie?");
    if (confirmation) {
        deleteMovie(docid);
    }
}

// Clear input fields
function clearForm() {
    document.getElementById('title').value = '';
    document.getElementById('genre').value = '';
    document.getElementById('year').value = '';
    document.getElementById('director').value = '';
    document.getElementById('rating').value = '';
    document.getElementById('image').value = '';
}

// Filter Movies based on user input
function filterMovies() {
    const title = document.getElementById("filter-title").value.trim();
    const genre = document.getElementById("filter-genre").value.trim();
    const year = document.getElementById("filter-year").value.trim();
    const director = document.getElementById("filter-director").value.trim();
    const rating = document.getElementById("filter-rating").value;

    let query = db.collection("movies");

    if (title) query = query.where("title", "==", title);
    if (genre) query = query.where("genre", "==", genre);
    if (year) query = query.where("year", "==", year);
    if (director) query = query.where("director", "==", director);
    if (rating) query = query.where("rating", ">=", parseFloat(rating));

    query.get().then((querySnapshot) => {
        const movieListContainer = document.getElementById("movie-list");
        movieListContainer.innerHTML = "";

        if (querySnapshot.empty) {
            movieListContainer.innerHTML = "<li>No results found</li>";
        } else {
            querySnapshot.forEach((doc) => {
                const movie = doc.data();
                const li = document.createElement("li");
                li.innerHTML = `<strong>${movie.title}</strong> (${movie.year}) - ${movie.genre} - ${movie.director} - Rating: ${movie.rating}`;
                movieListContainer.appendChild(li);
            });
        }
    }).catch((error) => {
        console.error("Error filtering movies:", error);
    });
}

// Display movies initially
displayMovies();


// Handle user state change (check if user is logged in)
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // User is signed in
        document.getElementById('logged-out-links').style.display = 'none'; // Hide login/register
        document.getElementById('logged-in-links').style.display = 'block'; // Show logout and username/email
        const displayName = user.displayName || "User"; // Fallback to "User" if no display name is set
        document.getElementById('welcome-message').textContent = `Welcome, ${displayName}`; // Show user name or fallback
    } else {
        // No user is signed in
        document.getElementById('logged-out-links').style.display = 'block'; // Show login/register
        document.getElementById('logged-in-links').style.display = 'none'; // Hide logout
    }
});



// Logout functionality
document.getElementById('logout-btn')?.addEventListener('click', function() {
    firebase.auth().signOut().then(function() {
        console.log("User logged out");
        window.location.href = 'index.html'; // Redirect to home page after logout
    }).catch(function(error) {
        console.error("Error during logout:", error);
    });
});

