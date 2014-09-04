var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/nodetest');


var schema = mongoose.Schema({

	message: String,
	twitter: String,
	email: String,
    status : String
});

mongoose.model("schema", schema);

module.exports = mongoose;