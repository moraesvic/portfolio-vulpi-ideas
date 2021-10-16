const MG = require("../../utils/mongoose.js");

const Translation = require("../../models/translation.js");

async function createTestString()
{
	let trans = await Translation.insertTransl(
		"test-string",
		"eng",
		"This is a test string");
	
	console.log(trans);

	await MG.close();
}

async function deleteTestString()
{
	await MG.configAsync();

	let trans = await Translation.findOne({nameInternal: "test-string"});
	console.log(trans);
	await trans.delete();

	await MG.close();
}

async function main()
{

}

main();