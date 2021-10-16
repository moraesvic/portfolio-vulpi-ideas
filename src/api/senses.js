const Dict = require("../models/dictionary.js");
const Lemma = require("../models/lemma.js");

module.exports = function(app){

	app.post(`/senses/:id`, async function(req, res){
		console.log(req.body);
		try {
			let lemma = await Dict.getLemmaById(req.params.id);
			let sense = await lemma.addSense(
				req.body.partOfSpeech,
				req.body.isoDescr,
				req.body.descr
			);
			res.send({success:true});
		} catch(e) {
			console.log(e);
			res.send({success:false, error: e.name});
		}
	})

	app.get(
		`/senses/:id/:position`, async function(req,res)
	{
		/* (id, position)
		 * 
		 * returns all the existing translations for sense at such position
		 * from such lemma
		 * 
		 */
		try {
			let lemma = await Dict.getLemmaById(req.params.id);
			console.log("Found lemma", lemma);
			let payload = await lemma.getExistingTranslations(req.params.position);
			res.send(payload);
		} catch (e) {
			console.log(e);
			res.send({});
		}
	});

	app.patch(
		`/senses/:id/:position`, async function(req,res)
	{
		console.log(req.params);
		try {
			let lemma = await Dict.getLemmaById(req.params.id);
			let sense = await lemma.getSenseInPosition(req.params.position);
			await sense.addTransl(
				req.body.translationIso,
				req.body.newTranslation);
			res.send({success: true});
		} catch(e) {
			res.send({success: false, error: e.name});
		}
	});

	app.delete(
		`/senses/:id/:position`, async function(req,res)
	{
		try {
			let lemma = await Dict.getLemmaById(req.params.id);
			let sense = await lemma.getSenseInPosition(req.params.position);
			let groupsLength = await sense.delete();
			res.send({success: true});
		} catch(e) {
			console.log(e);
			res.send({success: false, error: e.name});
		}
	});
}