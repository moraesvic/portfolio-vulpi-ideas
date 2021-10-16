const Glob = require('glob').Glob;
const fs = require('fs');

const MyMinify = require("./minify.js");

function getAssetFolder(app, assetInternal)
{
	const localeFolder = app.get('locale-folder');
    const assetFolder = localeFolder + assetInternal + '/';
	return assetFolder;
}

function getAssetJson(app, assetInternal, lang)
{
	const assetFolder = getAssetFolder(app, assetInternal);
	const jsonFile = assetFolder + lang + '.json';
	return jsonFile;
}

async function getAvailableLangs(app, assetInternal)
{
	return new Promise((resolve, reject) => {
        const assetFolder = getAssetFolder(app, assetInternal);
		// Debug.dprint(app, `Searching for available languages in ${assetFolder}`);
        let availableLangs = [];
        let search = new Glob(assetFolder + '*',
        {}, function(err, matches){
            if (!matches)
                /* return 404 - asset doesn't exist */
            if (err) {
                console.log("An error occurred!");
                console.log(err);
                reject(err);
            }
            matches.forEach( el => {
                /* 
				* the following regex will grab
                * reg[1] = path
                * reg[2] = filename without extension
                * reg[3] = extension 
				* */
                const reg = el.match(/^\/(.+\/)*(.+)\.(.+)$/);
                if (reg[3] === 'json')
                    availableLangs.push(reg[2]);
            });
			// Debug.dprint(app, "These are the available languages:");
			// Debug.dprint(app, availableLangs);
            resolve(availableLangs);
        });
    });
}

function getPreferredLang(app, req, res, availableLangs)
{
	if (availableLangs.length === 0) {
		// Debug.dprint(app, `No available languages for requested asset.`);
		let public = app.get('public');
		res.status(404).sendFile(public + '404.html');
		return null;
	}

    let prefLang = req.acceptsLanguages(...availableLangs);
	
    if (!prefLang) {
        /* user's browser accepts none of the available languages
        * Switch to English (default) */
        prefLang = 'en';
    }
    return prefLang;
}

async function getLocaleData(app, assetInternal, prefLang)
{
	const jsonFile = getAssetJson(app, assetInternal, prefLang);
	// Debug.dprint(app, `Getting locale from ${jsonFile}`);
	return readJSONFile(jsonFile);
}

function rewriteQuery(query)
{
	/* Receives req.query and returns a string corresponding to this
	 * query */
	let s = "";
	if (query){
		s += "?"
		Object.keys(query).forEach( key => 
			s += `${key}=${query[key]}&`
		);
		s = s.slice(0, -1);
	}
	return s;
}

async function redirectPrefLang(app, req, res, asset)
{
	if (   
		   typeof(asset)          === "undefined"
		|| typeof(asset.internal) === "undefined"
		|| typeof(asset.alias)    === "undefined"
		) {
			console.log("Asset invalid, cannot continue.")
			return;
	}
    const avLangs = await getAvailableLangs(app, asset.internal);
	const prefLang = getPreferredLang(app, req, res, avLangs);
    
	if (prefLang === null)
		return;

	// Debug.dprint(app, "This is the preferred language:");
	// Debug.dprint(app, prefLang);
	let url = '/' + prefLang;
	url += asset.internal === "home" ? "" : req.path;
	
	/* rewrite the query */
	let q = rewriteQuery(req.query);

	res.redirect(url + q);
}

async function jsoncat(a, b)
{
	/* concatenates 2 dictionaries
	(in our case, used for JSON files) */
	let c = await b;
	for(let key in c)
		a[key] = c[key];
	return;
}

async function getTimeLastUpdate(app, assetInternal, lang)
{
	const jsonFile = getAssetJson(app, assetInternal, lang);
	const ejsFile = app.get("views") + assetInternal + ".ejs";

	const options = {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		timeZoneName: "short"
	};

	const jsonTime = fs.promises.stat(jsonFile);
	const ejsTime = fs.promises.stat(ejsFile);
	let jsonStat, ejsStat;
	[jsonStat, ejsStat] = await Promise.all([jsonTime, ejsTime]);

	const latest = jsonStat.mtime > ejsStat.mtime ? jsonStat.mtime : ejsStat.mtime;

	return latest.toLocaleDateString(lang, options);
}

async function readJSONFile(file)
{
	/* reads a file containing (hopefully) JSON data,
	and returns the corresponding JSON object */
	let data = await fs.promises.readFile(file);
	let jsonObj = JSON.parse(data);
	return jsonObj;
}

async function getHeaderLocale(app, lang)
{
	const jsonFile = getAssetJson(app, "core/header", lang);
	return readJSONFile(jsonFile);
}

async function getFooterLocale(app, lang)
{
	const jsonFile = getAssetJson(app, "core/footer", lang);
	return readJSONFile(jsonFile);
}

async function shouldIGoAhead(app, req, res, asset, reqLang)
{
	const lang = reqLang || req.params.lang;
    let avLangs = await getAvailableLangs(app, asset.internal);
	return avLangs.includes(lang);
}

async function sendLang(app, req, res, asset, reqLang, goAhead=false)
{
    const lang = reqLang || req.params.lang;
	let avLangs = getAvailableLangs(app, asset.internal);

	if (!goAhead) {
		avLangs = await avLangs;
		if (!avLangs.includes(lang)) {
			// Debug.dprint(app, `Requested language ${lang} is not available.`);
	
			/* This is not the best, as the server might need to fetch stuff 
			 * from the DB again and so on...
			 * 
			 * When a specific page could generate a possibly large load
			 * on the server, it should run "shouldIGoAhead" before 
			 * everything else
			 * */
			let prefLang = getPreferredLang(app, req, res, avLangs);
			let q = rewriteQuery(req.query);
			res.redirect(`/${prefLang}/${asset.alias}${q}`);
			return;
		}
	}
	
	/* Thus, locale exists */
	/* Start ejsOptions if non-existent */
	if (!res.ejsOptions)
		res.ejsOptions = {};

	/* Get locale for main file */
	const localeData = getLocaleData(app, asset.internal, lang);
	const localeCat = jsoncat(res.ejsOptions, localeData);
	
	/* Proceed getting header and footer (async) */
	const header = getHeaderLocale(app, lang);
	const headerCat = jsoncat(res.ejsOptions, header);
	const footer = getFooterLocale(app, lang);
	const footerCat = jsoncat(res.ejsOptions, footer);

	/* When was page last updated? */
	const promLastUpdate = getTimeLastUpdate(app, asset.internal, lang);

	res.ejsOptions.avLangs = await avLangs;
	if (asset.internal === "core/home") {
		res.ejsOptions.asset = "";
		res.ejsOptions.pathWithoutLang = "";
	} else {
		res.ejsOptions.asset = asset.alias;
		let regex = new RegExp("(?:^/[a-zA-Z]{2,3})/(.+)");
		res.ejsOptions.pathWithoutLang = req.path.match(regex)[1];
	}		

	res.ejsOptions.lang = lang;
	res.ejsOptions.year = (new Date).getFullYear();

	/* Hopefully by now we will have finished all that */
	await Promise.all([localeCat, headerCat, footerCat]);

	let timeLastUpdate = await promLastUpdate;
	res.ejsOptions.timeLastUpdate = timeLastUpdate;

	const mode = app.get("env");
	res.ejsOptions.nodeEnv = mode;

	MyMinify(app, req, res, asset);
}

module.exports.redirectPrefLang = redirectPrefLang;
module.exports.sendLang         = sendLang;
module.exports.shouldIGoAhead   = shouldIGoAhead;