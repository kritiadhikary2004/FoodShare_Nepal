const mysql = require("mysql2");
const express = require("express");
const path = require("path");

const app = express();

const PORT = 3000;

// ================= DATABASE =================

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "foodshare_db"
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

app.use(express.urlencoded({ extended: true }));


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
    res.sendFile(
        path.join(__dirname, "public", "donate.html")
    );
});


// ================= SAVE DONATION =================

app.post("/donate", (req, res) => {

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
                console.log("Donation error:", err);

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

                    <title>Donation Successful</title>

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
    res.sendFile(
        path.join(__dirname, "public", "donor.html")
    );
});


// ================= MY DONATIONS =================

app.get("/my-donations", (req, res) => {

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
                                <strong>Quantity:</strong>
                                ${donation.quantity}
                            </p>

                            <p>
                                <strong>Food Type:</strong>
                                ${donation.food_type}
                            </p>

                            <p>
                                <strong>Pickup Location:</strong>
                                ${donation.location}
                            </p>

                            <p>
                                <strong>Available Date:</strong>
                                ${donation.available_date}
                            </p>

                            <p>
                                <strong>Pickup Time:</strong>
                                ${donation.pickup_time}
                            </p>

                            <p>
                                <strong>Description:</strong>
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
// ================= LOGIN USER =================

app.post("/login", (req, res) => {

    const { email, password } = req.body;

    const sql = `
        SELECT *
        FROM users
        WHERE email = ? AND password = ?
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

            if (results.length === 0) {

                return res.send(
                    "Invalid email or password!"
                );
            }

            const user = results[0];

            console.log(
                "User logged in:",
                user.email
            );

            // ================= DONOR =================

            if (user.role === "donor") {

                return res.redirect("/donor");
            }

            // ================= RECEIVER =================

            if (user.role === "receiver") {

                return res.send(`
                    <h1>
                        Welcome ${user.name}! 🎉
                    </h1>

                    <p>
                        You are logged in successfully.
                    </p>

                    <a href="/">
                        Go to Home
                    </a>
                `);
            }

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

    const userRole = role || "receiver";

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

            // ================= DONOR =================

            if (userRole === "donor") {

                return res.redirect(
                    "/donor"
                );
            }

            // ================= RECEIVER =================

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
                        Registration Successful
                    </title>

                </head>

                <body>

                    <h1>
                        Registration Successful! 🎉
                    </h1>

                    <p>
                        Welcome to FoodShare Nepal.
                    </p>

                    <a href="/">
                        Go to Home
                    </a>

                </body>

                </html>

            `);
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