const Multilang = require('../../middleware/multilang.js');

const asset = {
	internal: 'about/who-am-i',
	alias: 'who-am-i'
};

module.exports = function(app){
	app.get(`/${asset.alias}`, function(req,res) {
		Multilang.redirectPrefLang(app, req, res, asset);
	})
	
	app.get(`/:lang/${asset.alias}`, function(req,res){
		Multilang.sendLang(app, req, res, asset);
	});
}

