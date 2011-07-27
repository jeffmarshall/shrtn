var shrtn = require('../');
var redis = require('redis');

var redisClient = redis.createClient();

console.log('Shortening "http://google.com"');
shrtn.shorten('http://google.com', redisClient, function(error, result){
  if(!error){
    console.log('Short Id: '+ result.shortId);
  } else {
    console.log('There was an error: \n', error);
  }
});
