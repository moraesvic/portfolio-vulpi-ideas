function getCookie(name)
{
	return document.cookie
	.split("; ")
	.find(row => row.startsWith(name + "="))
	.split("=")[1];
}

function setCookie(name, value, options)
{
	let s = `${name}=${value}; `;
	if (options)
		Object.keys(options).forEach( key => {
			s += `${key}=${options[key]};`
		});
	document.cookie = s;
}