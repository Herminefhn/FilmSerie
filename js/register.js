const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyBefCmGsu7yw1tGTTZocR7TYUx_ajb8ggI",
    authDomain: "filmserieregister.firebaseapp.com",
    projectId: "filmserieregister",
    storageBucket: "filmserieregister.appspot.com",
    messagingSenderId: "839487770608",
    appId: "1:839487770608:web:8b81f40ecc47899e88d735",
    measurementId: "G-D0221MJR6F"
});

// Firebase services
const db = firebaseApp.firestore();
const auth = firebaseApp.auth();

/**
 * Register User
 */

function signUp() {
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const displayName = document.getElementById('username').value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            // Update Firebase Auth profile with displayName
            return user.updateProfile({ displayName }).then(() => {
                // Optionally store additional user info in Firestore
                return db.collection("users").doc(user.uid).set({
                    email: user.email,
                    displayName,
                    userId: user.uid
                });
            });
        })
        .then(() => {
            console.log("User registered and display name set.");
            window.location.href = "index.html"; // Redirect to home
        })
        .catch((error) => {
            console.error("Error during registration:", error.message);
            alert(error.message);
        });
}

/**
 * Login User
 */
function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredentials) => {
            const user = userCredentials.user;

            // Store session info for user
            sessionStorage.setItem("uid", user.uid);
            console.log("User logged in:", user.displayName);

            window.location.href = "index.html"; // Redirect to home
        })
        .catch((error) => {
            console.error("Login failed:", error.message);
            alert(error.message);
        });
}



/**
 * Display Welcome Message on Home Page
 */
auth.onAuthStateChanged((user) => {
    if (user) {
        const displayName = user.displayName || ""; // Use empty string if no displayName
        document.getElementById('welcome-message').textContent = `Welcome${displayName ? `, ${displayName}` : ""}!`;
    } else {
        document.getElementById('welcome-message').textContent = "Welcome, Guest!";
    }
});
