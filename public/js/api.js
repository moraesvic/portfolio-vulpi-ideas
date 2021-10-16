
/* ----- INTERACTION WITH THE API ----- */

var API = new function()
/* ----- API ----- */ {

async function postLemma
(
	lemma,
	isoLemma,
	pos,
	descr,
	isoDescr,
	areYouSure
)
{
	let payload = 
	{
		lemma: lemma,
		isoLemma: isoLemma,
		pos: pos,
		descr: descr,
		isoDescr: isoDescr,
		areYouSure: areYouSure
	};
	return XHR.postData("/lemmas", null, payload, null);
}

async function getSense(id, position)
{
	return XHR.getData("/senses", [id, position]);
}

async function postSense(id, partOfSpeech, isoDescr, descr)
{
	let payload =
	{
		partOfSpeech: partOfSpeech,
		isoDescr: isoDescr,
		descr: descr
	}
	return XHR.postData("/senses", [id], payload);
}

async function patchSense(id, position, translationIso, newTranslation)
{
	let payload = {
		translationIso: translationIso,
		newTranslation: newTranslation
	}
	return XHR.patchData("/senses", [id, position], payload);
}

async function deleteSense(id, position)
{
	return XHR.deleteData("/senses", [id, position]);
}

function getListOfLanguages()
{
	return XHR.getData("/lol");
}

function getMapOfLanguages()
{
	let query = { map: "true" };
	return XHR.getData("/lol", null, query);
}

function getPartsOfSpeech(lang)
{
	return XHR.getData('/pos', [lang]);
}

function getLemmaByIdInLanguage(id, lang)
{
	let query = { lang: lang };
	return XHR.getData("/lemmas/id", [id], query);
}

function getAllLemmasPOJOInDict(iso)
{
	return XHR.getData("/lemmas/iso", [iso])
}

function getAllLemmasPOJOInDictWithTransl(iso, translIso)
{
	let query = { lang: translIso };
	return XHR.getData("/lemmas/iso", [iso], query)
}

function getLemmasPOJOInDictByTitle(iso, title)
{
	let query = { title: title };
	return XHR.getData("/lemmas/iso", [iso], query)
}

function getLemmasPOJOInDictByTitleWithTransl(iso, title, translIso)
{
	let query = { title: title, lang: translIso };
	return XHR.getData("/lemmas/iso", [iso], query)
}

function getLemmaCountInDictByTitle(iso, title)
{
	let query = { title: title, count: "true" };
	return XHR.getData("/lemmas/iso", [iso], query)
}

/* ----- */

function postLanguage(
	nameInternal,
	iso1,
	iso2,
	iso3,
	endonym,
	notAvailable)
{
	let payload = 
	{
		nameInternal: nameInternal,
		iso1: iso1,
		iso2: iso2,
		iso3: iso3,
		endonym:  endonym,
		notAvailable: notAvailable
	};
	return XHR.postData("/languages", null, payload, null);
}

function patchLanguage(
	nameFor,
	nameIn,
	newName)
{
	let payload = 
	{
		nameIn: nameIn,
		newName: newName
	};
	return XHR.patchData("/languages", [nameFor], payload, null);
}

/* ---- */

function getNearestMatchTranslation(nameInternal)
{
	return XHR.getData("/translations/check", [nameInternal], null);
}

function getExistentTranslation(nameInternal, iso)
{
	return XHR.getData("/translations/get", [nameInternal, iso], null);
}

function patchTranslation(nameInternal, iso, newTranslation)
{
	let payload = 
	{
		iso: iso,
		newTranslation: newTranslation
	};
	return XHR.patchData("/translations", [nameInternal], payload, null);
}
/* ----- EXPORTS ----- */
{
	this.getSense = getSense;
	this.postSense = postSense;
	this.patchSense = patchSense;
	this.deleteSense = deleteSense;

	this.getListOfLanguages = getListOfLanguages;
	this.getMapOfLanguages = getMapOfLanguages;

	this.getPartsOfSpeech = getPartsOfSpeech;

	this.getLemmaByIdInLanguage = getLemmaByIdInLanguage;
	this.postLemma = postLemma;

	this.postLanguage = postLanguage;
	this.patchLanguage = patchLanguage;

	this.getNearestMatchTranslation = getNearestMatchTranslation;
	this.getExistentTranslation = getExistentTranslation;
	this.patchTranslation = patchTranslation;
}


/* ----- API ----- */ };