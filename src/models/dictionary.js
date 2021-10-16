const MG = require("../utils/mongoose.js");
const Exceptions = require("../utils/exceptions.js")

const Language = require("./language.js");
const Translation = require("./translation.js");

const Lemma = require("./lemma.js");

const B64 = require("../utils/base64.js");

/* */

const DictSchema = new MG.mongoose.Schema ({
	language: {
		type: MG.schTypes.ObjectId,
		ref: "Language",
		required: true,
		unique: true
	},
	lemmas: [{
		type: MG.schTypes.ObjectId,
		ref: "Lemma"
	}],
	/* for later */
	nonLemmas: [{
		type: MG.schTypes.ObjectId
		// ref: "NonLemma"
	}]
});

DictSchema.statics.findByIso = 
async function(iso)
{
	await MG.configAsync();

	let lang = await Language.findByIso(iso);
	if (!lang)
		throw new Exceptions.InexistentResource;

	return Dict.findOne({language: lang._id});
}

DictSchema.statics.add =
async function(iso, alreadyChecked=false)
{
	await MG.configAsync();

	let lang = await Language.findByIso(iso);
	if (!lang)
		throw new Exceptions.InexistentResource;

	let dict = 	alreadyChecked ?
				null :
				await this.findOne({language: lang._id});
	
	return dict || this.create({language: lang._id});
}

DictSchema.statics.getByIso = 
async function(iso)
{
	await MG.configAsync();

	let res = await this.find().populate("language").exec();
	for (let dict of res) {
		if (dict.language.includesIso(iso))
			return dict;
	}
	throw new Exceptions.InexistentResource;
}

/* This could go into the API,
 * but is not suitable for the browser view */
DictSchema.statics.getCompleteEntriesByIso = 
async function(iso="eng")
{
	await MG.configAsync();

	let dict = await this.getByIso(iso);
	return dict.getCompleteEntries();
}

DictSchema.methods.getCompleteEntries =
async function()
{
	await MG.configAsync();

	await this.populate("lemmas").execPopulate();
	let entries = [];
	for (let entry of this.lemmas)
		entries.push(await entry.POJO());
	
	/* later include here also the locale */
	entries.sort( (a,b) => a.lemma.localeCompare(b.lemma) );

	return entries;
}

DictSchema.statics.getShortEntriesByIso = 
async function(iso="eng", skip=0, limit=0)
{
	let dict = await this.getByIso(iso);
	return dict.getShortEntries(skip, limit);
}

DictSchema.methods.getShortEntries = 
async function(skip=0, limit=0)
{
	await MG.configAsync();
	await this.populate("lemmas").execPopulate();

	let set = new Set();
	for (let entry of this.lemmas)
			set.add(entry.lemma);
	
	let entries = Array.from(set);
	/* later include here also the locale */
	entries.sort( (a,b) => a.localeCompare(b) );

	return entries;
}

DictSchema.statics.countLemmasByIsoAndTitle =
async function(iso, title)
{
	await MG.configAsync();

	let dict = await this.findByIso(iso);

	if (!title)
		return dict.lemmas.length;

	await dict.populate("lemmas").execPopulate();

	let n = 0;
	for (let lemma of dict.lemmas) {
		if (lemma.lemma === title)
			n++;
	}

	return n;
}

DictSchema.statics.getLemmasByIsoAndTitle =
async function(iso, title)
{
	await MG.configAsync();

	let dict = await this.findByIso(iso);
	await dict.populate("lemmas").execPopulate();

	let arr = [];
	for (let lemma of dict.lemmas) {
		if (lemma.lemma === title)
			arr.push(lemma);
	}

	return arr;
}

DictSchema.statics.getHeaderDataByIsoAndTitle =
async function(iso, title, isoTrans)
{
	let header =
	{
		title: title,
		language: await Language.getCanonical(iso),
		lemmas: []
	};

	if (title)
		header.nHomonyms = await this.countLemmasByIsoAndTitle(iso, title);

	if (isoTrans) {
		let dict = await this.findByIso(iso);
		header.translatedLangName = await dict.getTranslatedLangName
			( isoTrans, fallBack=true );
	}
	return header;
}

DictSchema.statics.getDataByIsoAndTitle =
async function(iso, title, isoTrans)
{
	let data = await this.getHeaderDataByIsoAndTitle(iso, title, isoTrans);

	let lemmas = await this.getLemmasByIsoAndTitle(iso, title);
	data.lemmas = await Lemma.getPOJOForList(lemmas, isoTrans);
	
	return data;
}

DictSchema.statics.getLemmaByIsoAndId = 
async function(iso, idBase64)
{
	await MG.configAsync();

	let dict = await this.findByIso(iso);
	let id = B64.base64ToHexStr(idBase64);
	// console.log(id);

	let index = dict.lemmas.indexOf(id);

	if (index === -1)
		throw new Exceptions.InexistentResource;

	await dict.populate("lemmas").execPopulate();

	return dict.lemmas[index];
}

DictSchema.statics.getLemmaById =
async function(idBase64)
{
	await MG.configAsync();

	let allDicts = await this.find().exec();
	let id = B64.base64ToHexStr(idBase64);

	console.log("decoded id is", id);

	for (dict of allDicts) {
		let index = dict.lemmas.indexOf(id);
		console.log("index is", index);
		if (index !== -1) {
			await dict.populate("lemmas").execPopulate();
			console.log("dict", dict);
			let ret = dict.lemmas[index];
			console.log("ret", ret);
			return ret;
		}
	}

	throw new Exceptions.InexistentResource;
}

DictSchema.methods.getIndex =
async function(title, id)
{
	await MG.configAsync();
	await this.populate("lemmas").execPopulate();

	let lemmasWithString = this.lemmas.filter( x => x.lemma === title );

	let len = lemmasWithString.length;
	let index = lemmasWithString.map( x => x._id ).indexOf(String(id));
	
	if (len === 0 || index === -1)
		throw new Exceptions.InexistentResource;

	return index + 1;	
}

DictSchema.statics.getLemmaIdByIsoLemmaIndex = 
async function(iso, lemmaStr, index)
{
	await MG.configAsync();

	// console.log(iso, lemmaStr, index);
	let dict = await this.findByIso(iso);
	await dict.populate("lemmas").execPopulate();

	let lemmasWithString = dict.lemmas.filter( x => x.lemma === lemmaStr );
	// console.log(lemmasWithString);
	let len = lemmasWithString.length;
	index = Number(index) - 1;

	if (index >= len)
		throw new Exceptions.InexistentResource;

	return lemmasWithString[index]._id;
}

DictSchema.statics.getLemmaBase64ByIsoLemmaIndex = 
async function(iso, lemmaStr, index)
{
	return B64.hexStrToBase64(
		String(
			await this.getLemmaIdByIsoLemmaIndex(iso, lemmaStr, index)
	));
}

DictSchema.methods.getTranslatedLangName = 
async function(isoForTrans, fallBack=true)
{
	await MG.configAsync();

	await this.populate("language").execPopulate();
	return this.language.getTranslatedLangName(isoForTrans, fallBack=fallBack);
}

DictSchema.statics.getDictsList = 
async function(isoForTrans)
{
	await MG.configAsync();

	let dicts = await this.find();
	let list = [];
	for (let dict of dicts) {
		await dict.populate("language").execPopulate();
		let obj = 
		{
			name: await dict.getTranslatedLangName(isoForTrans),
			iso: dict.language.iso,
			nLemmas: dict.lemmas.length
		};
		list.push(obj);
	}
	return list;
}

const Dict = MG.mongoose.model("Dict", DictSchema, "Dict");

module.exports = Dict;

