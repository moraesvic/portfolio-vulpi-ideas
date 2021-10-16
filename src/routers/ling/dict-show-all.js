const Multilang = require('../../middleware/multilang.js');

const Dict = require("../../models/dictionary.js");

module.exports = function(app){

	const asset = {
		internal: 'ling/dict-show-all',
		alias: 'show-dict/all'
	};

	let regexShort = new RegExp(`^\/${asset.alias}$`);
	let regexLong  = new RegExp(`^\/([a-zA-Z]{2,3})\/${asset.alias}$`);

	app.get(regexShort, function(req,res)
	{
		Multilang.redirectPrefLang(app, req, res, asset);
	});

	app.get(regexLong, async function(req,res)
	{
		try {
			let reqLang = req.params[0];
			let dicts = await Dict.getDictsList(reqLang);

			res.ejsOptions = res.ejsOptions || {};
			res.ejsOptions.dicts = dicts;

			console.log(res.ejsOptions.dicts);
			
			Multilang.sendLang(app, req, res, asset, reqLang);
		} catch (e) {
			console.log(e);

		}
	});
		
}