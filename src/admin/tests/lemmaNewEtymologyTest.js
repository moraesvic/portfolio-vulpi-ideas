const MG = require("../../utils/mongoose.js");
const Lemma = require("../../models/lemma.js");

async function main()
{
	try {
		let lemma = await Lemma.addFailSafe("skate", "eng", true);

	} catch(e) {
		console.log(e);
	} finally {
		MG.close();
	}
}

async function clean()
{
	// need to delete the lemma and its entry in the dictionary
}

if (require.main === module)
{
	main();
}