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

  shrtn.config.set('redis client', redis.createClient());

  var shortId = '';

  // shortening
  shrtn.shorten('http://google.com', function(response){
    if(response.status === 'OK'){
      shortId = response.shortId;
      console.log(response.long + ' -> ' + response.shortId);
    }
  });

  // expanding
  shrtn.expand(shortId, function(response){
    if (response.status === 'OK'){
      console.log(shortId + ' -> ' + response);
    }
  });
