const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    party: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    /* OUR CANDIDATE DATA WILL LOOK SOMETHING LIKE THIS
    {
        "name": "Narendra Modi
        "party": "BJP",
        "age": 71,
        "votes": [
            {
                "user": "611f71320e8f3e001f4e4ef6",
                "votedAt": "2024-02-20T08:00:00.000Z"
            },
            {
                "user": "611f71440e8f3e001f4e4ef8",
                "votedAt": "2024-02-20T08:15:00.000Z"
            }
        ],
        "votecount": 2
    }
    */
    votes: [ // We have to store the data of the person jisne jisne vote diya. Hum uss voter ka pura ka pura data store nahi karenge.. Hum log array of data (Objects store honge) banaenge: user -> 'id' of that user, vote time.
        {
            user:{
                type: mongoose.Schema.Types.ObjectId, // ye mongoDB jo 'id' provide karta hai (at the time of creation of any record) --> Hum uss 'id' ko store karne waale hai
                ref: 'User', // Iska reference user table se aayega
                required: true
            },
            votedAt:{ // Jab bhi hum 'votes' k andar data/object ko save karenge. Wo automatically uss current timestamp ko save kar lega
                type: Date, // mongoose khud ke 'Date' data type provide karta hai
                default: Date.now
            }
        }
    ],
    voteCount: { // The number of objects in the 'votes' array is the voteCount
        type: Number,
        default: 0
    }
});

const Candidate = mongoose.model('Candidate', candidateSchema);
module.exports = Candidate;