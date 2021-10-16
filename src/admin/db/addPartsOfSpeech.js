const POS = require("../../models/part-of-speech.js");

const MG = require("../../utils/mongoose.js");

async function insertPT_ES_DE(what, pt, es, de)
{
	/*
	POSSchema.methods.insertTransl =
	async function(iso, value)
	*/
	let x = await POS.findOne({name: what});
	
	let promises = 
	[
		await x.insertTransl("pt", pt),
		await x.insertTransl("es", es),
		await x.insertTransl("de", de)
	];
}

async function main()
{
	await MG.configAsync();
	await POS.useTraditionalPOS();

	let translations = 
	[
		await insertPT_ES_DE("noun", "substantivo", "sustantivo", "Nomen"),
		await insertPT_ES_DE("verb", "verbo", "verbo", "Verb"),
		await insertPT_ES_DE("adjective", "adjetivo", "adjetivo", "Adjektiv"),
		await insertPT_ES_DE("adverb", "advérbio", "adverbio", "Adverb"),
		await insertPT_ES_DE("pronoun", "pronome", "pronombre", "Pronomen"),
		await insertPT_ES_DE("preposition", "preposição", "preposición", "Präposition"),
		await insertPT_ES_DE("conjunction", "conjunção", "conjunción", "Konjunktion"),
		await insertPT_ES_DE("interjection", "interjeição", "interjección", "Interjektion"),
		await insertPT_ES_DE("article", "artigo", "artículo", "Artikel"),
		await insertPT_ES_DE("numeral", "numeral", "numeral", "Zahlwort"),
		await insertPT_ES_DE("participle", "particípio", "participio", "Partizip")
	];

	await Promise.all(translations);

	MG.close();
}

if (require.main === module)
	main();

module.exports = main;