/*
An tiny database based on file
*/
var fs    = require("fs")
  , path  = require("path");


module.exports = (function() {

  var root = "./"
    , minidb;

  var init = function(_root) {
    root = _root || root;

    return minidb;
  };

  var exists = function(key, callback) {
    fs.exists(path.join(root, key), callback);
  };

  var get = function(key, callback) {
    fs.readFile(path.join(root, key), function(err, data) {
      if (err) data = "{}";

      console.log(data, data.toString());

      callback && callback(err, JSON.parse(data.toString()));
    });
  };

  var set = function(key, data, callback) {
    data.constructor == Object && (data = JSON.stringify(data));

    fs.writeFile(path.join(root, key), data, function(err) {
      callback && callback(err);
    });
  };

  minidb = {
      init:   init
    , exists: exists
    , get:    get
    , set:    set
  };

  return minidb;
  
})();