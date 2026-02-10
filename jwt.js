const { request } = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const jwtAuthMiddleware = (req, res, next) => {
    try {
        // First check request headers has authorization or not
        const authorization = req.headers.authorization
        if (!authorization) return res.status(401).json({ error: 'Token Not Found' })

        const token = req.headers.authorization.split(' ')[1];
        if (!token) return res.this.status(401).json({ error: 'Unauthorized' })
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user information to the request object
        req.user = decoded;
        next();
    } catch (err) {
        console.log(err);
        res.status(401).json({ error: 'Invalid token' });
    }
}

//  Now lets make a function to generate JWT token
const generateToken = (userData) => {
    // Generate a new JWT token using user data
    return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: 30000 });
}

// Export the middleWare  as well as the function
module.exports = { jwtAuthMiddleware, generateToken };