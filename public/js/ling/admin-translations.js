async function updateDBMessage(data)
{
	currentTranslation.innerHTML = "";
	if (data.perfectMatch) {
		dbMessage.classList.add("use-bold");
		dbMessage.classList.add("text-green");
		dbMessage.innerText = `"${data.nearestMatch}" ${TERM_FOUND_IN_DB}`;
		nearestMatch.innerText = "";
		if (languageIso.value !== "none")
			fetchExistentTranslation();
	} else {
		dbMessage.classList.remove("success");
		dbMessage.innerText = `${NEAREST_MATCH}: `;
		nearestMatch.innerText = `"${data.nearestMatch}"`;
	}
}

async function changeNameInternal(){
	let searchTerm = nameInternal.value;

	if (await Generic.checkChange(nameInternal, searchTerm, 100))
		return;

	if (searchTerm.length < 3){
		dbMessage.innerText = nearestMatch.innerText = "";
		return;
	}

	let data = await API.getNearestMatchTranslation(searchTerm);
	updateDBMessage(data);
}

async function useNearestMatch(){
	nameInternal.value = nearestMatch.innerText.slice(1, -1);
	changeNameInternal();
}

async function fetchExistentTranslation(){
	let searchTerm = nameInternal.value;
	let iso = languageIso.value; 

	let data = await API.getExistentTranslation(searchTerm, iso);
	if (!data.success) {
		console.log(`${ERROR_FETCHING_TRANSLATION}: ${data.error}`);
		return;
	}

	let trans = data.existentTranslation;
	if (trans === "")
		currentTranslation.innerHTML =
			`<br>${NO_CURRENT_TRANSLATION}.`;
	else
		currentTranslation.innerHTML = 
			`<br>${CURRENT_TRANSLATION_IS} "${trans}"`;
}

async function submitTranslationForm(e){
    e.preventDefault();

	let name  = nameInternal.value;
	let iso   = languageIso.value;
	let trans = translation.value;

	if (iso === "none") {
		alert(`${NO_LANGUAGE_SELECTED}`);
		return;
	}

	let data = await API.patchTranslation(name, iso, trans);
	if (data.success){
		alert(`${TRANSLATION_SAVE_SUCCESS}.`);
		location.reload();
	} else
		alert(`${TRANSLATION_SAVE_FAIL}.`);
}

const form = document.getElementById("insert-translation-form");
const nameInternal = form.querySelector("input[name='name-internal']");
const languageIso = form.querySelector("select[name='language-iso']");
const translation = form.querySelector("input[name='translation-input']");

const dbMessage = document.getElementById("db-message");
const nearestMatch = document.getElementById("nearest-match");
const currentTranslation = document.getElementById("current-translation");

nameInternal.addEventListener("input", changeNameInternal);
nearestMatch.addEventListener("click", useNearestMatch);
languageIso.addEventListener("change", fetchExistentTranslation);
form.addEventListener("submit", submitTranslationForm);