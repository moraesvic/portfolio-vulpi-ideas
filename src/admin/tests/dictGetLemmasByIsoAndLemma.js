const MG = require("../../utils/mongoose.js");
const Dict = require("../../models/dictionary.js");

async function main()
{
	try {
		let lemmas = await Dict.getLemmasByIsoAndLemma
			("eng", "bank");
		console.log(lemmas);

		let lemmasPOJO = await Dict.getDataByIsoAndTitle
			("eng", "bank", "eng");
		console.log(lemmasPOJO);

	} catch(e) {
		console.log(e);
	} finally {
		MG.close();
	}
}

if (require.main === module)
{
	main();
}