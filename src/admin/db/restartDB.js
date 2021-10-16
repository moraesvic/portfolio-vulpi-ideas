const MG = require("../../utils/mongoose.js");

const Dict = require("../../models/dictionary.js");
const Language = require("../../models/language.js");
const Lemma = require("../../models/lemma.js");
const POS = require("../../models/part-of-speech.js");
const Sense = require("../../models/sense.js");
const Translation = require("../../models/translation.js");

const BareBones = require("./bareBones.js");

async function main()
{
	await MG.configAsync();

	const models = 
	[
		Dict, Language, Lemma, POS, Sense, Translation
	];

	let promises = [];

	for (let i = 0; i < models.length; i++)
		promises.push( models[i].deleteMany() );
	
	await Promise.all(promises);
	await BareBones();
}

if (require.main === module)
	main();