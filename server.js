'use strict'

let express = require('express'),
    mongodb = require('mongodb'),
    dbcred = require('./dbcredentials.js');
    
let app = express(),
    mongoClient = mongodb.MongoClient,
    url = "mongodb://" + dbcred.dbuser + ':' + dbcred.dbpassword  + "@ds143777.mlab.com:43777/shortenerdb";
    
app.set('view engine', 'ejs');

mongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    console.log('Connection established');

    
    db.close();
  }
});
    
    

