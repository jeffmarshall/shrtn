var redis = require('redis');
var events = require('events');

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
  
  // check for the number of existing keys
  redisClient.keys('*', function(error, response){

    // while half of the number of possible random keys
    // is less than the number of keys set, increase the
    // number of random keys possible by increasing key 
    // length.
    
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

    callback ? callback(response) : null;
    shrtn.emit('error', response);
    return false;
  }

  generateId(function(newId){
    redisClient.setnx(newId, long, function(err, res){
      if(res){
        var response = {
          'status': 'OK',
          'short': newId,
          'long': long
        }

        callback ? callback(response) : null;
        shrtn.emit('shortened', response);
        return true;
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
    if (response){
      var result = {
        'status': 'OK',
        'long': response,
        'short': short
      }

      callback(result);
      shrtn.emit('expanded', result);
      return true;
    }

    else {
      var result = {
        'status': 'ERROR',
        'message': 'Key not found'
      }

      callback(result);
      shrtn.emit('error', result);
      return false;
    }
  });
}

var shrtn = new events.EventEmitter();
shrtn.config = config;
shrtn.shorten = shorten;
shrtn.expand = expand;

module.exports = shrtn
