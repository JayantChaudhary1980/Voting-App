const express = require('express');
require('dotenv').config();
const app = express();
const db = require('./db');
const PORT = process.env.PORT || 3000;

const bodyParser = require('body-parser');
app.use(bodyParser.json()); // req.body

// Import the router files
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

// Use the routers
app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
