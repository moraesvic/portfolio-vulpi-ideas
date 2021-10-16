const Language = require("../models/language.js");
const Auth = require("../middleware/auth.js");
const Priviledge = require("../middleware/priviledge.js");

module.exports = function(app){

	app.get("/lol", async function(req, res) {
		/* /lol ? map=(Boolean)
		 * -> ["pt", "en", "de", ...]
		 * OR
		 * { "pt": {"pt": "português", "en": "Portuguese"}, ... }
		 *
		 * Returns an array with all the languages in DB.
		 * Note that these aren't the site languages.
		 */
		try {
			let map = req.query.map;
			let langs;
			if (map && map === "true")
				langs = await Language.map();
			else
				langs = await Language.extractLangs();
			res.send(langs);
		} catch {
			res.send([]);
		}
	});

	app.post("/languages", Auth(Priviledge.ADMIN), async function(req, res) {
		try {
			await Language.addLanguage(
				req.body.nameInternal,
				req.body.iso1,
				req.body.iso2,
				req.body.iso3,
				req.body.endonym,
				req.body.notAvailable
			);
			res.send({success: true});
		} catch(e) {
			console.log(e);
			res.send({success: false, error: e.name});
		}
	});

	app.patch("/languages/:nameFor", async function(req, res) {
		try {
			await Language.addModifyLanguage(
				req.params.nameFor,
				req.body.nameIn,
				req.body.newName);
				res.send({success: true});
		} catch (e) {
			console.log(e);
			res.send({success: false, error: e.name});
		}
	});
}