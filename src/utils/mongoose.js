const mongoose = require("mongoose");
const schTypes = mongoose.Schema.Types;

const DB_URI = 'mongodb://localhost:27017/vulpiDev';

const DISCONNECTED  = 0;
const CONNECTED     = 1;
const CONNECTING    = 2;
const DISCONNECTING = 3;
const INVALID_CRED  = 4;

const OPTIONS = {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
	useFindAndModify: false
};

const MONGOOSE_PRINT = false;

function print(...fmt)
{
	if (MONGOOSE_PRINT){
		let args = ["[MONGOOSE]", ...fmt];
		console.log(...args);
	}
}

function config()
{
	/* will be deprecated */
	mongoose.connect(DB_URI, OPTIONS);
}

function connectionState(state)
{
	switch(state){
		case(DISCONNECTED):
			return "disconnected";
		case(CONNECTED):
			return "connected";
		case(CONNECTING):
			return "connecting";
		case(DISCONNECTING):
			return "disconnecting";
		default:
			return "unknown";
	}
}

async function configAsync()
{
	let state = mongoose.connection.readyState;
	print(`Mongoose is ${connectionState(state)}`);

	return new Promise((resolve, reject) => {

		switch(state){
		case(CONNECTED):
			resolve();
			break;
		case(DISCONNECTED):
		case(DISCONNECTING):
			mongoose.connection.on("connected", () => {
				print("Connected successfully");
				resolve();
			});
			mongoose.connect(DB_URI, OPTIONS);
			break;
		case(CONNECTING):
			print("Pending connection request");
			resolve();
			break;
		default:
			print("Unknown connection status");
			reject();
		}
	});
}

async function close()
{
	print("Closing Mongoose connection");
	mongoose.disconnect();
}

function checkModel(modelStr)
{
	let f = async function(id)
	{
		/*
		Checks whether an id corresponds to a document of the given model
		*/
		let connection = mongoose.connection;
		let model = connection.collection(modelStr);
		let result = model.find({ _id: id});
		if (result === null)
			return false;
		return true;
	};
	return f;
}

module.exports = {
	mongoose: mongoose,
	schTypes: schTypes,
	config: config,
	configAsync: configAsync,
	close: close,
	checkModel: checkModel
};