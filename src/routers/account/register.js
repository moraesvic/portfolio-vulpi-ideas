const Multilang = require('../../middleware/multilang.js');

const User = require("../../models/user.js");

module.exports = function(app){

	const register = {
		internal: "account/register",
		alias: "register"
	};

	app.get(`/${register.alias}`, function(req,res) {
		Multilang.redirectPrefLang(app, req, res, register);
	})
	
	app.get(`/:lang/${register.alias}`, function(req,res){
		Multilang.sendLang(app, req, res, register);
	});
}

