var redis = require('redis');
var shrtn = require('shrtn');

shrtn.config.set('redis client', redis.createClient());

shrtn.shorten('http://google.com/', function(response){
  if (response.status === 'OK'){
    console.log(response.id); 
  }
});
