const MG = require("../../utils/mongoose.js");

const Lemma = require("../../models/lemma.js");
const Dict  = require("../../models/dictionary.js");
const Sense = require("../../models/sense.js");

const AFewLemmas = require("./addAFewLemmas.js");

async function main()
{
	try {
		let lemma = await Lemma.add("skate", "eng");
		let dict = await Dict.findByIso("eng");

		console.log(lemma);
		console.log(dict);
		console.log(await lemma.POJO("eng"));

		await Sense.add(
			lemma._id, "noun", "eng", AFewLemmas.SKATE_NOUN_1
		);
		await Sense.add(
			lemma._id, "noun", "eng", AFewLemmas.SKATE_NOUN_2
		);
		await Sense.add(
			lemma._id, "verb", "eng", AFewLemmas.SKATE_VERB_1
		);

		lemma = await Lemma.findById(lemma._id);
		console.log(await lemma.POJO("eng"));

		await lemma.delete();
		
	} catch(e) {
		console.log(`An error occurred: ${e.name}`);
		console.log(e.stack);
	} finally {
		MG.close();
	}
}

main();