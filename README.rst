Low-Fat URL Shortening for Node.js
==================================

Requirements:

- node.js
- redis


Usage
-----

::
  var redis = require('redis');
  var shrtn = require('shrtn');

  var redisClient = redis.createClient();
  var shortId = '';

  // shortening
  shrtn.shorten('http://google.com', redisClient, function(error, response){
    if(!error){
      shortId = response.shortId;
      console.log(response.long + " -> " + response.shortId);
    }
  });

  // expanding
  shrtn.expand(shortId, redisClient, function(error, response){
    if (!error){
      console.log(shortId + ' -> ' + response);
    }
  });
