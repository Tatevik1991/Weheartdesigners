var express = require('express');
var router = express.Router();
var request = require('request');
var Recaptcha = require('recaptcha').Recaptcha;


var PUBLIC_KEY = '6LeKIfsSAAAAAM2Md2gFYl7_tPNwgG_O9hmxa7qp',
    PRIVATE_KEY = '6LeKIfsSAAAAABqi3rJahR6b_39oL6TLOvVjcBi1';


var twitterAPI = require('node-twitter-api');
var twitter_ = new twitterAPI({
    consumerKey: 'DZhd4yRj22nyHIWLYTNZbj3zX',
    consumerSecret: 'GEjdRq5uTvJuTDWFMWjkSMWVkq2OHrNJAOrMDt9YQZUogw1vkQ',
    callback: 'http://127.0.0.1:3000/form'
});

router.get('/login', function (req, res) {
//    var username = "",
//        password = "";
    if (!req.session.admin) {
        res.render("login",{error:{username:"", password:""},
            username:"", password:""});
    }
    else {
        res.redirect('/admin');
    }
});

router.post('/login', function (req, res) {
    var username = req.body.username,
        password = req.body.password;
      console.log(username);

    if (username === "java" && password === "java") {
        req.session.admin = req.body;
        res.redirect("/admin");
      }

     else{

        if(username!= "java" && password != "java"){
            password="";
            username="";
            console.log("a111");
            res.render("login", {error: { username: "enter  correct username", password: "enter correct password"},username:username, password:password});
            return false;
        }


    if(username != "java") {
        username = "";

        console.log("dddddddddddddd");
        res.render("login", {error: {username: "enter  correct username", password: ""}, username:username, password:password});
        return false;
    }
        if(password != "java"){

            password="";
           console.log("aaa");
        res.render("login", {error: { username: "", password: "enter correct password"},username:username, password:password});
            return false;
        }


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


router.get('/I-love-java-because-:id', function (req, res) {
    var db = req.app.get('db'),
        schema = db.model('schema'),
        id = req.params.id,
        lastDAte = req.query.lastDate;

    if (req.query.dataType == "Prev") {
        var prevTime = req.query.time;
        schema.find({status: "approve", date: {$gt: prevTime}}).limit(1).exec(function (error, data) {
            if (data == "") {
                res.send("NaN");
            }
            else {
                var result = {status: "success", data: data, prevTime: data[0].date.getTime(), id:data[0]._id};
                res.send(result);
            }
        });
        return true;
    }


    if (req.query.dataType == "Next") {
        var nextTime = req.query.time;
        schema.find({status: "approve", date: {$lt: nextTime}}).sort({date: -1}).limit(1).exec(function (error, data) {
            if (data == "") {
                res.send("NaN");
            }
            else {
                var result = {status: "success", data: data, nextTime: data[0].date.getTime(), id:data[0]._id};
                res.send(result);
            }
        });
        return true;
    }


    schema.find({_id:id}, function (err, data) {
        var time = data[0].date.getTime();
        res.render("I-love-java-because-", {data: data, time: time});

    })

});


router.get('/', function (req, res) {
    var schema = req.app.get('db').model('schema'),
        lastDate = req.query.time || "",
        page = 1,
        scrollpage = "";

    schema.find({status: "approve"}).sort({date: -1}).limit(10).exec(function (error, data) {
        lastDate = data[9].date.getTime();
        res.render("index", {data: data, lastDate: lastDate, page: page, scrollpage:scrollpage});

    });

});


router.get('/page/:page', function (req, res) {
    var schema = req.app.get('db').model('schema'),
        lastDate = req.query.time || "",
        page = req.params.page,
        lastPage = page,
        scrollpage =  req.params.page;

    if (/^[0-9]*$/.test(page)) {

        if (req.query.dataType == "JSON") {
            page++;
            schema.find({status: "approve", date: {$lt: lastDate}}).sort({date: -1}).limit(10).exec(function (error, data) {
                if (error) {
                    console.log(error);
                }

                 else {
                    if(data!=""){
                    lastDate = data[9] ? data[9].date.getTime() : null;
                    var result = {status: "success", lastDate: lastDate, data: data, page: page};
                    res.send(result);
                    }
                }
            });
            return true;
        }

        /*  copy-paste url */
        else {
            if(lastPage==0)
            {
                res.redirect("/");
                return;
            }
          schema.find({status: "approve"}).sort({date: -1}).limit(lastPage * 10).exec(function (error, data) {
                if (data != "") {
                    var time2;
                    time2 = data[ lastPage * 10 - 1].date.getTime();
                    schema.find({status: "approve", date: {$lt: time2}}).sort({date: -1}).limit(10).exec(function (error, data) {
                        if (data != "") {
                            lastDate = data[9] ? data[9].date.getTime() : null;
                            res.render("index", {data: data, lastDate: lastDate, page: page, scrollpage:scrollpage});

                        }
                    });

                }

            });
        }
        return true;
    }

        if (page.match(/(^I-love-java-because-)(\w|\d){1,}/g)) {
            var array1 = page.split("-");
            res.redirect('/I-love-java-because-' + array1[1]);
        }
        else {
//        console.log("wrong value!!!");
        }

});


router.get('/admin', function (req, res) {
    if (!req.session.admin) {
        res.redirect('/login');
    } else {
        var schema = req.app.get('db').model('schema'),
            plus = [];
        schema.find({status: "pending"}, function (error, data) {

            res.render("admin", {data: data });

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


router.get('/express-your-love', function (req, res) {
    if(req.query.dataType =="JSON"){
      req.session.message = req.query.message;
      req.session.email = req.query.email;
      console.log(req.session.message + "fgg",req.session.email+"ggghhh" );
  }


   if (req.query.oauth_token && req.query.oauth_verifier) {
            twitter_.getAccessToken(req.query.oauth_token, req.session.requestTokenSecret, req.query.oauth_verifier, function (error, accessToken, accessTokenSecret, results) {
                if (error) {
                    console.log(error);
                } else {
//                res.json(arguments);
//                    console.log(arguments);
                    var screen_name = arguments['3']['screen_name'],
                       twitt_name = "@"+screen_name,
                        image = "";
                    twitter_.users("show", {
                            screen_name: screen_name
                        },
                        accessToken,
                        accessTokenSecret,
                        function (error, data, response) {
                            if (error) {
                                console.log('Error: ', error);
                            } else {
//                                console.log('Data: ', data);
//                                console.log('Response: ', response);
                                image = data['profile_image_url'];
                                var recaptcha = new Recaptcha(PUBLIC_KEY, PRIVATE_KEY),
                                    message = "",
                                    twitter = "",
                                    email = "";
                                console.log(req.session.message + "message",  req.session.email + "email");
                                res.render("form", {error: {message: "", twitter: "", email: ""}, message: req.session.message, email: req.session.email,
                                    twitter: twitter, recaptchaForm: recaptcha.toHTML(), screen_name: twitt_name , image: image});
                            }
                        }
                    );
                  }
            });
            return;
        }

    var twitterLink=req.query.twitter;

   if(twitterLink == "tweet") {
       console.log(twitterLink + "twitter");
     if (!req.session.requestToken) {
         console.log(req.session.message + "messagegetreq",  req.session.email + "emailgetreq");
         twitter_.getRequestToken(function (error, requestToken, requestTokenSecret, results) {
                if (error) {
                    console.log(error);
                } else {
                    req.session.requestToken = requestToken;
                    req.session.requestTokenSecret = requestTokenSecret;
                    res.redirect("https://twitter.com/oauth/authenticate?oauth_token=" + requestToken);
                }
            });

        }
    }
        else {
            var recaptcha = new Recaptcha(PUBLIC_KEY, PRIVATE_KEY),
                message = "",
                twitter = "",
                email = "";
            res.render("form", {error: {message: "", twitter: "", email: ""},
                message: message, email: email, twitter: twitter, recaptchaForm: recaptcha.toHTML(), screen_name:"", image:""});
        }



});


router.post('/express-your-love', function (req, res) {
    var data = {
        remoteip: req.connection.remoteAddress,
        challenge: req.body.recaptcha_challenge_field,
        response: req.body.recaptcha_response_field
    };

    var recaptcha = new Recaptcha(PUBLIC_KEY, PRIVATE_KEY, data);
//    recaptcha.verify(function (success, error_code) {
//        if (success) {
            var message = req.body.message,
                twitter = req.body.twitter,
                email = req.body.email,
                icon = req.body.icon,
                date = new Date();


           if (!message) {
                message = "";
                res.render("form", {error: {email: "", message: "enter message"}, message: message, email: email, screen_name:twitter, image:icon, recaptchaForm: recaptcha.toHTML()});
                return false;
            }
            if (message.length > 100) {
                res.render("form", {error: {email: "enter correct email", twitter:twitter, message: ""}, message: message, email: email, screen_name:twitter, image:icon, recaptchaForm: recaptcha.toHTML()})
                return false;
            }

            if (!twitter) {
                twitter = "";
                res.render("form", {error: {email: "", twitter: "enter twitter", message: ""}, message: message, email: email, screen_name:twitter, image:icon, recaptchaForm: recaptcha.toHTML()});
                return false;
            }

            if (!validateEmail(email)) {
                email = "";
                res.render("form", {error: {email: "enter correct email", twitter:"", message: ""}, message: message, email: email, screen_name:twitter, image:icon, recaptchaForm: recaptcha.toHTML()})
                return false;
            } else {
                var result18plus = "";

                for (var i = 0; i < message.length; i++) {

                    var result = message.split(" ");

                    for (var j = 0; j < result.length; j++) {
                        if (result[j] == "aaa") {
                            console.log(result[j]);
                            result18plus = "yes";
                            break;
                        }

                        var result = message.split(" ");
                        for (var j = 0; j < result.length; j++) {
                            if (result[j] == "aaa") {
                                result18plus = "yes";
                                break;
                            }


                            else {
                                result18plus = "no"
                            }

                        }
                    }

                    console.log(message + "  " + result18plus);

                    var schema = req.app.get('db').model('schema');
                    schema({twitter: twitter, icon: icon, email: email, message: message, status: "pending", date: date, status18: result18plus}).save(function (e) {
                        console.log('successfully saved');
                        res.redirect('/express-your-love');
                    });

                }
            }
//        }
//
//    });
});

function validateEmail(email) {
    if (!email || !email.match(/[\w\d]{1,20}@[\w\d]{1,20}\.[\w]{1,4}/gi)) {
        return false;
    }
    return true;
}

module.exports = router;
