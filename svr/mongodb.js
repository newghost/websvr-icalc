var OPENSHIFT_MONGODB_DB_URL = "mongodb://nodejitsu_newghost:q3ufrelp5cpqehbbsktcdog63d@ds059907.mongolab.com:59907/nodejitsu_newghost_nodejitsudb7090522041";

var MongoClient = require('mongodb').MongoClient
  , format      = require('util').format;

//etc: https://runnable.com/node-mongodb-native
//connect away
MongoClient.connect(OPENSHIFT_MONGODB_DB_URL, function(err, db) {
  if (err) throw err;
  console.log("Connected to Database");

  //create collection
  db.collection("icalc2", function(err, collection){
    if (err) throw err;
    var doc = { username:"krzhang" + (Math.random() * 100 | 0), password: "12345678" };

    //insert record
    collection.insert(doc, function(err, records) {
      console.log(records);
      db.close();
    });
  });
});

MongoClient.connect(OPENSHIFT_MONGODB_DB_URL, function(err, db) {
  if (err) throw err;
  console.log("Connected to Database");

  //create collection
  db.collection("icalc2", function(err, collection){
     if (err) throw err;

    //locate specific document by key
    collection.find({ username: "krzhang7" }).nextObject(function(err, records) {
      console.log(records);
      db.close();
    });
  });
});

/*
db.collection('session', function(err, collection){
    collection.remove({
        "expire": {"$lte": Date.now()}
    },function(err, removed){
        console.log(removed);
    });
});
*/

/*
//connect away
MongoClient.connect(process.env.OPENSHIFT_MONGODB_DB_URL, function(err, db) {
  if(err) throw err;

  db.dropCollection("testCollection", function() {
    process.exit(0);
  });
})

// Cursor has an to array method that reads in all the records to memory
collection.find().toArray(function(err, docs) {
  console.log("Printing docs from Array")
  docs.forEach(function(doc) {
    console.log("Doc from Array ");
    console.dir(doc);
  });
});
*/