const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const app = express();
const port = process.env.PORT || 8080;


// CS5356 TODO #2
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD-ajVdaBp6vkU1wSEr7iNVS3AB0rO1e8Q",
    authDomain: "milestone1-cs5356.firebaseapp.com",
    projectId: "milestone1-cs5356",
    storageBucket: "milestone1-cs5356.appspot.com",
    messagingSenderId: "135794064009",
    appId: "1:135794064009:web:481be346290c826ba52458"
};
// Uncomment this next line after you've created
// serviceAccountKey.json
const serviceAccount = require("./../config/serviceAccountKey.json");
const userFeed = require("./app/user-feed");
const authMiddleware = require("./app/auth-middleware");
const {getAuth} = require("firebase-admin");

// CS5356 TODO #2
// Uncomment this next block after you've created serviceAccountKey.json
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// use cookies
app.use(cookieParser());
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
// set the view engine to ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/static", express.static("static/"));

// use res.render to load up an ejs view file
// index page
app.get("/", function (req, res) {
    res.render("pages/index");
});

app.get("/sign-in", function (req, res) {
    res.render("pages/sign-in");
});

app.get("/sign-up", function (req, res) {
    res.render("pages/sign-up");
});

app.get("/dashboard", authMiddleware, async function (req, res) {
    const feed = await userFeed.get();
    res.render("pages/dashboard", {user: req.user, feed});
});

app.post("/sessionLogin", async (req, res) => {
    // CS5356 TODO #4
    // Get the ID token from the request body
    //   console.log("SESSION LOGIN")
    const idToken = req.body.id_token;
    // console.log(idToken)
    // Create a session cookie using the Firebase Admin SDK
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    // Set that cookie with the name 'session'
    // And then return a 200 status code instead of a 501
    admin.auth().createSessionCookie(idToken, {expiresIn})
        .then(
            (sessionCookie) => {
                // Set cookie policy for session cookie.
                const options = {maxAge: expiresIn, httpOnly: true, secure: true};
                res.cookie('session', sessionCookie, options);
                res.end(JSON.stringify({status: 'success'}));
                res.status(200).send();
            },
            (error) => {
                res.status(401).send('UNAUTHORIZED REQUEST!');
            }
        );

    //   console.log(idToken)
});

app.get("/sessionLogout", (req, res) => {
    res.clearCookie("session");
    res.redirect("/sign-in");
});

function myfunc() {
    console.log("Delay")
}

app.post("/dog-messages", authMiddleware, async (req, res) => {
    // CS5356 TODO #5
    // Get the message that was submitted from the request body
    const msg = req.body.message
    // Get the user object from the request body
    const user = req.user
    user.name = "Omar Alherech"
    console.log(user)
    console.log(req.body)
    userFeed.add(user, msg)
    const delay = time => new Promise(res=>setTimeout(res,time));
    await delay(1000);
    res.redirect('/dashboard')
});

app.listen(port);
console.log("Server started at http://localhost:" + port);
