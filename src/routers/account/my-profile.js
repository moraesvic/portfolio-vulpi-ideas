/* under construction */

const Multilang = require("../../middleware/multilang.js");

const realAsset = {
	internal: 'account/my-profile',
	alias: 'my-profile'
};

const temporary = {
	internal: 'core/under-construction',
	alias: 'my-profile'
}

const asset = temporary;

module.exports = function(app){
	app.get(`/${asset.alias}`, function(req,res) {
		Multilang.redirectPrefLang(app, req, res, asset);
	})
	
	app.get(`/:lang/${asset.alias}`, function(req,res){
		Multilang.sendLang(app, req, res, asset);
	});

}