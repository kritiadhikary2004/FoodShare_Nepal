require("dotenv").config();

const mysql = require("mysql2");
const express = require("express");
const path = require("path");
const session = require("express-session");

const app = express();

const PORT = 3000;

// ================= DATABASE =================

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.log("Database connection failed:", err);
    } else {
        console.log("MySQL database connected successfully!");
    }
});


// ================= MIDDLEWARE =================

app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({
    extended: true
}));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));


// ================= HOME =================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "home.html")
    );

});


// ================= CHOOSE ROLE =================

app.get("/choose-role", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "choose-role.html")
    );

});


// ================= DONATE PAGE =================

app.get("/donate", (req, res) => {

    if (!req.session.user) {
        return res.redirect("/login");
    }

    if (req.session.user.role !== "donor") {
        return res.redirect("/receiver");
    }

    res.sendFile(
        path.join(__dirname, "public", "donate.html")
    );

});


// ================= SAVE DONATION =================

app.post("/donate", (req, res) => {

    if (!req.session.user) {
        return res.redirect("/login");
    }

    if (req.session.user.role !== "donor") {
        return res.redirect("/receiver");
    }

    const {
        food_name,
        quantity,
        location,
        food_type,
        available_date,
        pickup_time,
        description
    } = req.body;


    const sql = `
        INSERT INTO donations
        (
            food_name,
            quantity,
            location,
            food_type,
            available_date,
            pickup_time,
            description
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;


    db.query(
        sql,
        [
            food_name,
            quantity,
            location,
            food_type,
            available_date,
            pickup_time,
            description
        ],
        (err, result) => {

            if (err) {

                console.log(
                    "Donation error:",
                    err
                );

                return res.send(
                    "Donation failed. Please check the terminal."
                );
            }


            res.send(`

                <!DOCTYPE html>

                <html>

                <head>

                    <meta charset="UTF-8">

                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1.0"
                    >

                    <title>
                        Donation Successful
                    </title>

                    <style>

                        body {

                            font-family: Arial, sans-serif;

                            background: #e8f5e9;

                            display: flex;

                            justify-content: center;

                            align-items: center;

                            min-height: 100vh;

                        }

                        .success {

                            background: white;

                            padding: 40px;

                            border-radius: 20px;

                            text-align: center;

                            box-shadow:
                                0 10px 30px
                                rgba(0,0,0,0.1);

                        }

                        h1 {

                            color: #2e7d32;

                        }

                        a {

                            display: inline-block;

                            margin-top: 20px;

                            padding: 12px 25px;

                            background: #2e7d32;

                            color: white;

                            text-decoration: none;

                            border-radius: 25px;

                        }

                    </style>

                </head>


                <body>

                    <div class="success">

                        <h1>
                            Food Donation Successful! 🎉
                        </h1>

                        <p>
                            Thank you for helping someone in need.
                        </p>

                        <a href="/donor">
                            Back to Donor Dashboard
                        </a>

                    </div>

                </body>

                </html>

            `);

        }
    );

});


// ================= DONOR DASHBOARD =================

app.get("/donor", (req, res) => {

    if (!req.session.user) {

        return res.redirect("/login");

    }


    if (req.session.user.role !== "donor") {

        return res.redirect("/receiver");

    }


    res.sendFile(
        path.join(__dirname, "public", "donor.html")
    );

});


// ================= RECEIVER DASHBOARD =================

app.get("/receiver", (req, res) => {

    if (!req.session.user) {

        return res.redirect("/login");

    }


    if (req.session.user.role !== "receiver") {

        return res.redirect("/donor");

    }


    res.sendFile(
        path.join(__dirname, "public", "receiver.html")
    );

});


// ================= LOGOUT =================

app.get("/logout", (req, res) => {

    req.session.destroy((err) => {

        if (err) {

            console.log(
                "Logout error:",
                err
            );

            return res.send(
                "Logout failed."
            );

        }

        res.redirect("/login");

    });

});


// ================= MY DONATIONS =================

app.get("/my-donations", (req, res) => {

    if (!req.session.user) {

        return res.redirect("/login");

    }


    if (req.session.user.role !== "donor") {

        return res.redirect("/receiver");

    }


    const sql = `
        SELECT *
        FROM donations
        ORDER BY id DESC
    `;


    db.query(
        sql,
        (err, donations) => {

            if (err) {

                console.log(
                    "Error fetching donations:",
                    err
                );

                return res.send(
                    "Could not load donations."
                );

            }


            let donationHTML = "";


            if (donations.length === 0) {

                donationHTML = `

                    <div class="empty">

                        <h2>
                            No Donations Yet 📦
                        </h2>

                        <p>
                            You have not donated any food yet.
                        </p>

                    </div>

                `;

            } else {

                donations.forEach((donation) => {

                    donationHTML += `

                        <div class="donation-card">

                            <h2>
                                🍱 ${donation.food_name}
                            </h2>

                            <p>
                                <strong>
                                    Quantity:
                                </strong>

                                ${donation.quantity}
                            </p>

                            <p>
                                <strong>
                                    Food Type:
                                </strong>

                                ${donation.food_type}
                            </p>

                            <p>
                                <strong>
                                    Pickup Location:
                                </strong>

                                ${donation.location}
                            </p>

                            <p>
                                <strong>
                                    Available Date:
                                </strong>

                                ${donation.available_date}
                            </p>

                            <p>
                                <strong>
                                    Pickup Time:
                                </strong>

                                ${donation.pickup_time}
                            </p>

                            <p>
                                <strong>
                                    Description:
                                </strong>

                                ${donation.description || "No description"}
                            </p>

                        </div>

                    `;

                });

            }


            res.send(`

                <!DOCTYPE html>

                <html>

                <head>

                    <meta charset="UTF-8">

                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1.0"
                    >

                    <title>
                        My Donations | FoodShare Nepal
                    </title>

                    <style>

                        * {

                            margin: 0;

                            padding: 0;

                            box-sizing: border-box;

                        }


                        body {

                            font-family: Arial, sans-serif;

                            background:
                                linear-gradient(
                                    135deg,
                                    #e8f5e9,
                                    #ffffff
                                );

                            min-height: 100vh;

                            padding: 40px 20px;

                        }


                        .container {

                            max-width: 900px;

                            margin: auto;

                        }


                        h1 {

                            text-align: center;

                            color: #2e7d32;

                            margin-bottom: 30px;

                        }


                        .donation-card {

                            background: white;

                            padding: 25px;

                            margin-bottom: 20px;

                            border-radius: 15px;

                            box-shadow:
                                0 8px 25px
                                rgba(0,0,0,0.08);

                        }


                        .donation-card h2 {

                            color: #2e7d32;

                            margin-bottom: 15px;

                        }


                        .donation-card p {

                            color: #555;

                            margin: 8px 0;

                        }


                        .empty {

                            background: white;

                            padding: 40px;

                            text-align: center;

                            border-radius: 15px;

                        }


                        .empty p {

                            color: #777;

                            margin-top: 10px;

                        }


                        .back {

                            display: block;

                            width: fit-content;

                            margin: 30px auto;

                            padding: 12px 25px;

                            background: #2e7d32;

                            color: white;

                            text-decoration: none;

                            border-radius: 25px;

                        }

                    </style>

                </head>


                <body>

                    <div class="container">

                        <h1>
                            My Donations 📦
                        </h1>

                        ${donationHTML}

                        <a
                            href="/donor"
                            class="back"
                        >
                            ← Back to Dashboard
                        </a>

                    </div>

                </body>

                </html>

            `);

        }
    );

});


// ================= LOGIN PAGE =================

app.get("/login", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "login.html")
    );

});


// ================= LOGIN ATTEMPT SECURITY =================

const loginAttempts = {};

const MAX_ATTEMPTS = 3;

const LOCK_TIME = 60 * 1000;


// ================= LOGIN USER =================

app.post("/login", (req, res) => {

    const {
        email,
        password
    } = req.body;


    // ================= CHECK LOCK =================

    const attempt = loginAttempts[email];


    if (
        attempt &&
        attempt.lockUntil > Date.now()
    ) {

        const remainingSeconds = Math.ceil(
            (attempt.lockUntil - Date.now()) / 1000
        );


        return res.send(`

            <h1>
                Too Many Attempts! 🔒
            </h1>

            <p>
                Too many incorrect login attempts.
            </p>

            <p>
                Please try again after
                <strong>
                    ${remainingSeconds} seconds.
                </strong>
            </p>

            <a href="/login">
                Back to Login
            </a>

        `);

    }


    const sql = `

        SELECT *

        FROM users

        WHERE email = ?
        AND password = ?

    `;


    db.query(
        sql,
        [email, password],
        (err, results) => {

            if (err) {

                console.log(
                    "Login error:",
                    err
                );

                return res.send(
                    "Login failed. Please check the terminal."
                );

            }


            // ================= WRONG LOGIN =================

            if (results.length === 0) {

                if (!loginAttempts[email]) {

                    loginAttempts[email] = {

                        count: 0,

                        lockUntil: 0

                    };

                }


                loginAttempts[email].count++;


                const attemptsLeft =
                    MAX_ATTEMPTS -
                    loginAttempts[email].count;


                // ================= LOCK ACCOUNT =================

                if (
                    loginAttempts[email].count >=
                    MAX_ATTEMPTS
                ) {

                    loginAttempts[email].lockUntil =
                        Date.now() + LOCK_TIME;


                    loginAttempts[email].count = 0;


                    return res.send(`

                        <h1>
                            Account Temporarily Locked 🔒
                        </h1>

                        <p>
                            You entered the wrong email
                            or password too many times.
                        </p>

                        <p>
                            Please wait
                            <strong>
                                60 seconds
                            </strong>
                            before trying again.
                        </p>

                        <a href="/login">
                            Back to Login
                        </a>

                    `);

                }


                return res.send(`

                    <h1>
                        Invalid Login ❌
                    </h1>

                    <p>
                        Invalid email or password!
                    </p>

                    <p>
                        Attempts remaining:
                        <strong>
                            ${attemptsLeft}
                        </strong>
                    </p>

                    <a href="/login">
                        Try Again
                    </a>

                `);

            }


            // ================= SUCCESSFUL LOGIN =================

            delete loginAttempts[email];


            const user = results[0];


            console.log(
                "User logged in:",
                user.email
            );


            // ================= SAVE USER IN SESSION =================

            req.session.user = {

                id: user.id,

                name: user.name,

                email: user.email,

                role: user.role

            };


            // ================= ROLE REDIRECT =================

            if (user.role === "donor") {

                return res.redirect("/donor");

            }


            if (user.role === "receiver") {

                return res.redirect("/receiver");

            }


            return res.redirect("/");

        }

    );

});


// ================= REGISTER PAGE =================

app.get("/register", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "register.html")
    );

});


// ================= REGISTER USER =================

app.post("/register", (req, res) => {

    const {
        name,
        email,
        phone,
        location,
        password,
        confirmPassword,
        role
    } = req.body;


    // ================= CHECK PASSWORD =================

    if (password !== confirmPassword) {

        return res.send(
            "Passwords do not match!"
        );

    }


    const userRole =
        role || "receiver";


    // ================= INSERT USER =================

    const sql = `

        INSERT INTO users
        (
            name,
            email,
            phone,
            location,
            password,
            role
        )

        VALUES (?, ?, ?, ?, ?, ?)

    `;


    db.query(
        sql,
        [
            name,
            email,
            phone,
            location,
            password,
            userRole
        ],
        (err, result) => {

            if (err) {

                console.log(
                    "Registration error:",
                    err
                );

                return res.send(
                    "Registration failed. Please check the terminal."
                );

            }


            // ================= SAVE NEW USER =================

            req.session.user = {

                id: result.insertId,

                name: name,

                email: email,

                role: userRole

            };


            // ================= ROLE REDIRECT =================

            if (userRole === "donor") {

                return res.redirect("/donor");

            }


            if (userRole === "receiver") {

                return res.redirect("/receiver");

            }


            return res.redirect("/");

        }

    );

});


// ================= START SERVER =================

app.listen(
    PORT,
    () => {

        console.log(
            `Server is running at http://localhost:${PORT}`
        );

    }
);