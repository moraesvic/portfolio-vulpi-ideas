module.exports = function(app){

	const Lemmas = require("./lemmas.js")(app);
	const Senses = require("./senses.js")(app);
	const Languages = require("./languages.js")(app);
	const POS = require("./pos.js")(app);
	const Translations = require("./translations.js")(app);
	const Auth = require("./auth.js")(app);
}