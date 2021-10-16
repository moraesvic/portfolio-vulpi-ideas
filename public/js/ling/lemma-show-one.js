/* ----- ADD MODIFY ----- */

async function sendAddModify(id, position, e)
{
	e.preventDefault();
	
	let translationIso = 
		this.querySelector('select[name="translation-iso"]').value;
	let newDescription = 
		this.querySelector('textarea[name="new-description"]').value;
	let newTranslation =
		this.querySelector('input[name="new-translation"]').value;

	if (translationIso === "none") {
		alert(MUST_CHOOSE_LANGUAGE_TRANSL);
		return;
	}

	if (isTranslatingIntoForeignLang())
	{
		let translationImpossible =
			document.getElementById("translation-impossible").checked;

		if (translationIso !== DICT_LANGUAGE
			&& newTranslation.length === 0
			&& translationImpossible === false)
		{
			alert(ALERT_TRANS_NEEDED_FOREIGN);
			return;
		}

	}
	else 
	{
		let data = await API.patchSense(id, position, translationIso, newDescription);
		if (data.success) {
			alert(TRANSLATION_ADD_SUCCESS);
			location.reload();
		} else {
			alert(`${AN_ERROR_OCCURRED}: ${data.error}`);
		}
	}
}

function togglePanel(panel, identifier)
{
	/*
	 * Returns true if a panel was closed
	 */
	let contains = panel.classList.contains(identifier);
	panel.className = "";

	if (contains) {
		panel.classList.add("not-displayed");
		return true;
	}
	
	panel.classList.add(identifier);
	return false;
}

async function populateSenseTranslations(id, position)
{
	let addModifyPanel = document.querySelector("#add-modify-panel");
	let tbody = addModifyPanel.querySelector("tbody");
	tbody.innerHTML = "";

	let data = await API.getSense(id, position);
	let html = "";
	for (let [lang, trans] of Object.entries(data))
		html += 
			`<tr>
				<td> ${lang} </td>
				<td> ${trans} </td>
			</tr>`;
	
	tbody.insertAdjacentHTML("beforeend", html);
}

function configAddModifyForm(id, position)
{
	let addDeleteSensePanel = document.querySelector("#add-delete-sense-panel");
	addDeleteSensePanel.className = "not-displayed";

	let addModifyPanel = document.querySelector("#add-modify-panel");
	let identifier = `${id}-${position}`;
	if (togglePanel(addModifyPanel, identifier))
		return;

	populateSenseTranslations(id, position);
	let entry = document.querySelector("#" + CSS.escape(id));
	let sense = entry.querySelectorAll(".sense")[position];
	sense.parentNode.insertBefore(addModifyPanel, null);

	let form = addModifyPanel.querySelector("form");
	form.addEventListener("submit", sendAddModify.bind(form, id, position));

	translationLangChanged();
}

function configAddModifyButtons()
{
	let entries = document.querySelectorAll(".entry");
	entries.forEach( entry => {
		const id = entry.id;
		let senses = entry.querySelectorAll(".sense");
		let position = 0;
		senses.forEach( sense => {
			let anchor = sense.querySelector("a");
			anchor.addEventListener(
				"click",
				configAddModifyForm.bind(anchor, id, position)
			);
			position++;
		})
	})
}

/* ---- EDIT-ENTRY ----- */

function configEditEntryButtons()
{
	const editEntry = document.querySelectorAll(".edit-entry");
	editEntry.forEach ( edit => {
		edit.onclick = buildAddDeleteSenseForm;
	});
}

function configEditEntryHeader(nHomonyms, index, lemma)
{
	let addDeleteSensePanel = document.querySelector("#add-delete-sense-panel");
	let lemmaDOM = addDeleteSensePanel.querySelector(".lemma");
	let indexDOM = addDeleteSensePanel.querySelector(".index");

	lemmaDOM.innerText = lemma;
	indexDOM.innerText = nHomonyms > 1 ? index : "";
}

async function wrapDeleteSense(id, position)
{
	let entry = document.querySelector("#" + CSS.escape(id));
	let sensesLeft = entry.querySelectorAll(".sense").length;
	let data = await API.deleteSense(id, position);
	if (!data.success)
		alert(`${AN_ERROR_HAPPENED}: ${data.error}`);
	else if (sensesLeft === 1) {
		alert(DELETED_LAST_SENSE);
		location = DICT_URL;
	} else {
		alert(SENSE_DELETE_SUCCESS);
		location.reload();
	}	
}

