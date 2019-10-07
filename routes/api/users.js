const express = require("express");

const router = express.Router();
const { check, validationResult } = require('express-validator');

// @route POST api/users
// @desc Register user
// @access public
router.post('/', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please enter a valid email').isEmail(),
  check('password', 'Password should be of minimum 6 characters').isLength({ min: 6 })

	],(req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
	res.send('Users route')
});

module.exports = router;