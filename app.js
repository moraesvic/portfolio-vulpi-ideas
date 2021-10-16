const express = require('express');
const path = require('path');

/*
################################################################################
########## CONFIGURING APP 
################################################################################
*/

const app = express();

/* MIDDLEWARES */
var cookieParser = require('cookie-parser');
app.use(cookieParser());

/* 
* The following is EVERYTHING needed to parse form and fetch input.
* Please do not import other stuff.
* BodyParser was deprecated.
*/
app.use(express.json());
app.use(express.urlencoded( {extended: true }));

/* ENVIRONMENT VARIABLES */

const PUBLIC = path.join(__dirname, 'public/');
app.set('public', PUBLIC);



app.set('view engine', 'ejs');
const VIEWS = path.join(__dirname, 'views/');
app.set('views', VIEWS);

const LOCALE = path.join(__dirname, 'locale/');
app.set('locale-folder', LOCALE);

const mode = app.get("env");
console.log(`Currently running in ${mode} mode`);

const IsProductionMode = mode === "production";
app.set("minify", IsProductionMode);

if (!IsProductionMode) {
	/* in production mode, nginx will do the compression */
	const compression = require("compression");
	app.use(compression());

	/* in production, nginx will also serve static files */
	app.use('/static', express.static('public'));
}

const PORT = process.env.PORT || 5000;

/* My own libs */
/* Must be required only after initialization of env. variables */

const Multilang = require("./src/middleware/multilang.js");

/* ROUTERS & API */
require("./src/routers/index.js")(app);
require("./src/api/index.js")(app);

/*
################################################################################
########## SITEMAP, ROBOTS.TXT, ICONS etc.
################################################################################
*/

app.get('/sitemap.xml', function(req,res){
	res.sendFile(PUBLIC + 'sitemap.xml');
});
  
app.get('/favicon.ico', function(req,res){
	res.sendFile(PUBLIC + 'img/favicon.ico');
});

/*
################################################################################
########## HOME ROUTE
################################################################################
*/

const asset = {
	internal: "core/home",
	alias:  "home"
};

app.get('/', function(req,res) {
    Multilang.redirectPrefLang(app, req, res, asset);
})

app.get(/^\/([a-zA-Z]{2,3})\/?$/, function(req,res){
	let reqLang = req.params[0];
    Multilang.sendLang(app, req, res, asset, reqLang);
});

/*
################################################################################
########## CONFIGURE 404 AND START LISTENING
################################################################################
*/

app.use(function(req,res){
    res.status(404).sendFile(PUBLIC + '404.html');
});

app.listen(PORT, function(req,res){
    console.log('Listening on port ' + PORT + '...');
});
