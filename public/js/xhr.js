var XHR = new function()
/*----- XHR ----- */ {

function formToJSON(form, options){
	const sz = form.children.length;
	let dict = {};
	for(let i = 0; i < sz; i++)
		formToJSON_2(form.children[i], dict);

	if (options !== undefined)
		for(key in options)
			dict[key] = options[key];
		
	return dict;
}

function formToJSON_2(el, dict){
	const validTags = ["INPUT", "SELECT", "TEXTAREA", "DATALIST", "OUTPUT"];
	if (validTags.includes(el.tagName))
		dict[el.name] = el.value;
	
	const sz = el.children.length;
	for(let i = 0; i < sz; i++)
		formToJSON_2(el.children[i], dict);
}

function formToJSONStr(form, options){
	let dict = formToJSON(form, options);
	return JSON.stringify(dict);
}

function formToJSONNative(form){
	const fd = new FormData(form);
	let dict = {};
	for(let [key, value] of fd.entries())
		dict[key] = value;
	return JSON.stringify(dict);
}
/* */

async function myFetch(url, params)
{
	let response = await fetch(url, params);
	if (!response.ok)
		throw new Error("Server returned error code.");

	let parsed = await response.json();

	/* This will throw an error in case response is {} or [] */
	if (Object.keys(parsed).length === 0)
		throw new Error("Server returned empty response.");

	if (parsed.redirect) {
		alert("You must login again!");
		location.href = parsed.redirect;
		throw new Error("Must reauthenticate.");
	}

	return parsed;
}

function checkType(path, payload, query)
{
	/* Check if objects are of the correct type
		*
		* Array path
		* Map   payload
		* Map   query
		*
		* */
	if (   (path 	&& !(path instanceof Array))
		|| (payload && !(payload.constructor == Object))
		|| (query 	&& !(query.constructor == Object))  ) {
		throw new Error("Invalid input");
	}
}

async function HTTPRequest(url, path, payload, query, method)
{
	/* This function supports the following HTTP verbs:
		* GET, HEAD, POST, PUT, PATCH, DELETE
		*/
	checkType(path, payload, query);

	let newUrl = url;
	
	if (path)
		for (let subpath of path)
			newUrl += "/" + subpath;

	if (query) {
		let queryStr = new URLSearchParams(query).toString();
		newUrl += "?" + queryStr;
	}

	let opt = 
	{
		method: method,
		headers: {
			'Content-Type': 'application/json'
		}
	}

	if(method !== "GET" && method !== "HEAD" && payload)
		opt.body = JSON.stringify(payload);

	return myFetch(newUrl, opt);
}

async function getData(url, path, query)
{
	/*
		* Array path
		* Map   query
		* */
	return HTTPRequest(url, path, null, query, "GET");
}

async function headData(url, path, query)
{
	/*
		* Array path
		* Map   query
		* */
	return HTTPRequest(url, path, null, query, "HEAD");
}

async function postData(url, path, payload, query)
{
	/*
		* Array path
		* Map   payload
		* Map   query
		* */
	return HTTPRequest(url, path, payload, query, "POST");
}

async function putData(url, path, payload, query)
{
	/*
		* Array path
		* Map   payload
		* Map   query
		* */
	return HTTPRequest(url, path, payload, query, "PUT");
}

async function patchData(url, path, payload, query)
{
	/*
		* Array path
		* Map   payload
		* Map   query
		* */
	return HTTPRequest(url, path, payload, query, "PATCH");
}

async function deleteData(url, path, payload, query)
{
	/*
		* Array path
		* Map   payload
		* Map   query
		* */
	return HTTPRequest(url, path, payload, query, "DELETE");
}


/*----- EXPORTS ----- */
{
	this.formToJSON = formToJSON;
	this.formToJSONStr = formToJSONStr;
	this.formToJSONNative = formToJSONNative;

	this.getData = getData;
	this.headData = headData;
	this.postData = postData;
	this.putData = putData;
	this.patchData = patchData;
	this.deleteData = deleteData;
}

/*----- XHR ----- */ };