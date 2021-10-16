const POS = require("../models/part-of-speech.js");

module.exports = function(app){

	app.get("/pos/:lang", async function(req, res) {
		/* (lang) -> {"article": "artigo", "verb": "verbo" ...}
		 *
		 * returns a map with the parts of speech and their translations
		 * for requested language
		 */
		try {
			let pos = await POS.getAllByIso(req.params.lang);
			res.send(pos);
		} catch {
			res.send({});
		}
		
	});
}