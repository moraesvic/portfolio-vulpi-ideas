const MG = require("../../utils/mongoose.js");

const Lemma = require("../../models/lemma.js");
const Dict  = require("../../models/dictionary.js");
const Sense = require("../../models/sense.js");

async function main()
{
	try {
		await MG.configAsync();

		let engDict = await Dict.getByIso("eng");
		console.log(engDict);

		let engShortEntries = await Dict.getShortEntriesByIso("eng");
		console.log(engShortEntries);

		let engCompleteEntries = await Dict.getCompleteEntriesByIso("eng");
		console.log(engCompleteEntries);

		let dictsList = await Dict.getDictsList("eng");
		console.log(dictsList);

		dictsList = await Dict.getDictsList("de");
		console.log(dictsList);
		
	} catch(e) {
		console.log(`An error occurred: ${e.name}`);
		console.log(e.stack);
	} finally {
		MG.close();
	}
}

main();