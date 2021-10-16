/* ----- INTERACTION WITH THE AUTH INTERFACE ----- */

var Auth = new function()
/* ----- AUTH ----- */ {

async function postLogin(uname, passwd)
{
	let payload = 
	{
		uname: uname,
		passwd: passwd
	};
	return XHR.postData("/login", null, payload, null);
}

async function postRegister(uname, passwd)
{
	let payload = 
	{
		uname: uname,
		passwd: passwd
	};
	return XHR.postData("/register", null, payload, null);
}

async function postLogout()
{
	return XHR.postData("/logout", null, null, null);
}

/* ----- EXPORTS ----- */

this.postLogin = postLogin;
this.postRegister = postRegister;
this.postLogout = postLogout;

/* ----- AUTH ----- */ };