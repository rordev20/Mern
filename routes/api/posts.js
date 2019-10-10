const express = require("express");

const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const User = require('../../models/User');
const Profile = require('../../models/Profile');

// @route post api/posts
// @desc create a post
// @access private
router.post('/', [auth, [
    check('text', 'Text is required').not().isEmpty(),
    check('name', 'Name is required').not().isEmpty()
	]], async (req, res) => {
		const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');
	    const newPost = {
	      text: req.body.text,
	      name: user.name,
	      avatar: user.avatar,
	      user: req.user.id
	    }

	    const post = new Post(newPost)
	    await post.save()
	    res.send(post);

    } catch(err) {
    	console.error(err.message);
      res.status(500).send('server error');
    }
});


// @route get api/posts
// @desc get all post
// @access private

router.get('/', auth,async (req, res) => {
  try {
    const posts = await Post.find().sort({date: -1})
    res.json(posts);

  }catch(err){
    console.error(err.message);
    res.status(500).send('server error');

  }
})

// @route GET api/post/:id
// Get post from id
// @access Private

router.get('/:id', auth, async (req, res) => {

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.send(400).json({msg: 'There in no post'})
    res.json(post);

  }catch(err){
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      //*** issue with return need to fix it
      return res.send(400).json({msg: 'There in no post'})
      //res.status(400).send('There in no profile');
    }
    res.status(500).send('server error');

  }
})

// @route delete api/posts/:id
// delete post
// @access Private

router.delete('/:id', auth, async (req, res) => {

  try {
    // @todo delete post/:id
    const post = await Post.findById(req.params.id);

    if(post.user.toString() !== req.user.id) {
    	console.log('I am here')
    	return res.status(401).json({msg: 'User not authorized'})
    }
    await post.remove();
    res.json({msg: 'post deleted'});

  }catch(err){
    console.error(err.message);
    res.status(500).send('server error');

  }
})

module.exports = router;