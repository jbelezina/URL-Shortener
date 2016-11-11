'use strict'

/* Require what's required, you know. You gotta do what you gotta do */

let express = require('express'),
    mongodb = require('mongodb'),
    mongoose = require('mongoose'),
    dbcred = require('./dbcredentials.js'),
    randomCodes = require('random-codes'),
    validUrl = require('valid-url'),
    baseURL = "http://baseURL/";

let app = express(),
    codeConfig = {
      chars: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      parts: 2,
    },
    rc = new randomCodes(codeConfig),
    dbUrl = "mongodb://" + dbcred.dbuser + ':' + dbcred.dbpassword  + "@ds143777.mlab.com:43777/shortenerdb";

app.set('view engine', 'ejs');

mongoose.connect(dbUrl);
    
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {

  console.log("we're connected!");
  
/* DB schema and model ===================================== */
  
  let urlSchema = mongoose.Schema({
      url: String,
      code: String
  });
    
  let urlModel = mongoose.model('urlModel', urlSchema);

/* Routes ===================================== */

// Home screen

  app.get("/new/*", (req, res) => {
    
    let passedUrl = req.params[0];
    
    if (validUrl.isUri(passedUrl)){
        
        let code = rc.generate(),
        newDBentry = new urlModel({ url: passedUrl, code: code});
    
        newDBentry.save((err, newDBentry) => {
        if (err) return console.error(err);
        console.log('new DB entry saved' + newDBentry);
        });
      
        res.json({
         "original_url" : passedUrl,
         "short_url" : baseURL + code 
        });
        
    } else {
        
       res.json({
         "error" : "Something seems to be wrong with your URL. Follow the 'protocol + name.domain' format",
       }); 
        
    }
  });
  
  app.get("/:code")
  
  

}); // end of DB connection

app.listen(8080);

