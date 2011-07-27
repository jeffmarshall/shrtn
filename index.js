var redis = require('redis');

function Config(){
  var config = {
    'key length': 1,
    'chars': 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  };

  this.set = function(key, value){
    config[key] = value;
    return true;
  }

  this.get = function(key, fallback){
    if(key in config){
      return config[key];
    } else {
      return fallback ? fallback : undefined;
    }
  }
}

var config = new Config();

function getRedisClient(){
  var client = config.get('redis client');
  if (!(client instanceof redis.RedisClient)){
    throw "Please configure shrtn's redis client using something like shrtn.config.set('redis client', redis.createClient())";
  } else {
    return client;
  }
}


function isURL(s){
  var regexp = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
  return regexp.test(s);
}


function generateId(callback){
  var id = '';
  var redisClient = getRedisClient();
  var chars = config.get('chars').toString();
  var keyLength = new Number(config.get('key length'));
  //
  // check for the number of existing keys
  redisClient.keys('*', function(error, response){
    // while half of the number of possible random keys
    // is less than the number of keys set, increase the
    // number of random keys possible
    
    while(Math.pow(chars.length, keyLength)/2 < response.length){
      keyLength ++;
    }

    config.set('key length', keyLength);

    for (var i=0; i < keyLength; i++){
      id += chars[Math.floor(Math.random() * chars.length)];
    }

    callback(id);
  });
}


function shorten(long, callback){
  var redisClient = getRedisClient();

  if (!(isURL(long))){
    var response = {
      'status': 'ERROR',
      'message': 'Invalid URL: '+ long
    }

    callback ? callback(response) : null
    return false;
  }

  generateId(function(newId){
    redisClient.setnx(newId, long, function(err, res){
      if(res){
        var response = {
          'status': 'OK',
          'shortId': newId,
          'long': long
        }

        callback ? callback(response) : null;
        return true
      } else {
        // the attempted ID is taken
        shorten(long, callback);
      }
    });
  });
}


function expand(short, callback){
  var redisClient = getRedisClient();

  redisClient.get(short, function(err, response){
    if (!err && response){
      callback(response);
    } else {
      callback(err);
    }
  });
}


module.exports = {
  config: config,
  shorten: shorten,
  expand: expand
}
