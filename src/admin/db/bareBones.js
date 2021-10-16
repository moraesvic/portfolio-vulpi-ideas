const addAFewLanguages = require("./addAFewLanguages.js");
const addPartsOfSpeech = require("./addPartsOfSpeech.js");
const addAFewLemmas = require("./addAFewLemmas.js");

async function main()
{
	await addAFewLanguages();
	await addPartsOfSpeech();
	await addAFewLemmas();
}

if (require.main === module)
	main();

module.exports = main;