const User = require("../db/user.js");

module.exports = function(app){

	app.post("/register", async function(req, res) {
		console.log(req.body);
		try {
			let user = await User.add(req.body.uname, req.body.passwd);
			console.log(user);
			let token = await User.newAuthToken(req.body.uname);
			res.cookie("authtoken", token);
			res.send({
				success: true
			})
		} catch (e) {
			console.log(e);
			res.send({
				success: false,
				error: e.name
			})
		}
	});

	app.post("/login", async function(req, res) {
		try {
			let user = await User.findByCredentials(req.body.uname, req.body.passwd);
			if (!user)
				throw new Exceptions.InvalidCredentials;
			let token = await User.newAuthToken(req.body.uname);
			res.cookie("authtoken", token);
			res.send({ success: true });
		} catch (e) {
			console.log(e);
			res.send({ success: false });
		}
	});

	app.post("/logout", async function(req,res) {
		/* needs to be a POST, as it provokes a change in server state */
		try {
			await User.logout(req.cookies.authtoken);
			res.cookie("authtoken", "");
			res.send({ success: true });
		} catch (e) {
			/* NEEDS TO BE ADJUSTED LATER */
			res.send({ success: true });
		}
	});
}