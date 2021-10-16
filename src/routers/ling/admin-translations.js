const Multilang = require('../../middleware/multilang.js');

const Auth = require("../../middleware/auth.js");
const Priviledge = require('../../middleware/priviledge.js');

const Language = require("../../models/language.js");
const Translation = require("../../models/translation.js");

module.exports = function(app){

	const asset = {
		internal: 'ling/admin-translations',
		alias: 'admin/translations'
	}; 

	app.get(`/${asset.alias}`, function(req,res) {
		Multilang.redirectPrefLang(app, req, res, asset);
	})
	
	app.get(
		`/:lang/${asset.alias}`,
		Auth(Priviledge.ADMIN),
		async function(req,res)
	{
		let listOfLanguages = await Language.extractLangs();
		res.ejsOptions = res.ejsOptions || {};
		res.ejsOptions.listOfLanguages = listOfLanguages;		

		Multilang.sendLang(app, req, res, asset);
	});
}