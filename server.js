'use strict'

/* Require what's required, you know. You gotta do what you gotta do */

let express = require('express'),
    mongodb = require('mongodb'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    randomCodes = require('random-codes'),
    validUrl = require('valid-url'),
    baseURL = "https://shortyshort.herokuapp.com/",
    morgan = require('morgan'),
    http = require('http'),
    path = require('path'),
    portNo = process.env.PORT || 8080;

let app = express(),
    codeConfig = {
      chars: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      parts: 2,
    },
    rc = new randomCodes(codeConfig),
    dbUrl = process.env.MONGOLAB_URI;
    
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('combined'));

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

  
  app.get("/", (req,res)=>{
    res.render('home');
  });
  
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
  }); // end of GET /new/*
  
  app.get("/:code", (req,res)=>{
    
    let code = req.params.code
    console.log(code);
    let redirectTo = "";
  
    let MongoosePromise = urlModel.findOne({'code':code});
    
    MongoosePromise.then(function(result){
      let objResult = result.toObject();
      console.log(objResult);
      let urlTarget = objResult.url;
      console.log(urlTarget);
      res.redirect(urlTarget);
    });
    
  });  
}); // end of DB connection

app.listen(portNo, function () {
  console.log('Example app listening on env port or 8080');
});

