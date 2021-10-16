const readsync = require("readline-sync");

const MG = require("../utils/mongoose.js");
const User = require("../db/user.js");
const Priviledge = require("../middleware/priviledge.js");

function invertJSON(json)
{
	let inv = {};
	let entries = Object.entries(json);
	entries.forEach( x => { inv[x[1]] = x[0] } );
	return inv;
}

async function main()
{
	let uname = readsync.question("What user's priviledges would you like to change? ");
	
	let user;
	try {
		user = await User.findByUname(uname);
	} catch(e) {
		console.log(e);
		return;
	}

	console.log(`\nCurrent priviledge level of ${user.user_name} is ${Priviledge[user.user_priviledge]}`);

	let question = "Select a new priviledge level:\n";
	Object.keys(Priviledge).forEach( key => 
		question += `${Priviledge[key]}) ${key}\n`)
	question += "\n";

	let newPriv = readsync.question(question);
	let intNewPriv = parseInt(newPriv);
	let inv = invertJSON(Priviledge);
	console.log(inv);
	let res = await User.setPriviledge(uname, inv[newPriv] );
	console.log(res);

	console.log(
		"Success. %s's new priviledge level is %d.",
		res.user_name,
		Priviledge[res.user_priviledge]
	);
}

main()
.catch(e => {
	console.log("(*) An error occurred: ");
	console.log(e);
})
.finally( () => {
	MG.close();
});
