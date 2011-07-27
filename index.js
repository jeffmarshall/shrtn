var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
var config = {};

config.keyLength = 1;
config.chars = chars;


function Config(){
  var config = {
    keyLength: 1,
    chars: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  };

  this.set = function(key, value){
    config[key] = value;
    return true;
  }

  this.get = function(key){
    if(key in config){
      return config[key];
    } else {
      console.error('Configuration not set: '+ key);
    }
  }
}


function generateId(redis_client, callback){
  var id = '';

  // check for the number of existing keys
  redis_client.keys('*', function(error, response){
    // while half of the number of possible random keys
    // is less than the number of keys set, increase the
    // number of random keys possible
    
    while(Math.pow(config.chars.length, config.keyLength)/2 < response.length){
      config.keyLength ++;
    }

    for (var i=0; i < config.keyLength; i++){
      id += config.chars[Math.floor(Math.random() * config.chars.length)];
    }

    callback(id);
  });
}


function shorten(long, redis_client, callback){
  generateId(redis_client, function(new_id){
    redis_client.setnx(new_id, long, function(err, res){
      if(res){
        var response = {
          'status': 'OK',
          'shortId': new_id,
          'long': long
        }
        callback(false, response);

      } else {
        // the attempted ID is taken
        shorten(long, callback);
      }
    });
  });
}


function expand(short, redis_client, callback){
  console.log('expanding:', short);
  redis_client.get(short, function(err, response){
    if (!err && response){
      callback(false, response.toString());
    } else {
      callback(err);
    }
  });
}


module.exports = {
  config: new Config(),
  generateId: generateId,
  shorten: shorten,
  expand: expand
}
