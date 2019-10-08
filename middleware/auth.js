const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {
  // Get Token from header
  const token = req.header('x-auth-token');
  // check if no token

  if(!token) {
  	return res.status(401).json({msg: 'No token, authorization denied'});
  }

  // verify token

  try {
    const decode = jwt.verify(token, config.get('jwtSecret'));
    req.user = decode.user;
    next();

  }
  catch {
  	return res.status(401).json({msg: 'Token not valid'});

  }
}