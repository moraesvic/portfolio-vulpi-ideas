const Multilang = require('../../middleware/multilang.js');

const Auth = require("../../middleware/auth.js");
const Priviledge = require('../../middleware/priviledge.js');

const Language = require("../../models/language.js");

const Dict = require("../../models/dictionary.js");

module.exports = function(app){

	const asset = {
		internal: 'ling/dict-show-one',
		alias: 'show-dict'
	}; 

	/* Match everything EXCEPT if the sought dictionary is "all", in this case
	 * we have another specialized router */

	let regexShort = new RegExp(`^\/${asset.alias}\/((?!all)[a-zA-Z]{2,3})$`);
	let regexLong  = new RegExp(`^\/([a-zA-Z]{2,3})\/${asset.alias}\/((?!all)[a-zA-Z]{2,3})$`);

	app.get(regexShort, function(req,res) {
		Multilang.redirectPrefLang(app, req, res, asset);
	});

	app.get(regexLong, async function(req,res)
	{
		try {
			let reqLang = req.params[0];
			let dictLang = req.params[1];
			
			let promises =
			[
				Dict.getShortEntriesByIso(dictLang),
				Language.findByIso(dictLang)
				.then( lang => {
					return lang.getTranslatedLangName(reqLang)
				})
			];
			let [entries, translatedLanguageName] = await Promise.all(promises);

			res.ejsOptions = res.ejsOptions || {};
			res.ejsOptions.entries = entries;
			res.ejsOptions.translatedLanguageName = translatedLanguageName;
			res.ejsOptions.targetLanguageIso = dictLang;
			
			Multilang.sendLang(app, req, res, asset, reqLang);
		} catch (e) {
			const PUBLIC = app.get("public");
			console.log(e);
			console.log(req.params);
			res.status(404).sendFile(PUBLIC + '404.html');
		}
	});

	

	app.post(
		`/:lang/${asset.alias}`,
		Auth(Priviledge.ADMIN),
		async function(req,res)
	{
		// console.log(req.body);
		res.send(await Dict.getAllEntriesByIso("eng"));
		
		
	});
}