const Multilang = require('../middleware/multilang.js');

const asset = {
	internal: 'core/under-construction',
	alias: 'under-construction'
};

module.exports = function(app){
	app.get(`/${asset.alias}`, function(req,res) {
		Multilang.redirectPrefLang(app, req, res, asset);
	})
	
	app.get(`/:lang/${asset.alias}`, function(req,res){
		Multilang.sendLang(app, req, res, asset);
	});
}

