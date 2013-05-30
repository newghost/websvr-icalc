/*
An tiny database based on file
*/
var ICALC_CONNECTSTR = process.env.ICALC_CONNECTSTR
  , ICALC_COLLECTION = "icalc";

/*
mongo ds059907.mongolab.com:59907/nodejitsu_newghost_nodejitsudb7090522041 -u nodejitsu_newghost -p q3ufrelp5cpqehbbsktcdog63d
*/

var fs          = require("fs")
  , path        = require("path")
  , MongoClient = require("mongodb").MongoClient;

module.exports = (function() {

  var icalc_db;

  var get = function(key, callback) {
    MongoClient.connect(ICALC_CONNECTSTR, function(err, db) {
      if (err){
        return callback && callback(err, {});
      }

      db.collection(ICALC_COLLECTION, function(err, collection){
        if (err){
          return callback && callback(err, {});
        }

        collection.findOne({username: key}, function(err, record) {
          callback(err, record || {});
          db.close();
        });
      });
    });
  };

  var set = function(key, data, callback) {
    MongoClient.connect(ICALC_CONNECTSTR, function(err, db) {
      if (err){
        return callback && callback(err, {});
      }

      db.collection(ICALC_COLLECTION, function(err, collection){
        if (err){
          db.close();
          return callback && callback(err, {});
        }

        collection.findOne({username: key}, function(err, record) {
          if (err) {
            db.close();
            return callback && callback(err);
          }

          data.constructor == String && (data = JSON.parse(data));
          //If the Object is existing, specific the _id in order to update it.
          record && (data._id = record._id);

          //In filesystem the filename is the key, so add it back
          data.username = key;

          //insert or update record
          collection.save(data, function(err, record) {
            callback && callback(err, record || {});
            db.close();
          });
        });

      });
    });
  };

  var exists = function(key, callback) {
    get(key, function(err, record) {
      err || record["username"]
        ? callback(true)    //exist
        : callback(false);  //doesn't exist
    });
  };

  icalc_db = {
      exists: exists
    , get:    get
    , set:    set
  };

  return icalc_db;
  
})();