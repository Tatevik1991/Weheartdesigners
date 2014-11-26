var mongoose = require('mongoose');



var schema = mongoose.Schema({

	message: String,
	twitter: String,
	email:   String,
    status: String,
    icon:   String,
    date:  Date,
    status18:String
});

 var admin = mongoose.Schema({
    username: String,
    password: String
});

mongoose.model("schema", schema);
mongoose.model("admin", admin);
mongoose.connect('mongodb://localhost/nodetest');

module.exports = mongoose;