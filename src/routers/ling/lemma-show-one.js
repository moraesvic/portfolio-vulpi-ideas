const Multilang = require('../../middleware/multilang.js');

const Dict = require("../../models/dictionary.js");

module.exports = function(app){

	const asset = {
		internal: 'ling/lemma-show-one',
		alias: 'show-lemma'
	}; 

	app.get(`/${asset.alias}/:dictLang/:lemma`, function(req,res) {
		Multilang.redirectPrefLang(app, req, res, asset);
	});

	app.get(
		`/:lang/${asset.alias}/:dictLang/:lemma`, async function(req,res)
	{
		try {
			let data = await Dict.getDataByIsoAndTitle
			(
				req.params.dictLang,
				req.params.lemma,
				req.params.lang
			);

			res.ejsOptions = res.ejsOptions || {};
			res.ejsOptions.data = data;
			res.ejsOptions.title  = `Vulpi Ideas - ${req.params.lemma}`;

			console.log(data);

			Multilang.sendLang(app, req, res, asset);
		} catch (e) {
			let PUBLIC = app.get("public");
			console.log(e);
			res.status(404).sendFile(PUBLIC + '404.html');
		}
	});

	
}