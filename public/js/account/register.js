document.getElementById("register-form")
.addEventListener("submit",
async function(e)
{
    e.preventDefault();

	const uname = document.getElementById("uname").value;
	const passwd = document.getElementById("passwd").value;
	const repeat = document.getElementById("repeat-passwd").value;

	if (uname.length < 6){
		alert(`${USERNAME_TOO_SHORT}`);
		return;
	} else if (passwd.length < 8) {
		alert(`${PASSWORD_TOO_SHORT}`);
		return;
	} else if (passwd !== repeat) {
		alert(`${PASSWORD_REPEAT_DONT_MATCH}`);
		return;
	}
		
	let data = await Auth.postRegister(uname, passwd);
	if (data.success){
		alert(`${USER_REGISTER_SUCCESS}!`);
		location.replace(`/${PAGE_LANGUAGE_ISO}`);
	} else {
		alert(data.error);
		location.reload();
	}

});