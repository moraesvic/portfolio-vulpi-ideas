/* These functions should be used to fetch resources from the API 
 * and then fill the corresponding parts of the document 
 *
 * */

var Filler = new function()
/* ----- FILLER ----- */ {

async function populateIsoSelector(id=null, autoSelect=null)
{
	let languages = await API.getListOfLanguages();
	let html = "";

	for (let i = 0; i < languages.length; i++) {
		let iso = languages[i];
		html += `<option value=${iso}>${iso}</option>`;
	}

	function insertInSelector(selector)
	{
		selector.insertAdjacentHTML("beforeend", html);
		if (autoSelect)
			selector.value = autoSelect;
	}

	if (id) {
		let selector = document.getElementById(id);
		insertInSelector(selector);
	} else {
		let selectors = document.querySelectorAll(".iso-selector");
		selectors.forEach(insertInSelector);
	}
}

async function populatePOSSelector(isoLang)
{
	let partsOfSpeech = await API.getPartsOfSpeech(isoLang);
	let html = "";

	for (let [key, value] of Object.entries(partsOfSpeech)) {
		html += `<option value=${key}>${value}</option>`;
	}

	let selectors = document.querySelectorAll(".pos-selector");
	selectors.forEach( selector => {
		selector.insertAdjacentHTML("beforeend", html);
	});
}
/* ----- EXPORTS ----- */

this.populateIsoSelector = populateIsoSelector;
this.populatePOSSelector = populatePOSSelector;

/* ----- FILLER ----- */ };