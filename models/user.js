const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    mobile: String,
    email: {
        type: String,
    },
    address: {
        type: String, 
        required: true
    },
    aadharCardNumber: {
        type: Number,
        required: true,
        unique: true
    }, 
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['voter', 'admin'],
        default: 'voter'
    },
    isVoted: {
        type: Boolean,
        default: false
    }
});

// ✅ Modern Mongoose code [Only the .pre()] :
userSchema.pre('save', function () {
    const user = this;

    // Hash the password only if it has been modified (or it is new)
    if (!user.isModified('password')) return;

    const salt = bcrypt.genSaltSync(10); // hash password generation
    // hash password
    const hashedPassword = bcrypt.hashSync(user.password, salt);
    // Override the plain password with the hashed one
    user.password = hashedPassword;
});

// comparePassword()
userSchema.methods.comparePassword = async function(candidatePassword){
    try{
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    } catch(err) {
        throw err;
    }
}

const User = mongoose.model('User', userSchema);
module.exports = User;
