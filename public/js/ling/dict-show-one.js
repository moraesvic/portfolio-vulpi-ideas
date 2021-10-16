function toggleInsertNewWordForm()
{
	const insertNewWordForm = document.getElementById("insert-new-word-form");
	if (insertNewWordForm.classList.contains("not-displayed"))
		insertNewWordForm.classList.remove("not-displayed");
	else
		insertNewWordForm.classList.add("not-displayed");
}
function updateUsedAs()
{
	const usedAs = document.getElementById("used-as");
	let option = this.options[this.selectedIndex];
	let str = `${GIVE_DESCR_FOR_WORD} ${USED_AS} ${option.innerText}`;
	usedAs.setAttribute("placeholder", str);
}

async function submitNewWordForm(e)
{
	e.preventDefault();
	console.log(this);

	let lemma = this.querySelector('input[name="lemma"]').value;
	let lemmaIso = TARGET_LANGUAGE_ISO;
	let pos = this.querySelector('select[name="pos"').value;

	let descr = this.querySelector('textarea[name="descr"]').value;
	let descrIso = this.querySelector('select[name="descr-iso"]').value;

	let areYouSure = this.querySelector('input[name="sure"]').checked;
	let divAreYouSure = document.getElementById("are-you-sure");

	if (pos === "none") {
		alert(MUST_GIVE_POS);
		return;
	}
	if (descrIso === "none") {
		alert(MUST_CHOOSE_LANGUAGE);
	}

	let data = await API.postLemma
	(
		lemma,
		lemmaIso,
		pos, descr,
		descrIso,
		areYouSure
	);
	if (data.userInputRequired) {
		alert(ALERT_LEMMA_EXISTS);
		divAreYouSure.classList.remove("not-displayed");
		return;
	}
	if (data.success) {
		alert(LEMMA_ADD_SUCCESS);
		divAreYouSure.classList.add("not-displayed");
		location = `/${PAGE_LANGUAGE_ISO}/show-lemma/${TARGET_LANGUAGE_ISO}/${lemma}`;
	}
	else
		alert(`${REQUEST_FAILED}. ${TRY_AGAIN}.`);
}

function main()
{
	const insertNewWordForm = document.getElementById("insert-new-word-form");
	insertNewWordForm.addEventListener("submit", submitNewWordForm);
	
	const insertNewWordButton = document.getElementById("insert-new-word-button");
	insertNewWordButton.addEventListener("click", toggleInsertNewWordForm);

	const posSelector = document.getElementById("pos-selector");
	posSelector.addEventListener("change", updateUsedAs);

	Filler.populateIsoSelector(null, PAGE_LANGUAGE_ISO);
	Filler.populatePOSSelector(PAGE_LANGUAGE_ISO);
}

window.addEventListener("load", main);