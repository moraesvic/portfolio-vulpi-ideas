document.getElementById("include-language-form").onsubmit =
async function(e)
{
    e.preventDefault();

	const nameInternal = this.querySelector('input[name="name-internal"]').value;
	const iso1 = this.querySelector('input[name="iso1"]').value;
	const iso2 = this.querySelector('input[name="iso2"]').value;
	const iso3 = this.querySelector('input[name="iso3"]').value;
	const endonym = this.querySelector('input[name="endonym"]').value;
	const notAvailable = this.querySelector('input[name="not-available"]').value;

	if (iso1.value === "" && iso2.value === "" && iso3.value === "") {
		alert(`${MUST_USE_ISO_CODES}.`);
		return;
	}

	let data = await API.postLanguage(
		nameInternal,
		iso1,
		iso2,
		iso3,
		endonym,
		notAvailable);

	if (data.success) {
		alert(`${LANGUAGE_ADD_SUCCESS}!`);
		location.reload();
	} else {
		alert(`${LANGUAGE_ADD_FAIL}: ${data.error}`);
	}
}

document.getElementById("add-modify-language-form").onsubmit = async function(e){
    e.preventDefault();

	const nameFor = this.querySelector('select[name="name-for"]').value;
	const nameIn = this.querySelector('select[name="name-in"]').value;
	const newName = this.querySelector('input[name="new-name"]').value;

	if (nameFor === "none" || nameIn === "none") {
		alert(`${MUST_SELECT_BOTH_LANGUAGES}.`);
		return;
	}

	let data = await API.patchLanguage(nameFor, nameIn, newName);

	if (data.success) {
		alert(`${TRANSLATION_ADD_SUCCESS}!`);
		location.reload();
	} else {
		alert(`${REQUEST_FAIL}: ${data.error}`);
	}
}
