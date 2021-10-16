const Multilang = require('../../middleware/multilang.js');

const Auth = require("../../middleware/auth.js");
const Priviledge = require('../../middleware/priviledge.js');
const Exceptions = require("../../utils/exceptions.js");

module.exports = function(app){

	const asset = {
		internal: 'ling/admin-home',
		alias: 'admin'
	}; 

	app.get(`/${asset.alias}`, Auth(Priviledge.ADMIN), function(req,res) {
		Multilang.redirectPrefLang(app, req, res, asset);
	})
	
	app.get(`/:lang/${asset.alias}`, Auth(Priviledge.ADMIN), async function(req,res)
	{
		Multilang.sendLang(app, req, res, asset);
	});

}