//import namespace
var WebSvr  = require("websvr")
  , minidb  = require("./minidb").init("./data");
  //, minidb = require("./icalc_db");


var Utility = {
  //Sort a list of Objects by specific field
  sort: function(objArr, field) {
    var tmp;
    for (var i = 0, l = objArr.length; i < l; i++) {
      for (var j = i + 1; j < l; j++) {
        if (objArr[i][field] < objArr[j][field]) {
          tmp = objArr[j];
          objArr[j] = objArr[i];
          objArr[i] = tmp;
        }
      }
    }
    return objArr;
  }
};


//Start the WebSVr, runnting at parent folder, default port is 8054, directory browser enabled;
//try at: http://localhost:8054
var debug = process.env["NODE_ENV"] == 'debug';

var webSvr = new WebSvr({
    root:         debug ? "./web" : "./mob"
  , port:         8051
  , listDir:      debug
  , defaultPage:  debug ? "" : "icalc.html"

  //cache: false,
  , debug: true
}).start();

//Add gzip for default page
webSvr.filter("/", function(req, res) {
  !debug && req.url == '/' && res.setHeader("Content-Encoding", "gzip");
  req.filter.next();
});

/*
validator: parse session & post data, so we can use it in the handler
*/
webSvr.filter(".svr", function(req, res) {
  res.setHeader("Content-Type", "text/plain");

  if (req.url.indexOf("login.svr") < 0
    && req.url.indexOf("regist.svr") < 0
  ) {
    var session = req.session;
    session.get("username", function(val) {
      if (!val) {
        res.writeHead(451);
        res.end(JSON.stringify({
          msg: "unauthorized!"
        }));
      }
      //filters should be pass to next here, it need time to init session from file.
      req.filter.next();
    });
  } else {
    req.filter.next();
  }
}, {session: true, post: "json"});


//validate and authentication
webSvr.handle("login.svr", function(req, res) {
  var json = req.body;

  minidb.get(json.username, function(err, data) {
    if (err) {
      res.writeHead(452);
      res.end();
    } else if (json.password != data.password) {
      res.writeHead(453);
      res.end();
    } else {
      req.session.set("username", json.username, function() {
        res.end();
      });
    }
  });
});

webSvr.handle("regist.svr", function(req, res) {
  var json     = req.body
    , username = json.username;

  minidb.exists(username, function(exists) {
    if (exists) {
      res.writeHead(454);
      res.end();
    } else {
      minidb.set(username, { password: json.password, regtime: new Date() });
      req.session.set("username", username, function() {
        res.end();
      });
    }
  });
});

//get assets from user
webSvr.handle("accounts.svr", function(req, res) {
  minidb.get(req.session.get("username"), function(err, data) {
    if (err) {
      res.writeHead(452);
      res.end();
    } else {
      res.end(JSON.stringify(data.accounts || []));
    }
  });
});

//edit assets for user
webSvr.handle("account_edit.svr", function(req, res) {
  var json      = req.body
    , username  = req.session.get("username");

  var olddate = json.olddate;
  delete json.olddate;

  minidb.get(username, function(err, data) {
    if (err) {
      res.writeHead(452);
      res.end();
    } else {
      !data.accounts
        ? (data.accounts = [json])
        : data.accounts.forEach(function(account, i) {
          account.date == olddate && (data.accounts[i] = json);
        });

      minidb.set(username, data, function() {
        res.end();
      })
    }
  });
});

//add new asset to user
webSvr.handle("account_newer.svr", function(req, res) {
  var json      = req.body
    , username  = req.session.get("username");

  delete json.olddate;

  minidb.get(username, function(err, data) {
    if (err) {
      res.writeHead(452);
      res.end();
    } else {
      !data.accounts
        ? (data.accounts = [json])
        : data.accounts.push(json);

      Utility.sort(data.accounts, "date");
      minidb.set(username, data, function() {
        res.end();
      });
    }
  });
});

//del asset from user
webSvr.handle("account_del.svr", function(req, res) {
  var json      = req.body
    , username  = req.session.get("username");

  minidb.get(username, function(err, data) {
    if (err) {
      res.writeHead(452);
      res.end();
    } else {
      data.accounts.forEach(function(account, i) {
        if (account.date == json.date && account.note == json.note) {
          data.accounts.splice(i , 1);
        }
      });
      Utility.sort(data.accounts, "date");
      minidb.set(username, data, function() {
        res.end();
      });
    }
  });
});

//change password
webSvr.handle("set_pass.svr", function(req, res) {
  var json      = req.body
    , username  = req.session.get("username");

  minidb.get(username, function(err, data) {
    if (err) {
      res.writeHead(452);
      res.end("{}");
    } else if (json.oldpass != data.password) {
      res.end(JSON.stringify({msg: "原密码错误！"}));
    } else {
      data.password = json.newpass;
      minidb.set(username, data, function() {
        res.end("{}");
      });
    }
  });
});