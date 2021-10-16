const MG = require("../utils/mongoose.js");
const Exceptions = require("../utils/exceptions.js")

const Translation = require("./translation.js");

/* */

const POSSchema = new MG.mongoose.Schema ({
	name: {
		type: String,
		required: true,
		unique: true
	},
	/* link to translation object */
	translation: {
		type: MG.schTypes.ObjectId,
		ref: "Translation",
		required: true,
		unique: true
	}
});

POSSchema.statics.getAllByIso = 
async function(iso)
{
	await MG.configAsync();

	// console.log(`getAllByIso(${iso})`);
	let all = await this.find().exec();
	let dict = {};
	for(pos of all)
		dict[pos.name] = await pos.getByIso(iso);
	// console.log(dict);
	return dict;
}

POSSchema.statics.getMapByIso = 
async function(iso)
{
	await MG.configAsync();

	let all = await this.find().exec();
	let map = {};
	for(pos of all)
		map[pos.name] = await pos.getByIso(iso);
	return map;
}

POSSchema.methods.getByIso = 
async function(iso)
{
	await MG.configAsync();

	await this.populate("translation").execPopulate();
	return this.translation.getForIso(iso);
}

POSSchema.statics.add =
async function(name)
{
	await MG.configAsync();

	/* have we already got this POS? */
	let res = await this.findOne({name: name}).exec();
	
	/* have we already got a translation for this POS? */
	let nameInternal = `pos-${name}`;
	let op = {nameInternal: nameInternal};
	let trans = await Translation.updateOne(
		op,
		{$setOnInsert: op},
		{upsert: true, rawResult: true}
	).exec();
	trans = trans.upserted ?
			trans.upserted[0] :
			await Translation.findOne(op).exec();
	console.log(trans);

	let newPOS = res || await this.create({
		name: name,
		translation: trans._id
	});

	console.log(newPOS);
	return newPOS;
}

POSSchema.statics.useTraditionalPOS = 
async function()
{
	/* According to author and language there might be a different number
	 * of them, but the following works reasonably for IE languages.
	 *
	 * See: https://en.wikipedia.org/wiki/Part_of_speech 
	 * 
	 * */
	await MG.configAsync();

	let traditionalPOS = 
		[
			"noun",
			"verb",
			"adjective",
			"adverb",
			"pronoun",
			"preposition",
			"conjunction",
			"interjection",
			"article",
			"numeral",
			"participle"
		];
	for (pos of traditionalPOS) {
		console.log(`Inserting ${pos}`);
		try {
			let docPos = await POS.add(pos);
			await docPos.populate("translation").execPopulate();
			await docPos.translation.insert("eng", pos);
		} catch(e) {
			console.log(`Error insering ${pos}: ${e.name}`);
			console.log(e.stack);
		}
	}
}

POSSchema.methods.insertTransl =
async function(iso, value)
{
	await this.populate("translation").execPopulate();
	await this.translation.insert(iso, value);
}

const POS = MG.mongoose.model("POS", POSSchema, "POS");

module.exports = POS;

if (require.main === module)
{
	POS.getMapByIso("por")
	.then(console.log)
	.finally(MG.close);
}