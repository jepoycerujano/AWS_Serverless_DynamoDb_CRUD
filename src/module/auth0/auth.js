const axios = require('axios');
const getToken = require('./getToken');
const verifyToken = require('./verifyToken');

exports.handler = (event, context, callback) => {
  const token = getToken(event);
  const idToken = verifyToken(token);
  const userInfo = 
};
