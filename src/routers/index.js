module.exports = function(app){
	/* CORE */
	require("./under-construction.js")(app);

	/* ABOUT / INSTITUTIONAL */
	require("./about/contact.js")(app);
	require("./about/portfolio.js")(app);
	require("./about/who-am-i.js")(app);

	/* ROAD TO WEBDEV */
	require("./about/road-to-webdev.js")(app);

	/* USER SPACE */
	require("./account/login.js")(app);
	require("./account/logout.js")(app);
	require("./account/my-profile.js")(app);
	require("./account/register.js")(app);
	require("./account/unauthorized")(app);

	/* LINGUISTICS */
	require("./ling/admin-home.js")(app);
	require("./ling/admin-languages.js")(app);
	require("./ling/admin-translations.js")(app);
	require("./ling/dict-show-all.js")(app);
	require("./ling/dict-show-one.js")(app);
	require("./ling/docs.js")(app);
	require("./ling/flashcards.js")(app);
	require("./ling/lemma-show-one.js")(app);
	require("./ling/text-navigator.js")(app);

	/* PORTFOLIO */
	/* soon */

		
}