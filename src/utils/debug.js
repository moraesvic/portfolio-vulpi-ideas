function dprint(app, msg)
{
	const mode = app.get("env");
	if (mode === "development")
		console.log(msg);
}
module.exports.dprint = dprint;