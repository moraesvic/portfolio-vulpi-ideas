const MG = require("../utils/mongoose.js");
const Exceptions = require("../utils/exceptions.js")

const Translation = require("./translation.js");

const POS = require("./part-of-speech.js");

/* */

const SenseSchema = new MG.mongoose.Schema ({
	inLemma: {
		type: MG.schTypes.ObjectId,
		ref: "Lemma",
		required: true
	},
	description: {
		type: MG.schTypes.ObjectId,
		ref: "Translation",
		required: true
	},
	translations: [{
		language: {
			type: MG.schTypes.ObjectId,
			ref:  "Language"
		},
		possibleToTranslate: {
			type: Boolean
		},
		lemma: [{
			type: MG.schTypes.ObjectId,
			ref:  "Lemma"
		}]
	}],
	/* to be implemented later */
	synonyms: [{
		type: MG.schTypes.ObjectId,
		ref: "Lemma"
	}],
	inflected: [MG.schTypes.ObjectId],
	domain: [MG.schTypes.ObjectId],
	usage: [MG.schTypes.ObjectId],
	sociolinguistics: [MG.schTypes.ObjectId]
	
});

SenseSchema.methods.deleteDescr = 
async function()
{
	await this.populate("description").execPopulate();
	await this.description.delete();
}

SenseSchema.methods.addTransl =
async function(iso, value)
{
	await this.populate("description").execPopulate();
	await this.description.insert(iso, value);
}

SenseSchema.methods.delete = 
async function()
{
	await this.deleteDescr();
	await this.populate("inLemma").execPopulate();
	await this.inLemma.dropSense(this._id);
	await this.constructor.findByIdAndDelete(this._id);
}

/* rename to getDescriptionTranslation */
SenseSchema.methods.getTransl = 
async function(iso)
{
	await this.populate("description").execPopulate();
	return this.description.getForIso(iso);
}

SenseSchema.methods.getDescriptionTranslationMap = 
async function()
{
	await this.populate("description").execPopulate();
	return this.description.getTransMap();
}

SenseSchema.methods.insertTransl =
async function(iso, lemma)
{
	await MG.configAsync();

};

SenseSchema.statics.add =
async function(lemmaId, partOfSpeech, isoDescr, description)
{
	const Lemma = require("./lemma.js");
	
	await MG.configAsync();

	let docLemma =	await Lemma.findById(lemmaId).orFail();
	
	let descrId = new MG.mongoose.Types.ObjectId;

	let sense = await Sense.create({
		inLemma: lemmaId,
		description: descrId
	});

	let descr = await Translation.addWithId(
		descrId,
		String(sense._id),
		isoDescr,
		description
	);
	
	let pos = await POS.findOne({name: partOfSpeech}).orFail();

	/* Is a sense with this given PoS already given under this lemma? */
	let query = { _id: lemmaId, "groups.pos": pos._id };
	let match = await Lemma.findOne(query);

	if (!match) {
		console.log("Given PoS is not yet registered for the lemma");
		let newGroupEntry = {pos: pos._id, senses: [sense._id]};
		await Lemma.updateOne(
			{ _id: lemmaId },
			{ $push: { groups: newGroupEntry } }
		);
	} else {
		console.log("Given PoS is already registered for the lemma")
		await Lemma.updateOne(
			query,
			{ $push: { "groups.$.senses": sense._id} }
		)
	}

	docLemma = await Lemma.findById(lemmaId);
	
	return sense;
}

const Sense = MG.mongoose.model("Sense", SenseSchema, "Sense");

module.exports = Sense;

if (require.main === module)
{

}
