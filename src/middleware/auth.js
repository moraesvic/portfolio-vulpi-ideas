const Exceptions = require("../utils/exceptions.js");
const User = require("../db/user.js");

function getLanguageFromPath(path)
{
	let regexLang = new RegExp("^(/[a-zA-Z]{2,3})/?.*$");
	let regexMatch = path.match(regexLang);
	console.log(regexMatch);
	let language = 	regexMatch === null ?
					"" :
					regexMatch[1];

	/* Although "lol" is a three-character long alphabetic string,
	 * it is not a language but a resource (List Of Languages) */
	if (language === "/lol")
		language = "";

	return language;
}

function getResourceFromPath(path, language)
{
	let regexPart = language === "" ?
								"" :
								"(?:/[a-zA-Z]{2,3})";
	
	let regexResource = new RegExp(`^${regexPart}(/.+)$`);
	let matchResource = path.match(regexResource);
	let resource = 	matchResource === null ?
					path :
					matchResource[1];

	return resource;
}

function auth(priviledgeLevel){
	let f = async (req, res, next) => {
		console.log("Using auth middleware");
		console.log(req.method, req.path);
		
		try {
			let user = await User.checkIfAuth(req.cookies.authtoken, priviledgeLevel);
			/* User was found and is authorized */

			/* TO DO */

			// if request was GET and user's token has less than X minutes
			// to expire, then log user out to extend session and prevent a
			// frustrated POST request

			/* */
			next();
		} catch (e) {
			console.log("Authentication Error:", e.name);
			let language = getLanguageFromPath(req.path);
			// console.log(`language: ${language}`);
			
			if (   e instanceof Exceptions.TokenExpired
				|| e instanceof Exceptions.InvalidCredentials
				|| e instanceof Exceptions.InexistentResource   ){
				/* User is not authenticated */

				/* Did user come from a page with a language,
				 * like /en/admin, or simply /admin ?
				 * The API, for example, never takes a language as prefix,
				 * e.g. /lol?map=true */

				let resource = getResourceFromPath(req.path, language);
				// console.log(`resource ${resource}`);
				
				let newURI = `${language}/login?resource=${language}${resource}`;
				// console.log(`newURI ${newURI}`);

				if (req.method === "POST")
					res.send({ redirect: newURI });
				else
					res.redirect(newURI);
			}
			else if (e instanceof Exceptions.WrongPriviledges)
				res.redirect(`${language}/unauthorized`);
		}

	};

	return f;
}

module.exports = auth;