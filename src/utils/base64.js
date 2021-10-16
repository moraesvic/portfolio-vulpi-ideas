const Exceptions = require("./exceptions.js");

/* As the forward slash "/" has a special meaning in URLs, we had to change 
 * the specification slightly, using a hyphen "-" in its place
 * */

function hexStrToBase64(str)
{
	if (typeof(str) !== "string"
		|| str.length % 2 !== 0
		|| !str.toLowerCase().match(/^[0-9a-z]+$/))
		throw new Exceptions.InvalidInput;

	let nBytes = str.length / 2;
	const buf = Buffer.alloc(nBytes);
	for (let i = 0; i < str.length; i += 2) {
		let byteStr = str.slice(i, i + 2);
		let byte = parseInt(byteStr, 16);
		buf.writeUInt8(byte, i / 2);
	}

	return buf.toString("base64").replace(/\//g, "-");;
}

function base64ToHexStr(base64)
{
	if (typeof(base64) !== "string"
		|| !base64.match(/^[0-9a-zA-Z+\-=]+$/))
		throw new Exceptions.InvalidInput;

	let sub = base64.replace(/-/g, "/");
	let s = "";
	const buf = Buffer.from(sub, "base64");
	for (let i = 0; i < buf.length; i++) {
		let byteRepr = buf.readUInt8(i).toString(16);
		if (byteRepr.length === 1)
			byteRepr = "0" + byteRepr;
		s += byteRepr;
	}

	return s;
}

module.exports = {
	hexStrToBase64: hexStrToBase64,
	base64ToHexStr: base64ToHexStr
}