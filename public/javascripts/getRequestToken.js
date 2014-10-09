var twitterAPI = require('node-twitter-api');
var twitter_ = new twitterAPI({
    consumerKey: 'DZhd4yRj22nyHIWLYTNZbj3zX',
    consumerSecret: 'GEjdRq5uTvJuTDWFMWjkSMWVkq2OHrNJAOrMDt9YQZUogw1vkQ',
    callback: 'http://127.0.0.1:3000/form'
});





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
