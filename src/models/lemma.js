const MG = require("../utils/mongoose.js");
const Exceptions = require("../utils/exceptions.js")

// const POS = require("./part-of-speech.js");
const Sense = require("./sense.js");
// const Language = require("./language.js");


const B64 = require("../utils/base64.js");

/* */

const LemmaSchema = new MG.mongoose.Schema ({
	lemma: {
		type: String,
		required: true,
		immutable: true
	},
	inDictionary: {
		type: MG.schTypes.ObjectId,
		ref: "Dict",
		required: true,
		immutable: true
	},
	etymology: MG.schTypes.ObjectId,
	IPA: String,
	audio: Buffer,
	/* senses, grouped by part-of-speech */
	groups: [{
		pos: {
			type: MG.schTypes.ObjectId,
			ref: "POS"
		},
		senses: [{
			type: MG.schTypes.ObjectId,
			ref: "Sense"
		}]
	}],
	/* related lemmas in the same language */
	related: [MG.schTypes.ObjectId]
});

LemmaSchema.methods.getLang = 
async function()
{
	/* returns language iso for the lemma */
	await this.populate("inDictionary").execPopulate();
	await this.inDictionary.populate("language").execPopulate();

	return this.inDictionary.language.iso;
}

LemmaSchema.methods.delete = 
async function()
{
	const Dict = require("./dictionary.js");

	let updatedLemma = await this.constructor.findById(this._id);
	await updatedLemma
		.populate("groups.senses")
		.execPopulate();
	
	for (let group of updatedLemma.groups)
		for (let sense of group.senses) {
			await sense.delete();
		}
	await Dict.findByIdAndUpdate(
		this.inDictionary,
		{
			$pull: { lemmas: this._id }
		}
	)
	await this.constructor.findByIdAndDelete(this._id);
}

LemmaSchema.methods.dropSense = 
async function(senseId)
{
	/* 
	 * Drops the sense with given senseId
	 *
	 * We assume this was called by sense, which will subsequently
	 * delete the dropped sense
	 * 
	 * */

	/* 
	 * This is the best solution. Trying to do something different gave me:
	 * "Cannot use the part (senses) of (senses.senses) to traverse the element"
	 * 
	 */

	await Lemma.findOneAndUpdate(
		{
			_id: this._id,
			groups: { $elemMatch: { senses: senseId } }
		},
		{
			$pull: { "groups.$.senses": senseId }
		}
	);

	let updatedLemma = await Lemma.findByIdAndUpdate(
			this._id,
		{
			$pull: { groups: { senses: { $size: 0 } } }
		},
			{new: true}
	);

	let length = updatedLemma.groups.length;
	if (length === 0)
		updatedLemma.delete();
		
	return length;
}

LemmaSchema.methods.addSense = 
async function(partOfSpeech, isoDescr, description)
{
	return Sense.add(this._id, partOfSpeech, isoDescr, description);
}

LemmaSchema.methods.print = 
async function(langIso="eng")
{
	let iso = await this.getLang();
	s = `${this.lemma}\t\t(${iso})\n`;
	
	await this
		.populate("groups.pos")
		.populate("groups.senses")
		.execPopulate();
	
	for(let group of this.groups) {

		let pos = group.pos;
		await pos.populate("translation").execPopulate();
		let posTrans = await pos.translation.getForIso(langIso);
		s += `\n\n(*) ${posTrans}`;

		for(let sense of group.senses) {
			let senseTrans = await sense.getTransl(langIso);
			s += `\n\t${senseTrans}`;
		}
	}
	
	return s;
}

LemmaSchema.statics.getPOJOForList = 
async function(list, isoTrans)
{
	let lemmasPOJO = list.map(x => x.POJO(isoTrans, isoTrans));
	return await Promise.all(lemmasPOJO);
}

