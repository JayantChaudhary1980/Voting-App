const mongoose = require('mongoose');

const mongoURL = process.env.MONGO_DB_LOCAL;
mongoose.connect(mongoURL);

const db = mongoose.connection;

db.on('connected', () => {
    console.log('MongoDB connected');
});
db.on('error', (err) => {
    console.log('MongoDB connection error:', err);
});
db.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

module.exports = db;
