var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/form',  function(req, res){
res.render("form");
});


router.post('/form',  function(req, res){
    var message  = req.body.message,
    twitter = req.body.twitter,
     email = req.body.email;

    console.log(message);
    console.log(twitter);
    console.log(email);



    var myDb = req.app.get('mydb').model('schema');
    myDb({message:message, twitter:twitter, email:email}).save(function(e){
    	console.log("OK!!");
    });
});




















module.exports = router;
