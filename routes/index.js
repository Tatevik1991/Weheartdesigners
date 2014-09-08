var express = require('express');
var router = express.Router();
var request = require('request');
//var db = require('./db.js');
/* GET home page. */




router.get('/form', function (req, res) {
    res.render("form", {error: {message: "", twitter: "", email: ""}});
});

router.get('/login', function (req, res) {
    res.render("login");

});

router.post('/login', function (req, res) {
    var db = req.app.get("db"),
        admin = db.model("admin"),
        username = req.body.username,
        password = req.body.password;


    admin.find({username:"AnnA", password:"Anna1234567"}, function (e, data) {

       // console.log(data);

       if(username===(data[0].username) && password===(data[0].password)){
        res.redirect("/admin");
       }
        else { console.log("Incorrect username or password");}
});

//    admin({username: "AnnA", password: "Anna1234567"}).save(function(){
//
//        console.log("username");
//    });


});

router.get('/', function(req, res){
    var schema = req.app.get('db').model('schema');
    schema.find({status:"approve"},{_id: false, __v : false}, function(error, data) {
        if(error) {
            console.log("ERROR");
        }

        else{
            res.render("index", {data: data});
            }
    });
});


router.get('/admin', function(req, res){
    var schema = req.app.get('db').model('schema');
    schema.find({status:"pending"}, function(error, data) {

            console.log(data);
            res.render("admin", {data: data});

    });
});

router.post('/admin', function(req, res){


    var db = req.app.get("db"),
       schema = db.model("schema"),
       status =  req.body.status,
       postId = req.body.postId;

    console.log(postId, status);

    if(status==="decline"){
        schema.remove({_id:postId}, function(e){
            res.send("success");
        });
    }
  else{
        schema.update({_id:postId}, {status:status}, function(e){
            res.send("success");
        });
    }
});


router.post('/form', function (req, res) {
    var message = req.body.message,
        twitter = req.body.twitter,
        email = req.body.email;



    if (!message) {
        res.render("form", {error: {email: "", twitter: "", message: "enter message"}});
        return true;
    }
      if (message.length > 10) {
            res.render("form", {error: {email: "", twitter: "", message: "message length >10"}});
            return true;
        }

     if (!twitter) {
            res.render("form", {error: {email: "", twitter: "enter twitter", message: ""}});
         return true;
        }

         if (!validateEmail(email)) {
                res.render("form", {error: {email: "enter correct email", twitter: "", message: ""}})
               return true;
            } else {
                request('https://twitter.com/' + twitter, function (error, response, body) {
                    if (response.statusCode === 404) {
                        console.log("error");
                        res.render("form", {error: {email: "", twitter: "doesn't exist", message: ""}})
                    } else {
                        console.log("correct");
                        var note = req.app.get('db').model('schema');
                        note({twitter: twitter, email: email, message: message, status: "pending"}).save(function (e) {
                            console.log('successfully saved');
                            res.redirect("/");

                        });
                    }
                });
            }
    });

    function validateEmail(email) {
        if (!email || !email.match(/^[\w\d]{1,10}@[\w\d]{1,10}\.[\w]{1,4}/g)) {
            return false;
        }
        return true;
    }

    module.exports = router;
