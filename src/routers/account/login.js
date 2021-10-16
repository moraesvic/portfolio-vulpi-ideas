const Multilang = require('../../middleware/multilang.js');

module.exports = function(app){
	
	const asset = {
		internal: "account/login",
		alias: "login"
	};
	

	app.get(`/${asset.alias}`, function(req,res) {
		Multilang.redirectPrefLang(app, req, res, asset);
	})
	
	app.get(`/:lang/${asset.alias}`, function(req,res){
		res.ejsOptions = res.ejsOptions || {};

		if (req.query && req.query.resource) {
			res.ejsOptions.displayLoginMessage = true;
			res.ejsOptions.redirectUrl = req.query.resource;
		} else {
			res.ejsOptions.displayLoginMessage = false;
			res.ejsOptions.redirectUrl = "/";
		}

		Multilang.sendLang(app, req, res, asset);
	});
}

