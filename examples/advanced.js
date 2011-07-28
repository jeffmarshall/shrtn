var redis = require('redis');
var shrtn = require('shrtn');

shrtn.config.set('redis client', redis.createClient());

// the 'chars' configuration determines what characters 
// can be used in keys. The following setting limits
// newly generated keys to digits
shrtn.config.set('chars', '1234567890');

// this configuration sets the length of keys generated.
// Note that this number will increase as available keys 
// of this length become more scarce
shrtn.config.set('key length', 6);

// config allows you to set any configurations you want.
// config.get will attempt to get the first argument, 
// but will return the second if the first isn't found.
shrtn.config.set('any key', 'whatever value');
var someKey = shrtn.config.get('some key', 'fallback value'); // < 'fallback value'


shrtn.shorten('http://google.com/', function(response){
  if (response.status === 'OK'){
    console.log(response.long +' -> '+response.id); // should be 6 random digits
  }
});


shrtn.on('shortened', function(shortened_response){
  shrtn.expand(shortened_response.id, function(expanded_response){
    console.log(expanded_response.id +' -> '+ expanded_response.long);
  });
});
