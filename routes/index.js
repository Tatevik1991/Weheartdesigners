var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', { title: 'Express' });
});

router.get('/form', function (req, res) {
    res.render("form", {error: {message: "", twitter: "", email: ""}});
});


router.post('/form', function (req, res) {
    var message = req.body.message,
        twitter = req.body.twitter,
        email = req.body.email;
    if (!message) {
        res.render("form", {error: {email: "", twitter: "", message: "enter message"}});
    } else {
        if (!twitter) {
            res.render("form", {error: {email: "", twitter: "enter twitter", message: ""}});
        }
        else {
            if (!validateEmail(email)) {
                res.render("form", {error: {email: "enter correct email", twitter: "", message: ""}})
            } else {
                request('https://twitter.com/' + twitter, function (error, response, body) {
                    if (response.statusCode === 404) {
                        console.log("error");
                        res.render("form", {error: {email: "", twitter: "doesn't exist", message: ""}})
                    } else {
                        console.log("correct");
                        var note = req.app.get('db').model('schema');
                        note({twitter: twitter, email: email, message: message}).save(function (e) {
                            console.log('successfully saved');

                        });
                    }
                });
            }
        }
    }
    });

    function validateEmail(email) {
        if (!email || !email.match(/^[\w\d]{1,10}@[\w\d]{1,10}\.[\w]{1,4}/g)) {
            return false;
        }
        return true;
    }


    module.exports = router;
