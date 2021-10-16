/* required for user input */
const readline = require('readline');

/* auxiliary functions / generators */

function* printTimeElapsed(){
	let start = new Date();
	while (true)
		yield `(${new Date() - start} ms)`;
}

function resolveIn(ms, taskName){
	/*
	returns a function which resolves in ms miliseconds,
	printing a message both when starting and when done

	timer is the generator which will print the elapsed time.
	It is expected that timer be initiated when the
	inner function is called.
	*/
	let fn = async function(timer){
		console.log(`${timer.next().value} Starting ${taskName}`);
		return new Promise( (resolve, reject) => {
			setTimeout( () => {
				console.log(`${timer.next().value} Finished ${taskName}`);
				resolve();
			}, ms);
		});
	};
	return fn;
}

/* Defining each of the steps ... */

const TIME = 1000;

let prepareDough = resolveIn(TIME, "prepareDough");
let extractTomatoSauce = resolveIn(TIME, "extractTomatoSauce");
let addTomatoSauce = resolveIn(TIME, "addTomatoSauce");
let grateCheese = resolveIn(TIME, "grateCheese");
let addCheese = resolveIn(TIME, "addCheese");
let prepareTopping = resolveIn(TIME, "prepareTopping");
let addTopping = resolveIn(TIME, "addTopping");
let bake = resolveIn(5 * TIME, "bake");

/* Four ways to do the same thing: 2 synchronously, 2 asynchronously*/

function pizzaSyncBadStyle(){
	console.log("*** PIZZA - SYNC (bad style) ***");
	let timer = printTimeElapsed();
	prepareDough(timer).then(() => {
		return extractTomatoSauce(timer);
	})
	.then(() => {
		return addTomatoSauce(timer);
	})
	.then(() => {
		return grateCheese(timer);
	})		
	.then(() => {
		return addCheese(timer);
	})
	.then(() => {
		return prepareTopping(timer);
	})		
	.then(() => {
		return addTopping(timer);
	})
	.then(() => {
		return bake(timer);
	})
	.then(() => {
		console.log(`${timer.next().value} Pizza is ready!`);
	});
}

async function pizzaSyncBetterStyle(){
	console.log("*** PIZZA - SYNC (better style) ***");
	let timer = printTimeElapsed();
	await prepareDough(timer);
	await extractTomatoSauce(timer);
	await addTomatoSauce(timer);
	await grateCheese(timer);
	await addCheese(timer);
	await prepareTopping(timer);
	await addTopping(timer);
	await bake(timer);
	console.log(`${timer.next().value} Pizza is ready!`);
}

async function pizzaAsync(){
	console.log("*** PIZZA - ASYNC ***");
	let timer = printTimeElapsed();
	let prepareDoughPromise = prepareDough(timer);
	let extractTomatoSaucePromise = extractTomatoSauce(timer);
	let grateCheesePromise = grateCheese(timer);
	let prepareToppingPromise = prepareTopping(timer);
	await Promise.all([prepareDoughPromise, extractTomatoSaucePromise]);
	let addTomatoSaucePromise = addTomatoSauce(timer);
	await Promise.all([addTomatoSaucePromise, grateCheesePromise]);
	let addCheesePromise = addCheese(timer);
	await Promise.all([addCheesePromise, prepareToppingPromise]);
	await addTopping(timer);
	await bake(timer);
	console.log(`${timer.next().value} Pizza is ready!`);
}

async function productionStep(stepFn, args, dependencies){
		/*
		 * async function, list[Promise] -> Promise
		 */
		/* defined by the function to be executed at this
		 * step, and by a list of promises that have to better
		 * fulfilled before the function can actually run */
		await Promise.all(dependencies);
		return stepFn(...args);
}

async function pizzaAsyncLessVerbose(){
	console.log("*** PIZZA - ASYNC (less verbose) ***");
	let timer = printTimeElapsed();

	let step1 = productionStep(addTomatoSauce, [timer],
		[
			prepareDough(timer),
			extractTomatoSauce(timer)
		]);
	let step2 = productionStep(addCheese, [timer],
		[
			step1,
			grateCheese(timer)
		]);
	let step3 = productionStep(addTopping, [timer],
		[
			step2,
			prepareTopping(timer)
		]);
	let step4 = productionStep(bake, [timer],
		[
			step3
		]);
	await step4;
	console.log(`${timer.next().value} Pizza is ready!`);
}

function main()
{
	let question = `Which of the below functions would you like to demonstrate?
	1) pizzaSyncBadStyle
	2) pizzaSyncBetterStyle
	3) pizzaAsync
	4) pizzaAsyncLessVerbose

	Your answer: `;

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	  });

	rl.question(question, (answer) => {
		switch(answer){
		case "1":
			pizzaSyncBadStyle();
			break;
		case "2":
			pizzaSyncBetterStyle();
			break;
		case "3":
			pizzaAsync();
			break;
		case "4":
			pizzaAsyncLessVerbose();
			break;
		default:
			console.log("Invalid input.");
		}

		rl.close();
	  });	
}

main();