const MG = require("../../utils/mongoose.js");

const Language = require("../../models/language.js");

async function main()
{
	/*

	langSchema.statics.addLanguage = 
	async function (nameInternal, iso1, iso2, iso3, endonym, translNotAvailable)

	*/
	await MG.configAsync();

	let baseLangs = 
	[
		await Language.addLanguage(
			"lang-english",
			"en",
			"eng",
			"eng",
			"English",
			"translation unavailable"),
		await Language.addLanguage(
			"lang-portuguese",
			"pt",
			"por",
			"por",
			"português",
			"tradução indisponível"),
		await Language.addLanguage(
			"lang-spanish",
			"es",
			"spa",
			"spa",
			"español",
			"traducción indisponible"),
		await Language.addLanguage(
			"lang-german",
			"de",
			"deu",
			"deu",
			"Deutsch",
			"keine Übersetzung verfügbar")
	];

	/*
	langSchema.statics.addModifyLanguage = 
	async function(nameFor, nameIn, newName)
	*/

	let translations = 
	[
		await Language.addModifyLanguage("en", "pt", "inglês"),
		await Language.addModifyLanguage("en", "es", "inglés"),
		await Language.addModifyLanguage("en", "de", "Englisch"),
	
		await Language.addModifyLanguage("pt", "en", "Portuguese"),
		await Language.addModifyLanguage("pt", "es", "portugués"),
		await Language.addModifyLanguage("pt", "de", "Portugiesisch"),
	
		await Language.addModifyLanguage("es", "en", "Spanish"),
		await Language.addModifyLanguage("es", "pt", "espanhol"),
		await Language.addModifyLanguage("es", "de", "Spanisch"),
	
		await Language.addModifyLanguage("de", "en", "German"),
		await Language.addModifyLanguage("de", "pt", "alemão"),
		await Language.addModifyLanguage("de", "es", "alemán")
	];
	
}

if (require.main === module)
	main();

module.exports = main;