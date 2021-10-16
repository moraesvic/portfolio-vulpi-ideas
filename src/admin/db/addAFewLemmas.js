const MG = require("../../utils/mongoose.js");

const Lemma = require("../../models/lemma.js");
const Dict  = require("../../models/dictionary.js");
const Sense = require("../../models/sense.js");

/*
 * Here we want to test a few things:
 *
 * ---> Same etymology, two parts of speech:
 * 
 * skate
 * 		Noun
 * 			1. a shoe with a steel blade on the underside, used to glide over ice; an ice-skate
 * 			2. a device with wheels on the underside, used to move a person or an object; a skateboard
 * 		Verb
 * 			1. to move on ice or roller skates in a gliding fashion
 */

const SKATE_NOUN_1 = "a shoe with a steel blade on the underside, used to glide over ice; an ice-skate";
const SKATE_NOUN_2 = "a device with wheels on the underside, used to move a person or an object; a skateboard";
const SKATE_VERB_1 = "to move on ice or roller skates in a gliding fashion";

/*
 * ---> Different etymologies, different parts of speech:
 * 
 * stalk (1)
 * 		Verb
 * 			1. to follow or harass a person
 * 
 * stalk (2)
 * 		Noun
 * 			1. the stem or main axis of a plant
 */

const STALK_1_VERB = "to follow or harass a person";
const STALK_2_NOUN = "the stem or main axis of a plant";

/*
 * ---> Different etymologies, same part of speech:
 * 
 * bank (1)
 * 		Noun
 * 			1. an institution where one takes care of financial affairs
 * 
 * bank (2)
 * 		Noun
 * 			1. the edge of a river, lake etc.
 */

const BANK_1_NOUN = "an institution where one takes care of financial affairs";
const BANK_2_NOUN = "the edge of a river, lake etc.";

/*
 * All the tests will be done in the English language.
 * 
 * */

async function main()
{
	try {
		await MG.configAsync();

		/* LEMMAS */
		/* first lemma creates dictionary, so we'd better await that */
		let skate = await Lemma.add("skate", "eng");

		let stalk1 = await Lemma.add("stalk", "eng");
		let stalk2 = await Lemma.add("stalk", "eng");
		let bank1 = await Lemma.add("bank", "eng");
		let bank2 = await Lemma.add("bank", "eng");

		let lemmas = [ stalk1, stalk2, bank1, bank2 ];

		[ stalk1, stalk2, bank1, bank2 ] = await Promise.all(lemmas);

		/* SENSES */

		/* We need to create then one at a time, otherwise
		 * nasty things happen.
		 * If we need this in the future, it is better to implement some
		 * queue.
		 */
		let senses = 
		[
			await skate.addSense("noun", "eng", SKATE_NOUN_1),
			await skate.addSense("noun", "eng", SKATE_NOUN_2),
			await skate.addSense("verb", "eng", SKATE_VERB_1),
			await stalk1.addSense("verb", "eng", STALK_1_VERB),
			await stalk2.addSense("noun", "eng", STALK_2_NOUN),
			await bank1.addSense("noun", "eng", BANK_1_NOUN),
			await bank2.addSense("noun", "eng", BANK_2_NOUN)
		];
		
	} catch(e) {
		console.log(` ***** An error occurred : ${e.name} *****`);
		console.log(e.stack);
	} finally {
		MG.close();
	}
}

if (require.main === module)
	main();

module.exports = main;