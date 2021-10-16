const Translation = require("../models/translation.js");

module.exports = function(app){

	app.get("/translations/check/:nameInternal", async function(req, res) {
		try {
			let nameInternal = req.params.nameInternal;
			let [nearestMatch, distance] =
				await Translation.nearestMatch(nameInternal);
			let perfectMatch = nearestMatch === nameInternal;
			res.send({ 
				success: true,
				perfectMatch: perfectMatch,
				nearestMatch: nearestMatch 
			});
		} catch(e) {
			console.log(e);
			res.send({ success: false, error: e.name });
		}
	});

	app.get("/translations/get/:nameInternal/:iso", async function(req, res) {
		try {
			let nameInternal = req.params.nameInternal;
			let iso = req.params.iso;
			let existentTranslation =
				await Translation.getExistentTranslation(nameInternal, iso);
			res.send({ 
				success: true,
				existentTranslation: existentTranslation
			});
		} catch(e) {
			console.log(e);
			res.send({ success: false, error: e.name });
		}
	});

	app.patch("/translations/:nameInternal", async function(req, res) {	
		try {
			let nameInternal = req.params.nameInternal;
			let iso = req.body.iso;
			let newTranslation = req.body.newTranslation;
			await Translation.insertTransl(nameInternal, iso, newTranslation);
			res.send({ success: true });
		} catch(e) {
			console.log(e);
			res.send({ success: false, error: e.name });
		}

	});

	app.patch("/languages/:nameFor", async function(req, res) {

	});
}
