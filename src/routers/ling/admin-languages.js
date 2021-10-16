const Multilang = require('../../middleware/multilang.js');

const Auth = require("../../middleware/auth.js");
const Priviledge = require('../../middleware/priviledge.js');
const Exceptions = require("../../utils/exceptions.js");

const Language = require("../../models/language.js");

module.exports = function(app){

	const asset = {
		internal: 'ling/admin-languages',
		alias: 'admin/languages'
	}; 

	app.get(`/${asset.alias}`, function(req,res) {
		Multilang.redirectPrefLang(app, req, res, asset);
	})
	
	app.get(`/:lang/${asset.alias}`, Auth(Priviledge.ADMIN),
		async function(req,res)
	{
		if (res.ejsOptions === undefined)
			res.ejsOptions = {};
		
		[
			res.ejsOptions.languageTable,
			res.ejsOptions.listOfLanguages
		] = 
		await Promise.all([
			Language.extractLangs2DTable(),
			Language.extractLangs()
		]);

		Multilang.sendLang(app, req, res, asset);
	});
}