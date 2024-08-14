const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    {
        username: "testuser",
        password: "testpassword"
    }
];

const isValid = (username) => { 
    return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
}

regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign(
            { data: username },
            "SHYAMP",  // Secret key used to sign the token
            { expiresIn: '1h' }
        );

        req.session.token = accessToken;  // Save the token in the session
        return res.status(200).json({ message: "User successfully logged in", accessToken });
    } else {
        return res.status(401).json({ message: "Invalid Username or Password" });
    }
});

regd_users.put("/auth/review/:isbn", (req, res) => {
 const isbn = req.params.isbn;
    const { review } = req.query;
    const username = req.user.data;

    if (!review) {
        return res.status(400).json({ message: "Review text is required" });
    }

    if (books[isbn]) {
        let book = books[isbn];
        let userReview = book.reviews.find(r => r.username === username);
        
        if (userReview) {
            userReview.review = review; 
        } else {
            book.reviews.push({ username, review }); 
        }

        return res.status(200).json({ message: "Review added/modified successfully" });
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.data;

    if (books[isbn]) {
        let book = books[isbn];
        let reviewIndex = book.reviews.findIndex(r => r.username === username);

        if (reviewIndex !== -1) {
            book.reviews.splice(reviewIndex, 1);
            return res.status(200).json({ message: "Review deleted successfully" });
        } else {
            return res.status(404).json({ message: "Review not found" });
        }
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
