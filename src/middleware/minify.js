const EJS = require("ejs");
const path = require("path");
const HTMLMinifier = require("html-minifier");

module.exports = async function(app, req, res, asset)
{
	let minify = app.get("minify");
	if (minify) {
		const views = app.get("views");
		const pathToFile = path.join(views, asset.internal + ".ejs");
		const html = await EJS.renderFile(pathToFile, res.ejsOptions);
		const options =
		{
			collapseWhitespace: true,
			removeAttributeQuotes: true,
			removeComments: true,
			removeEmptyAttributes: true,
			minifyJS: true
		}
		let minified = HTMLMinifier.minify(html, options);
		res.send(minified);
	} else
		res.render(asset.internal, res.ejsOptions);
}