Low-Fat URL Shortening for Node.js
==================================

Requirements:

- node.js
- redis


Installation
------------

::

  cd /path/to/shrtn
  npm install

or with NPM:

``npm install shrtn``


Usage
-----

::

  var redis = require('redis');
  var shrtn = require('shrtn');

  shrtn.config.set('redis client', redis.createClient());

  var id;

  // shortening
  shrtn.shorten('http://google.com', function(response){
    if(response.status === 'OK'){
      id = response.id;
      console.log(response.long + ' -> ' + response.id);
    }
  });

  // expanding
  shrtn.expand(id, function(response){
    if (response.status === 'OK'){
      console.log(id + ' -> ' + response);
    }
  });
