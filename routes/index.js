var express = require('express');
var router = express.Router();
var request = require('request');
var Recaptcha = require('recaptcha').Recaptcha;
//var db = require('./db.js');

var PUBLIC_KEY = '6LeKIfsSAAAAAM2Md2gFYl7_tPNwgG_O9hmxa7qp',
    PRIVATE_KEY = '6LeKIfsSAAAAABqi3rJahR6b_39oL6TLOvVjcBi1';


var twitterAPI = require('node-twitter-api');
var twitter_ = new twitterAPI({
    consumerKey: 'DZhd4yRj22nyHIWLYTNZbj3zX',
    consumerSecret: 'GEjdRq5uTvJuTDWFMWjkSMWVkq2OHrNJAOrMDt9YQZUogw1vkQ',
    callback: 'http://127.0.0.1:3000/form'
});



router.get('/login', function (req, res) {
    if (!req.session.admin) {
        res.render('login');
    }
    else {
        res.redirect('/admin');
    }
});

router.post('/login', function (req, res) {
    var username = req.body.username,
        password = req.body.password;

    if (username === "AnnA" && password === "12345") {

        req.session.admin = req.body;
        res.redirect("/admin");

    }

    else {
        console.log("Incorrect username or password");
    }
//    admin.find({username:"AnnA", password:"Anna1234567"}, function (e, data) {
//
//       // console.log(data);
//
//       if(username===(data[0].username) && password===(data[0].password)){
//        res.redirect("/admin");[
//       }
//        else { console.log("Incorrect username or password");}
//});

//    admin({username: "AnnA", password: "Anna1234567"}).save(function(){
//
//        console.log("username");
//    });


});


router.get('/view-:id', function (req, res) {
    var db = req.app.get('db');
    var schema = db.model('schema');
    var id = req.params.id;
    console.log(id);
    schema.find({_id: id}, function (err, data) {
//        console.log(data + "chd");
        res.render("view-", {data: data});

    })
});


router.get('/', function (req, res) {
    var schema = req.app.get('db').model('schema'),
        lastDate = req.query.time;

    if (req.query.dataType == "JSON") {
        schema.find({status: "approve", date: {$lt: lastDate}}).sort({date: -1}).limit(10).exec(function (error, data) {
            if (error) {
                console.log(error);
            }

            else {
                lastDate = data[9] ? data[9].date.getTime() : null;
                var result = {status: "success", lastDate: lastDate, data: data};
                res.send(result);
            }
        });

    }

    else {
        schema.find({status: "approve"}).sort({date: -1}).limit(10).exec(function (error, data) {
            console.log(data);
            lastDate = data[9].date.getTime();
            console.log(lastDate);
            res.render("index", {data: data, lastDate: lastDate});

        });
    }
});


router.get('/admin', function (req, res) {
    if (!req.session.admin) {
        res.redirect('/login');
    } else {
        var schema = req.app.get('db').model('schema'),
            plus = [];
        schema.find({status: "pending"}, function (error, data) {
            for (var i = 0; i < data.length; i++) {
                //console.log(data[i].message + "hello!!");
                var result = data[i].message.split(" ");
                for (var j = 0; j < result.length; j++) {
                    if (result[j] == "bbb") {
                        // console.log(result[i]);
                        plus.push(data[i]);
                        data[i] = "";
                        //data.pop(data[i]);
                        break;
                    }
                }
            }
            console.log(plus);
            console.log(data + "jdhjf");
            res.render("admin", {data: data, plus: plus});

        });
    }
});

router.post('/admin', function (req, res) {
    var db = req.app.get("db"),
        schema = db.model("schema"),
        status = req.body.status,
        postId = req.body.postId;

    if (status === "decline") {
        schema.remove({_id: postId}, function (e) {
            console.log("Success");
        });
        return true;
    }
    if (status === "approve") {
        schema.update({_id: postId}, {status: status}, function (e) {
        });
        return true;
    }
});


router.post('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/login');
});


router.get('/form', function (req, res) {
   if (!req.session.requestToken) {
      twitter_.getRequestToken(function (error, requestToken, requestTokenSecret, results) {
            if (error) {
                console.log(error);
            } else {
                req.session.requestToken = requestToken;
                req.session.requestTokenSecret = requestTokenSecret;
                console.log(requestToken + "54" + requestTokenSecret);
                res.redirect("https://twitter.com/oauth/authenticate?oauth_token=" + requestToken);
            }
        });
   }
    else {
    var oauth_token = req.query.oauth_token,
        recaptcha = new Recaptcha(PUBLIC_KEY, PRIVATE_KEY),
        message = "",
        twitter = "",
        email = "";
    res.render("form", {error: {message: "", twitter: "", email: ""}, message: message, email: email, twitter: twitter, recaptchaForm: recaptcha.toHTML()});
    }

});


router.post('/form', function (req, res) {


    var data = {
        remoteip: req.connection.remoteAddress,
        challenge: req.body.recaptcha_challenge_field,
        response: req.body.recaptcha_response_field
    };

    var recaptcha = new Recaptcha(PUBLIC_KEY, PRIVATE_KEY, data);
    recaptcha.verify(function (success, error_code) {
        if (success) {
            var message = req.body.message,
                twitter = req.body.twitter,
                email = req.body.email,
                date = new Date();

            if (!message) {
                message = "";
                res.render("form", {error: {email: "", twitter: "", message: "enter message"}, message: message, email: email, twitter: twitter, recaptchaForm: recaptcha.toHTML()});

                return true;
            }
            if (message.length > 100) {
                res.render("form", {error: {email: "", twitter: "", message: "message length >100"}});
                return true;
            }

            if (!twitter) {
                twitter = "";
                res.render("form", {error: {email: "", twitter: "enter twitter", message: ""}, message: message, email: email, twitter: twitter, recaptchaForm: recaptcha.toHTML()});
                return true;
            }

            if (!validateEmail(email)) {
                email = "";
                res.render("form", {error: {email: "enter correct email", twitter: "", message: ""}, message: message, email: email, twitter: twitter, recaptchaForm: recaptcha.toHTML()})
                return true;
            } else {
                request('https://twitter.com/' + twitter, function (error, response, body) {
                    if (response.statusCode === 404) {
                        console.log("error");
                        res.render("form", {error: {email: "", twitter: "doesn't exist", message: ""}, message: message, email: email, twitter: twitter, recaptchaForm: recaptcha.toHTML()})
                    } else {
                        console.log("correct");
                        var schema = req.app.get('db').model('schema');
                        schema({twitter: twitter, email: email, message: message, status: "pending", date: date}).save(function (e) {
                            console.log('successfully saved');
                            res.redirect("/form");

                        });
                    }
                });
            }

        }

    });
});

function validateEmail(email) {
    if (!email || !email.match(/^[\w\d]{1,10}@[\w\d]{1,10}\.[\w]{1,4}/g)) {
        return false;
    }
    return true;
}

module.exports = router;
