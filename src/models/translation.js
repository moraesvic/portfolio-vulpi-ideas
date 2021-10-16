const MG = require("../utils/mongoose.js");
const Exceptions = require("../utils/exceptions.js");

const LV = require("fastest-levenshtein");
const TS = require("trigram-similarity");

const translSchema = new MG.mongoose.Schema ({
	_id: {
		type: MG.schTypes.ObjectId,
		default: MG.mongoose.Types.ObjectId
	},
	nameInternal: {
		type: String,
		required: true
	},
	translation: {
		type: Map,   /* will receive ObjectIds of the Languages */
		of: String,  /* the translations themselves */
		default: {}
	}
});

translSchema.methods.getTransMap = 
async function()
{
	const Language = require("./language.js");
	await MG.configAsync();
	
	let transMap = {};

	for (let key of this.translation.keys()) {
		let lang = await Language.findById(key);
		transMap[lang.iso] = this.translation.get(key);
	}

	return transMap;
}

translSchema.methods.getForIso = 
async function(iso, fallBack=true)
{
	const Language = require("./language.js");
	await MG.configAsync();

	// console.log(`Getting translation for ${this.nameInternal} in ${iso}`);

	for (let key of this.translation.keys()) {
		let lang = await Language.findById(key);
		if (lang.includesIso(iso)) {
			return this.translation.get(key);
		}
	}

	return fallBack ? this.constructor.translUnavailable(iso) : "";
}

translSchema.statics.translUnavailable =
async function(iso)
{
	const Language = require("./language.js");
	await MG.configAsync();

	console.log(`Translation unavailable for ${iso}. Returning fallback string.`);

	let transUnavailable = await this.findOne(
		{nameInternal: "message-translation-unavailable"}
	);
	
	for (let key of transUnavailable.translation.keys()) {
		let lang = await Language.findById(key);
		if (lang.includesIso(iso))
			return transUnavailable.translation.get(key);
	}

	console.log(`Fallback not found. Throwing error.`);

	throw new Exceptions.InexistentResource;
}

translSchema.statics.addWithId =
async function (id, nameInternal, iso, value)
{
	const Language = require("./language.js");
	await MG.configAsync();

	let lang = await Language.findByIso(iso);
	if (!lang)
		throw new Exceptions.InexistentResource;

	let trans = new Translation({
		_id: id,
		nameInternal: nameInternal
	});
	trans.translation.set(String(lang._id), value);
	trans = trans.save();
	return trans;
}

translSchema.methods.insert =
async function (iso, value)
{
	const Language = require("./language.js");
	await MG.configAsync();

	let lang = await Language.findByIso(iso);
	if (!lang)
		Exceptions.InexistentResource;

	this.translation.set(String(lang._id), value);
	await this.save();
	
	return this;
}

translSchema.statics.insertTransl =
async function (nameInternal, iso, value)
{
	/* starts a term, with at least one translation */
	/* if term already exists, then updates the value for given language */
	const Language = require("./language.js");
	await MG.configAsync();

	let lang = await Language.findByIso(iso);
	if (!lang)
		throw new Exceptions.InexistentResource;
	
	let filter = {nameInternal: nameInternal};
	let operation = { $setOnInsert: { nameInternal: nameInternal } };
	let options = { new: true, upsert: true };

	await this.updateOne(filter, operation, options);
	let trans = await this.findOne(filter);
	trans.translation.set(String(lang._id), value);
	trans = await trans.save();

	return trans;
}

async function getIndexOfArrMax(arr)
{
	if (!(arr instanceof Array) || arr.length === 0)
		throw Exceptions.InvalidInput;
	
	let maxIndex = 0;
	let max = arr[0];
	arr.forEach( (elem, index) => {
		if (elem > max){
			max = elem;
			maxIndex = index;
		}
	});
	return maxIndex;
}

translSchema.statics.nearestMatch = 
async function(nameInternal, levenshtein=false)
{
	await MG.configAsync();
	let res = await this.find().select("nameInternal -_id");
	if (!res)
		throw Exceptions.InexistentResource;
	let words = await res.map( entry => entry.nameInternal );

	let nearestMatch, distance;
	if (levenshtein){
		nearestMatch = LV.closest(nameInternal, words);
		distance = LV.distance(nameInternal, nearestMatch);
	} else {
		let sim = await words.map( word => TS(nameInternal, word) );
		let maxIndex = await getIndexOfArrMax(sim);
		nearestMatch = words[maxIndex];
		distance = sim[maxIndex];
	}
	
	return [nearestMatch, distance];
}

translSchema.statics.isInDB = 
async function(nameInternal)
{
	await MG.configAsync();
	let res = await this.findOne({nameInternal: nameInternal});
	return res ? true : false;
}

translSchema.statics.getExistentTranslation = 
async function(nameInternal, iso)
{
	await MG.configAsync();
	let lang = await Language.findByIso(iso);
	let trans = await this.findOne({nameInternal: nameInternal});
	if (!lang || !trans)
		throw Exceptions.InexistentResource;

	let currentTranslation = trans.translation.get(lang._id);
	return currentTranslation || "";
}

translSchema.methods.delete =
async function()
{
	await MG.configAsync();
	await this.constructor.findByIdAndDelete(this._id).exec();
}

Translation = MG.mongoose.model("Translation", translSchema, "Translation");

module.exports = Translation;

if (require.main === module)
{
	
}