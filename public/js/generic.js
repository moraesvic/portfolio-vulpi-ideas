var Generic = new function()
/* ----- GENERIC -----*/ {

function promiseTimeout(ms)
{
	return new Promise( (resolve, reject) => setTimeout(resolve, ms));
}

async function checkChange(DOMObj, initialState, ms)
{
	await promiseTimeout(ms);
	let value = DOMObj.value;
	return value === initialState ? false : true;
}

function randint(a, b)
{
	/* returns an integer in the range [a, b - 1]
	 * if b < a, then in the range [b, a - 1] */
	if (a === b)
		throw "Bad input";

	if (b < a) {
		let tmp = b;
		b = a;
		a = tmp;
	}
	let range = b - a;
	return a + _randint(range);
}

function _randint(n)
{
	/* returns an integer in the range [0, n - 1] */
	return Math.floor(Math.random() * n);
}

function pickFromArray(arr){
	/* returns a random element of the array */
	return arr[ randint(0, arr.length) ];
}

function useRandomImg(id, path, fileList)
{
	const img = document.getElementById(id);
	if (!img)
		throw "Given element is not in document";
	let chosenFile = pickFromArray(fileList);
	let src = `${path}${chosenFile}`;
	img.src = src;
}


/* ----- EXPORTS -----*/

this.promiseTimeout = promiseTimeout;
this.checkChange = checkChange;
this.randint = randint;
this.pickFromArray = pickFromArray;
this.useRandomImg = useRandomImg;

/* ----- GENERIC -----*/ };