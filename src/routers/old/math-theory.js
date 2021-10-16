const Multilang = require('../multilang/multilang.js');
const Debug     = require("../debug/debug.js");

const asset = {
	internal: 'math-theory',
	alias: 'theory'
};

module.exports = function(app){
	app.get(`/${asset.alias}`, function(req,res) {
		Multilang.redirectPrefLang(app, req, res, asset);
	})
	
	app.get(`/:lang/${asset.alias}`, function(req,res){
		Multilang.sendLang(app, req, res, asset);
	});
}