LemmaSchema.methods.POJO = 
async function(langIso=null)
{
	/* Return a POJO where each member is a string */
	// console.log(`Getting POJO for ${this} in ${langIso}, fallBack = ${fallBack}`);

	await this
		.populate("inDictionary")
		.populate("groups.pos")
		.populate("groups.senses")
		.execPopulate();

	let index = await this.inDictionary.getIndex(this.lemma, this._id);

	let POJO =
		{
			id: B64.hexStrToBase64( String(this._id) ),
			index: index,
			groups: []
		};
	
	for(let group of this.groups) {
		let newGroup = 
			{
				pos: null,
				senses: []
			};
		
		await group.pos.populate("translation").execPopulate();
		let docTrans = group.pos.translation;

		newGroup.pos =	langIso === null ?
						await docTrans.getForIso("eng") :
						await docTrans.getForIso(langIso);

		for(let sense of group.senses) {
			let senseTrans = 	langIso === null ?
								await sense.getDescriptionTranslationMap() :
								await sense.getTransl(langIso);
			newGroup.senses.push(senseTrans);
		}

		POJO.groups.push(newGroup);
	}
	
	return POJO;
}

LemmaSchema.methods.getSenseInPosition = 
async function(sensePosition)
{
	sensePosition = Number(sensePosition);
	await this.populate("groups").execPopulate();
	await this.populate("groups.senses").execPopulate();

	let i = 0;
	for(let group of this.groups)
		for(let sense of group.senses)
			if(i === sensePosition)
				return sense;
			else
				i++;
	
	throw new Exceptions.InexistentResource;
}

LemmaSchema.methods.getExistingTranslations = 
async function(sensePosition)
{
	sensePosition = Number(sensePosition);
	let sense = await this.getSenseInPosition(sensePosition);
	await sense.populate("description").execPopulate();
	return sense.description.getTransMap();
}

LemmaSchema.statics.findByIso =
async function(lemma, iso)
{
	/*
	 * This returns a list (!)
	 */
	const Dict = require("./dictionary.js");
	await MG.configAsync();

	let dict = await Dict.findByIso(iso);
	if (!dict)
		return null;

	return await this.find({lemma: lemma, inDictionary: dict._id});
}

LemmaSchema.statics.addFailSafe = 
async function(lemma, iso, areYouSure=false)
{
	const Dict = require("./dictionary.js");
	await MG.configAsync();

	/*
	 * If dictionary does not exist (though language does),
	 * we also create the dictionary
	 */

	let dict = 	await Dict.findByIso(iso)
				|| await Dict.add(iso, alreadyChecked=true);

	/*
	 * Remember: we could already have the given lemma for the given
	 * language in the collection. However, we could be adding a new
	 * lemma, whose etymology is different from the other.
	 */

	let homonyms = await Lemma.find({lemma: lemma, inDictionary: dict._id});
	if (homonyms.length > 0) {
		console.log(`! Warning ! Lemma ${lemma} already exists for ${iso}.`);
		console.log(homonyms);
		if (!areYouSure) {
			console.log(`Need user input to continue. Aborting.`);
			throw new Exceptions.UserInputRequired;
		}
		console.log("User allowed to continue.")
	}

	return this.add(lemma, iso);
}

LemmaSchema.statics.add = 
async function(lemma, iso)
{
	/* This function assumes that this is a new etymology.
	 * Likely the user will only access this by first passing through
	 * this.addFailSafe()
	 */
	const Dict = require("./dictionary.js");
	await MG.configAsync();
	
	let dict = 	await Dict.findByIso(iso)
				|| await Dict.add(iso, alreadyChecked=true);

	let newLemma = await Lemma.create({lemma: lemma, inDictionary: dict._id});
	await Dict.updateOne(
		{_id: dict._id},
		{ $push: { lemmas: newLemma._id } }
	);

	return newLemma;
}

const Lemma = MG.mongoose.model("Lemma", LemmaSchema, "Lemma");

module.exports = Lemma;


if (require.main === module)
{

}
