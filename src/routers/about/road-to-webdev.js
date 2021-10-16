const Multilang = require('../../middleware/multilang.js');

const asset = {
	internal: 'about/road-to-webdev',
	alias: 'road-to-webdev'
};

module.exports = function(app){
	app.get(`/${asset.alias}`, function(req,res) {
		Multilang.redirectPrefLang(app, req, res, asset);
	})
	
	app.get(`/:lang/${asset.alias}`, function(req,res){
		Multilang.sendLang(app, req, res, asset);
	});
}

