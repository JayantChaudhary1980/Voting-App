const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Candidate = require('../models/candidate');
const {jwtAuthMiddleware, generateToken} = require('../jwt'); // Importing from jwt.js

// Adding or deleting a candidate is done by admin only.
// So for that.. check the userID to confirm that it is the admin
const checkAdminRole = async (userID) => {
  try{
    const user = await User.findById(userID);
    if(user.role === 'admin')
      return true;
  } catch (err) {
    return false;
  }
}

// POST route to add a candidate
router.post('/', jwtAuthMiddleware, async (req, res) => {
  try{
    if(! await checkAdminRole(req.user.id)){ // Check if its the admin
      return res.status(403).json({message: 'User does not have admin role'})
    }
    const data = req.body; // Assuming the request body conatains the candidate data
    const newCandidate = new Candidate(data);
    const response = await newCandidate.save()
    console.log('data saved')
    res.status(200).json({response: response})
  } catch(err) {
    console.log(err)
    res.status(500).json({error: 'Internal server error'})
  }
})

// Put Method
router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => { // Iss route ko access karne k liye hame token chahiye hoga -- aur token agar invalid hoga.. to hum already usko access nhi kar payenge. Agar token valid hoga.. then definitely hamare paas koi user present hoga us id k saath. Ye id uske payload me hai.
  try {
    if(! await checkAdminRole(req.user.id))
      return res.status(403).json({message: 'User does not have admin role'})
    
    const candidateID = req.params.candidateID; // Extract the id from the URL parameter
    const updatedCandidateData = req.body;
    
    const response = await Candidate.findByIdAndUpdate(
      candidateID,
      updatedCandidateData,
      { new: true, runValidators: true }
    );
    
    if (!response) {
      return res.status(403).json({ error: 'Candidate not found' });
    }

    console.log('Candidate Data Updated!')
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Delete Method
router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => { // Iss route ko access karne k liye hame token chahiye hoga -- aur token agar invalid hoga.. to hum already usko access nhi kar payenge. Agar token valid hoga.. then definitely hamare paas koi user present hoga us id k saath. Ye id uske payload me hai.
  try {
    if(! await checkAdminRole(req.user.id))
      return res.status(403).json({message: 'User does not have admin role'})
    
    const candidateID = req.params.candidateID; // Extract the id from the URL parameter

    const response = await Candidate.findByIdAndDelete(
      candidateID);
      
      if (!response) {
        return res.status(403).json({ error: 'Candidate not found' });
    }
    
    console.log('Candidate Deleted!')
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// HW:
// Use update and delete functionality
// Also have sure that there exists only one admin

// Let's start voting
router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
  // No admin can vote
  // User can vote only once

  candidateID = req.params.candidateID;
  userID = req.user.id;

  try{
    // Find the candidate document with the specified candidateID
    const candidate = await Candidate.findById(candidateID);
    if(!candidate){
      return res.status(404).json({message: 'Candidate not found'})
    }

    const user = await User.findById(userID);
    if(!user){
      return res.status(404).json({message: 'User not found'});
    }
    if(user.isVoted){
      res.status(400).json({message: 'You have already voted'});
    }
    if(user.role == 'admin'){
      res.status(403).json({message: 'Admin is not allowed to vote'});
    }

    // Update the candidate document to record the vote
    candidate.votes.push({user: userID})
    candidate.voteCount++;
    await candidate.save();

    // Update the user document
    user.isVoted = true;
    await user.save();

    res.status(200).json({message: 'Vote recorded Successfully'})
  }catch(err){
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

// Vote Count
// We need kis party ko kitne votes mile. AUr wo sorted order mei chahiye.. jise jyada votes -> wo pehle
router.get('/vote/count', async (req, res) => {
  try {
    const candidate = await Candidate.find().sort({voteCount: 'desc'}); // all candidate records will be stored in 'candidate' ans sort them by voteCount in descending  order

    // Map the candidates to only return their name and voteCount
    const voteRecord = candidate.map((data) => {
      return{
        party: data.party, // party name
        count: data.voteCount // vote count
      }
    });

    return res.status(200).json(voteRecord);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

// get list of candidates
router.get('/', async (req, res) => {
  try {
    // list of candidates
    const candidate = await Candidate.find();

    // Map
    const candidateList = candidate.map((data) => {
      return{
        name: data.name,
        age: data.age
      }
    });

    return res.status(200).json(candidateList);
    
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

module.exports = router;