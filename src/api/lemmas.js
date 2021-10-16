const Dict = require("../models/dictionary.js");
const Lemma = require("../models/lemma.js");

const Exceptions = require("../utils/exceptions.js");

module.exports = function(app){

	app.get(
		`/lemmas/iso/:iso`, async function(req, res)
	{
		/* /lemmas/iso/:iso ? count=(Boolean) & title=(Title) & lang=(String)
		 *
		 *
		 */
		try {
			const iso = req.params.iso;
			const count = req.query.count;
			const title = req.query.title;
			const lang  = req.query.lang;

			let dict = await Dict.getByIso(iso);
			await dict.populate("lemmas").execPopulate();
			let lemmas =	
				Boolean(title) ?
				dict.lemmas.filter( lemma => lemma.lemma === title) :
				dict.lemmas;

			if (count && count === "true") {
				res.send({ success: true, count: lemmas.length });
				return;
			}

			let data = await Dict.getHeaderDataByIsoAndTitle(iso, title, lang);
			
			let lemmasPOJO = lemmas.map( lemma => lemma.POJO(lang) );
			lemmasPOJO = await Promise.all(lemmasPOJO);

			data.lemmas = lemmasPOJO;
			
			res.send({ success: true, data: data });

		} catch(e) {
			console.log(e);
			res.send({ success: false });
		}
	});

	app.get(
		`/lemmas/id/:id`, async function(req, res)
	{
		/* /lemmas/id/:id ? lang=(String)
		 *
		 * returns the POJO for the lemma with this id, in the given language
		 */
		try {
			let lemma = await Dict.getLemmaById(req.params.id);
			let POJO = await lemma.POJO(req.query.lang, fallBack=false);
			res.send(POJO);
		} catch {
			res.send({});
		}
	});

	app.post(
		"/lemmas", async function(req, res)
	{
		try {
			let lemma;
			try {
				lemma = await Lemma.addFailSafe
				(
					req.body.lemma,
					req.body.isoLemma,
					req.body.areYouSure
				);
			} catch(e) {
				console.log(e);
				if (e instanceof Exceptions.UserInputRequired) {
					res.send({ userInputRequired: true });
					return;
				}
				throw new Exceptions.ErrorWithinError;
			}
			
			await lemma.addSense
			(
				req.body.pos,
				req.body.isoDescr,
				req.body.descr
			);
			res.send({success: true});

		} catch(e) {
			console.log(e);
			res.send({success: false, error: e.name});
		}
	});
}