function buildEditEntryTable(id, groups)
{
	let addDeleteSensePanel = document.querySelector("#add-delete-sense-panel");
	let tbodyDOM = addDeleteSensePanel.querySelector("tbody");
	tbodyDOM.innerHTML = "";

	let position = 0;
	for (let group of groups)
		for (let sense of group.senses) {
			let tr = 
			`<tr>
				<td> ${group.pos} </td>
				<td> ${sense} </td>
				<td>
					<button class="btn btn-danger buffer-5">
						${DELETE}
					</button>
				</td>
			</tr>`;

			tbodyDOM.insertAdjacentHTML("beforeend", tr);
			tbodyDOM = addDeleteSensePanel.querySelector("tbody");
			let nodeList = tbodyDOM.querySelectorAll("button");
			let btn = nodeList[nodeList.length - 1];
			btn.addEventListener(
				"click",
				wrapDeleteSense.bind(btn, id, position)
			);

			position++;
		}
}

async function addSense(id, e)
{
	e.preventDefault();

	let partOfSpeech = this.querySelector('select[name="pos"]').value;
	let isoDescr = this.querySelector('select[name="descr-iso"]').value;
	let descr = this.querySelector('textarea[name="new-sense"]').value;

	if (partOfSpeech === "none") {
		alert(MUST_CHOOSE_POS);
		return;
	}
	if (isoDescr === "none") {
		alert(MUST_CHOOSE_LANGUAGE_DESCR);
		return;
	}

	let data = await API.postSense(id, partOfSpeech, isoDescr, descr);
	if (data.success){
		alert(SENSE_ADD_SUCCESS);
		location.reload();
	} else
		alert(`${ERROR}: ${data.error}`);
}

async function buildAddDeleteSenseForm()
{
	let id  = 	this.classList[0] === "edit-entry" ?
				this.classList[1] :
				this.classList[0] ;

	let addModifyPanel = document.querySelector("#add-modify-panel");
	addModifyPanel.className = "not-displayed";

	let addDeleteSensePanel = document.querySelector("#add-delete-sense-panel");
	let identifier = id;
	if ( togglePanel(addDeleteSensePanel, identifier) )
		return;

	let data = await API.getLemmaByIdInLanguage(id, PAGE_LANGUAGE_ISO);
	buildEditEntryTable(id, data.groups);
	configEditEntryHeader(data.nHomonyms, data.index, data.lemma);

	let form = addDeleteSensePanel.querySelector("form");
	form.addEventListener("submit", addSense.bind(form, id));
}

async function translationLangChanged()
{
	const newTranslation =
		document.querySelector("#add-modify-panel")
		.querySelector("[name='new-translation']");

	const newDescription = 
		document.querySelector("#add-modify-panel")
		.querySelector("[name='new-description']");

	const divNewTranslation =
		document.getElementById("div-new-translation");

	
	if (isTranslatingIntoForeignLang()) {
		const newValue = newTranslationIsoSelect.value;
		let map = await mapOfLanguages; 
		let transLangName = map[newValue][PAGE_LANGUAGE_ISO];

		let placeholder = `Insert a translation in ${transLangName}`;
		newTranslation.setAttribute("placeholder", placeholder);

		placeholder = `Insert a description in ${transLangName} (optional)`;
		newDescription.setAttribute("placeholder", placeholder);

		divNewTranslation.classList.remove("not-displayed");
	} else {
		divNewTranslation.classList.add("not-displayed");

		let placeholder = `Insert a description`;
		newDescription.setAttribute("placeholder", placeholder);
	}
}

function isTranslatingIntoForeignLang()
{
	return newTranslationIsoSelect.value == DICT_LANGUAGE;
}

/* ----- MAIN ----- */

let mapOfLanguages;

function main()
{
	Filler.populateIsoSelector(null, PAGE_LANGUAGE_ISO);
	Filler.populatePOSSelector(PAGE_LANGUAGE_ISO);
	configAddModifyButtons();
	configEditEntryButtons();
	mapOfLanguages = API.getMapOfLanguages();
}

const newTranslationIsoSelect = 
	document.querySelector("#add-modify-panel")
	.querySelector("select[name='translation-iso'");

newTranslationIsoSelect.addEventListener("change", translationLangChanged);

document.addEventListener("DOMContentLoaded", main);