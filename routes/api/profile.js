const express = require("express");
const request = require("request");
const config = require('config');
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require("../../models/User");
const { check, validationResult } = require('express-validator');



const router = express.Router();
// @route api/profile/me
// Get current user profile
// @access Private
router.get('/me', auth, async (req, res) => {
  try {

    console.log(req.user.id)
    const profile = await Profile.findOne({user: req.user.id}).populate('user', ['name', 'avatar']);
    if (!profile) {
      return res.status(400).json({msg: 'Profile Not found'});
    }

    res.json(profile)

  } catch(err) {
    console.error(err.message);
    res.status(500).json({msg: 'Server Error'});

  }

})


// @route POST api/profile
// create or update user profile
// @access Private

router.post('/', [auth, [
      check('status', 'Status is required').not().isEmpty(),
      check('skills', 'Skills is required').not().isEmpty()
    ]],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const {
        company,
        website,
        location,
        status,
        skills,
        bio,
        githubusername,
        youtube,
        twitter,
        facebook,
        linkedin,
        instagram
        } = req.body;


      // Build profile object
      const profileFileds = {}

      profileFileds.user = req.user.id
      if (company) profileFileds.company = company;
      if (website) profileFileds.website = website;
      if (location) profileFileds.location = location;
      if (status) profileFileds.status = status;
      if (bio) profileFileds.bio = bio;
      if (githubusername) profileFileds.githubusername = githubusername;
      if (skills) {
        profileFileds.skills = skills.split(',').map( skill => skill.trim());

      }

      // build social object
      profileFileds.social = {}
      if(facebook) profileFileds.social.facebook = facebook;
      if(youtube) profileFileds.social.youtube = youtube;
      if(twitter) profileFileds.social.twitter = twitter;
      if(linkedin) profileFileds.social.linkedin = linkedin;
      if(instagram) profileFileds.social.instagram = instagram;




      try{
        let profile = await Profile.findOne({user: req.user.id});
        if(profile) {
          // update profile
          profile = await Profile.findOneAndUpdate(
            {user: req.user.id},
            {$set: profileFileds},
            {new: true}
          );
          return res.json(profile);
        }
        // create profile
        profile = new Profile(profileFileds)
        await profile.save();
        res.json(profile);
      }catch(err) {
        console.error(err.message);
        res.status(500).send('server error');

      }
    }
  )

// @route GET api/profiles
// Get all profiles
// @access Public

router.get('/', async (req, res) => {

  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);

  }catch(err){
    console.error(err.message);
    res.status(500).send('server error');

  }
})

// @route GET api/profile/user/:user_id
// Get profile from user id
// @access Public

router.get('/user/:user_id', async (req, res) => {

  try {
    const profile = await Profile.findOne({user: req.params.user_id}).populate('user', ['name', 'avatar']);
    if (!profile) return res.send(400).json({msg: 'There in no profile'})
    res.json(profile);

  }catch(err){
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      //*** issue with return need to fix it
      return res.send(400).json({msg: 'There in no profile'})
      //res.status(400).send('There in no profile');
    }
    res.status(500).send('server error');

  }
})


// @route delete api/profile
// delet profile, user & post
// @access Private

router.delete('/', auth,async (req, res) => {

  try {
    // @todo users posts
    // Remove Profile
    await Profile.findOneAndRemove({user: req.user.id});
    // Remove user
    await User.findOneAndRemove({_id: req.user.id});
    res.json({msg: 'user deleted'});

  }catch(err){
    console.error(err.message);
    res.status(500).send('server error');

  }
})


// @route put api/profile/experience
// update profile experience
// @access Private

router.put('/experience', [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'from is required').not().isEmpty(),
    check('current', 'Current is required').not().isEmpty()
  ]], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const {
    title,
    company,
    location,
    from,
    to,
    current,
    description
  } = req.body;

  const newExp = {
    title,
    company,
    location,
    from,
    to,
    current,
    description
  }

  try{
    const profile = await Profile.findOne({user: req.user.id});

    profile.experience.unshift(newExp);
    await profile.save();
    res.json(profile)
  } catch(err) {
    console.error(err.message);
    res.status(500).send('server error');
  }


})


// @route delet api/profile/experience/:exp_id
// delete profile experience
// @access Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({user: req.user.id});
    // get remove index
    const removeIndex = profile.experience.map(exp => exp.id).indexOf(req.params.exp_id);
    profile.experience.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch(err) {
    console.error(err.message);
    res.status(500).send('server error');
  }


})


// @route put api/profile/education
// update profile education
// @access Private

router.put('/education', [auth, [
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'degree is required').not().isEmpty(),
    check('fieldofstudy', 'fieldofstudy is required').not().isEmpty(),
    check('current', 'Current is required').not().isEmpty(),
    check('from', 'from is required').not().isEmpty()
  ]], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const {
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description
  } = req.body;

  const newEdu = {
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description
  }

  try{
    const profile = await Profile.findOne({user: req.user.id});

    profile.education.unshift(newEdu);
    await profile.save();
    res.json(profile)
  } catch(err) {
    console.error(err.message);
    res.status(500).send('server error');
  }


})

// @route delete api/profile/education/:edu_id
// delete profile education
// @access Private

router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({user: req.user.id});
    // get remove index
    const removeIndex = profile.education.map(edu => edu.id).indexOf(req.params.edu_id);
    profile.education.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch(err) {
    console.error(err.message);
    res.status(500).send('server error');
  }


})


// @route GET api/profile/github/:username
// git github repository
// @access Public

router.get('/github/:username', async (req, res) => {

  try {

      const options = {
         uri: `https://api.github.com/users/${
          req.params.username
        }/repos?per_page=5&sort=created:asc&client_id=${
          config.get('githubClientId')
        }&client_secret=${
          config.get('githubSecret')
        }`,
        method: 'GET',
        headers: {'user-agent': 'node.js'}
      };

      request(options, (error, response, body) => {
        if (error) console.error(error)
        if(response.statusCode !== 200) {
          return res.status(400).json({msg: 'No github profile found'})
        }
        res.send(JSON.parse(body));
      })


    } catch(err) {
      console.error(err.message);
      res.status(500).send('server error');
    }

})


module.exports = router;