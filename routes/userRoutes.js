const express = require('express');
const router = express.Router();
const User = require('../models/user');
const {jwtAuthMiddleware, generateToken} = require('./../jwt'); // Importing from jwt.js

// POST route
router.post('/signup', async (req, res) => { // signup for the first time
    try{
        const data = req.body;
        const newUser = new User(data);

        const response = await newUser.save();
        console.log('data saved');

        const payload = {
            id: response.id,
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
        console.log("Token is: ", token);
        res.status(200).json({response: response, token: token});
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error!'})
    }
})

// Now login after signup
router.post('/login', async (req, res) => {
  try {
    // Extract the aadharCardNumber and password from request body
    const {aadharCardNumber, password} = req.body; // req.body se hame aadharCardNumber and password mil gaya

    // Now hamara kaam is to check ki aadharCardNumber hamare database me hai ki nahi 
    // Find the user by aadharCardNumber
    const user = await User.findOne({aadharCardNumber: aadharCardNumber})

    // If user does not exist or password does not match, return error
    if(!user || !(await user.comparePassword(password))){
      return res.status(401).json({error: 'Invalid aadharCardNumber or password'});
    }

    // If username and password are correct then generate Token
    const payload = {
      id : user.id,
    }
    const token = generateToken(payload);

    // Token mil gaya to... return token as a response
    res.json({token})
  } catch (err) {
    console.log(err);
    res.status(500).json({error: 'Internal Server Error'});
  }
})

// User want to see their profile so that he can change his password
router.get('/profile', jwtAuthMiddleware, async (req,res) => {
  try{
    const userData = req.user; // user naam ki key k andar hamari decoded value jwt middleware ne store ki thi.
    console.log('User Data: ', userData)
    // iss userData me uski id bhi present hai to.. is id k through hum person ka data find karenge
    const userId = userData.id;
    const user = await User.findById(userId);
    res.status(200).json({user});
  } catch (err) {
    console.log(err);
    res.status(500).json({error: 'Internal Server Error'});
  }
})

// Koi bhi user agar password change kare to:
router.put('/profile/password', jwtAuthMiddleware, async (req, res) => { // Iss route ko access karne k liye hame token chahiye hoga -- aur token agar invalid hoga.. to hum already usko access nhi kar payenge. Agar token valid hoga.. then definitely hamare paas koi user present hoga us id k saath. Ye id uske payload me hai.
  try {
    const userId = req.user.id; // Extract the id from the ## token ## --- search the meaning of this line on ChatGPT
    const {currentPassword, newPassword} = req.body; // Extract the current and new password from request body
    // Just like when we change a password... it asks for our old as well as new password
    
    // Find the user by userID
    const user = await User.findById(userId);

    // Now we have to check if the password match
    // If password does not match, then return error
    if(!(await user.comparePassword(currentPassword))){
      return res.status(401).json({error: 'Invalid username or password'});
    }

    // Agar jo mera purana/current password sahi hai to...
    // Update the user's password
    user.password = newPassword;
    await user.save();

    console.log('Password Updated')
    res.status(200).json({message: "Password Updated"});
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;