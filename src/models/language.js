/*
 * This is really two modules but I can't figure out how to avoid a 
 * circular import
 */

const MG = require("../utils/mongoose.js");
const Exceptions = require("../utils/exceptions.js");

const Translation = require("./translation.js");

/* ----- ----- ----- ----- ----- ----- */

const langSchema = new MG.mongoose.Schema ({
	_id: {
		type: MG.schTypes.ObjectId
	},
	name: {
		type: MG.schTypes.ObjectId,
		ref:  "Translation",
		required: true
	},
	/*
	 * This is the ISO series 639 (639-1, 639-2, 639-3).
	 *
	 * While ISO 639-1 is sufficient to describe all the most spoken languages,
	 * it does not support ancient languages (some of which are covered in
	 * ISO 639-2), nor regional variants (such as the Arabic language spoken
	 * in Egypt).
	 *
	 * All languages must be identified with at least ONE ISO. When they are
	 * searched in the database, we will first look for ISO 639-1, then 2
	 * and then 3.
	 * 
	 * If a single language has two possibilities for the ISO 639-2 -- e.g.
	 * German has ISO 639-2-T "DEU" and ISO 639-2-B "GER" --, we will prefer
	 * the T form.
	 * 
	 */
	iso1: {
		type: String,
		lowercase: true,
		default: ""
	},
	iso2: {
		type: String,
		lowercase: true,
		default: ""
	},
	iso3: {
		type: String,
		lowercase: true,
		default: ""
	},
	glottologCode: {
		type: String,
		lowercase: true,
		default: ""
	},
	/* to be defined later... */
	writingSystem: MG.schTypes.ObjectId,
	family: MG.schTypes.ObjectId,
	region: MG.schTypes.ObjectId
});

langSchema.virtual("iso").get(function () {
	return this.iso1 || this.iso2 || this.iso3;
});

langSchema.virtual("isoArray").get(function () {
	return [ this.iso1, this.iso2, this.iso3 ];
});

langSchema.methods.includesIso =
function(iso)
{
	let isoArray = this.isoArray;
	return isoArray.includes(iso);
}

langSchema.statics.validateNewLanguage = 
function(nameInternal, iso1, iso2, iso3, endonym)
{
	if (typeof(nameInternal) === "string"
		&& typeof(iso1)    === "string"
		&& typeof(iso2)    === "string"
		&& typeof(iso3)    === "string"
		&& typeof(endonym) === "string")
	{
		iso1 = iso1.toLowerCase();
		iso2 = iso2.toLowerCase();
		iso3 = iso3.toLowerCase();

		if (   ( iso1.match(/^[a-z]{2}$/) || iso1 === "" )
			&& ( iso2.match(/^[a-z]{3}$/) || iso2 === "" ) 
			&& ( iso3.match(/^[a-z]{3}$/) || iso3 === "" )
			&& (  iso1 !== "" || iso2 !== "" || iso3 !== "")  )
			return true;
	}

	return false;
};

langSchema.statics.getCanonical = 
async function(iso)
{
	let lang = await this.findByIso(iso);
	if (!lang)
		throw new Exceptions.InexistentResource;

	return lang.iso;
}

langSchema.statics.findByIso = 
async function (iso)
{
	await MG.configAsync();
	
	if (iso.length === 0)
		throw new Exceptions.InvalidInput;

	return this.findOne({ $or: [
		{ iso1: iso },
		{ iso2: iso },
		{ iso3: iso }
	]}).exec();
}

langSchema.statics.addLanguage = 
async function (nameInternal, iso1, iso2, iso3, endonym, translNotAvailable)
{
	/* An endonym is the name of a language in the language itself */

	await MG.configAsync();

	if (!this.validateNewLanguage(
			nameInternal,
			iso1,
			iso2,
			iso3,
			endonym))
		throw new Exceptions.InvalidInput;

	let iso = iso1 || iso2 || iso3;

	let docTranslId = new MG.mongoose.Types.ObjectId;
	let docLangId = new MG.mongoose.Types.ObjectId;

	let existingNameInternal = await Translation.findOne(
		{nameInternal: nameInternal}
	);

	if (existingNameInternal)
		throw new Exceptions.AlreadyExistent;

	let filter = { $or: [
		{ iso1: iso },
		{ iso2: iso },
		{ iso3: iso }
	]}
	let operation = {
		$setOnInsert: 
			{
				_id: docLangId,
				name: docTranslId,
				iso1: iso1,
				iso2: iso2,
				iso3: iso3
			}
	}
	let options = {
		new: true,
		upsert: true,
		rawResult: true
	};

	let res = await this.updateOne(filter, operation, options);
	console.log(res);

	if (res.upserted === undefined)
		throw new Exceptions.AlreadyExistent;

	let translationJSON = {
		_id: docTranslId,
		nameInternal: nameInternal
	};

	let docTransl = await Translation.create(translationJSON);
	docTransl.translation.set(String(docLangId), endonym);
	docTransl.save();

	await Translation.insertTransl(
		"message-translation-unavailable",
		iso,
		translNotAvailable
	);

	const Dict = require("./dictionary.js");
	await Dict.add(iso);

	return res.value;
}

langSchema.statics.extractLangs =
async function()
{
	await MG.configAsync();

	let languages = await this.find({});

	let codes = [];

	for (lang of languages)
		codes.push(lang.iso);

	codes.sort();
	return codes;
}

langSchema.statics.map = 
async function()
{
	await MG.configAsync();

	let languages = await this.find().populate("name").exec();
	let codes = await this.extractLangs();
	let mapOuter = {};

	for (lang of languages) {
		let mapInner = {};
		for (iso of codes)
			mapInner[iso] = await lang.name.getForIso(iso, fallBack=false);
		mapOuter[lang.iso] = mapInner;
	}

	return mapOuter;
}

langSchema.statics.extractLangs2DTable = 
async function()
{
	/*
	 * languageTable = {
	 * 
	 * 		codes: ["en", "pt", "es", "de" ... ]
	 * 		maps: {
	 * 
	 * 			"en":
	 *	 			{
	 * 					"en": "English",
	 * 					"pt": "Portuguese",
	 * 					"es": "Spanish"
	 * 					...
	 * 				},
	 * 
	 * 			"pt":
	 * 				{
	 * 					"en": "inglês",
	 * 					"pt": "português"
	 * 					...
	 * 				}
	 * 			...
	 * 		}
	 * }
	 *
	 */

	await MG.configAsync();

	let languages = await this.find().populate("name").exec();

	let languageTable = {
		codes: await this.extractLangs(),
		maps: await this.map()
	};

	return languageTable;
}

langSchema.statics.addModifyLanguage = 
async function(nameFor, nameIn, newName)
{
	await MG.configAsync();

	let docNameFor = await this.findByIso(nameFor);
	let docNameIn  = await this.findByIso(nameIn);

	if (typeof(newName) !== "string" || newName.length === 0)
		throw new Exceptions.InvalidInput;

	if (docNameFor === null || docNameIn === null)
		throw new Exceptions.InexistentResource;

	await docNameFor.populate("name").execPopulate();
	let name = docNameFor.name;
	name.translation.set(String(docNameIn.id), newName);
	
	await name.save();
}

langSchema.methods.getTranslatedLangName
= async function(isoForTrans, fallBack=true)
{
	await MG.configAsync();

	await this.populate("name").execPopulate();
	return this.name.getForIso(isoForTrans, fallBack=fallBack);
}

Language = MG.mongoose.model("Language", langSchema, "Language");

/* ----- ----- ----- ----- ----- ----- */

module.exports = Language;
