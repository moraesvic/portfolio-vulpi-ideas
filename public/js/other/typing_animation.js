<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Document</title>

	<style>
		.typing-frame {
			width: 30%;
			margin: auto;
			background-color: black;
			color: rgb(0, 255, 0);
			text-align: left;
			min-height: 100px;
		}
		.typing-animation {
			font-family: 'Consolas', 'Courier New', Courier, monospace;
			padding: 20px;
			word-wrap:break-word;
		}

		h2 {
			text-align: center;
			margin: 20px;
		}
	</style>

</head>
<body>
	<h2>Writing at a variable speed</h2>
	<div class="typing-frame">
		<p class="typing-animation" id="draw"></p>
	</div>

	<h2>Writing at a variable speed, commiting mistakes</h2>
	<div class="typing-frame">
		<p class="typing-animation" id="draw-delete"></p>
	</div>

	<h2>Letters are "guessed" all at a time</h2>
	<div class="typing-frame">
		<p class="typing-animation" id="mixed-letters"></p>
	</div>

	<h2>Letters are "guessed" one by one</h2>
	<div class="typing-frame">
		<p class="typing-animation" id="guess-one-by-one"></p>
	</div>

	<h2>Letters are "unshuffled" from the beginning</h2>
	<div class="typing-frame">
		<p class="typing-animation" id="unshuffle"></p>
	</div>
	
<script>


function randInt(n)
{
	return Math.floor(Math.random() * n);
}

function randomChar(nospace = false)
{
	const alphSz = 26;
	const aCode = "a".charCodeAt(0);
	const ACode = "A".charCodeAt(0);
	let r = Math.random();
	
	if (!nospace && r < 1.0 / (alphSz * 2 + 1))
		return " ";
	
	let ord = randInt(alphSz);
	r = Math.random();

	if (r < 0.5)
		return String.fromCharCode(aCode + ord);
	else
		return String.fromCharCode(ACode + ord);
}

function cursor()
{
	return Math.random() > 0.5 ? "_" : " ";
}

function keepBlinking(screen, last)
{
	if (last === undefined)
		last = "_";
	let next = last === "_" ? " " : "_";
	screen.innerHTML = screen.innerHTML.slice(0, -1) + next;
	setTimeout(keepBlinking, 200, screen, next);
}

function draw(baseDuration, screen, i)
{
	if (i === undefined)
		i = 0;
	screen.innerHTML = finalString.slice(0, ++i) + cursor();
	if (i === finalString.length){
		keepBlinking(screen);
		return;
	}

	let duration = baseDuration + Math.random() * baseDuration * 2;
	setTimeout(draw, duration, baseDuration, screen, i);
}

function mess(str)
{
	let s = "";
	for(let i = 0; i < str.length; i++)
		s += randomChar();
	return s;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function shuffleStr(str)
{
	let arr = Array.from(str);
	shuffleArray(arr);
	let s = "";
	for (let i = 0; i < arr.length; i++)
		s += arr[i];
	return s;
}

function isUpperCase(x)
{
	return x === x.toUpperCase();
}

function drawDelete(baseDuration, screen, i, typingMistake)
{
	if (i === undefined){
		i = 0;
		typingMistake = false;
	}

	if (screen.innerHTML.length > 0)
		screen.innerHTML = screen.innerHTML.slice(0, -1);

	if (typingMistake) {
		screen.innerHTML = screen.innerHTML.slice(0, -1) + cursor();
		typingMistake = false;
		let duration = baseDuration + Math.random() * baseDuration * 2;
		setTimeout(drawDelete, duration, baseDuration, screen, i, typingMistake);
		return;
	}

	const ERROR_RATE = 0.16;
	let r = Math.random();

	if (screen.innerHTML.length > 0 && r > (1 - ERROR_RATE)) {
		typingMistake = true;
		if (r > (1 - ERROR_RATE / 2)) {
			if (isUpperCase(finalString[i]))
				screen.innerHTML += finalString[i].toLowerCase();
			else
				screen.innerHTML += finalString[i].toUpperCase();
		}
		else
			screen.innerHTML += randomChar();
	}
	else
		screen.innerHTML += finalString[i++];

	if (i === finalString.length) {
		screen.innerHTML += "_";
		keepBlinking(screen);
		return;
	}

	screen.innerHTML += cursor();

	let duration = baseDuration + Math.random() * baseDuration * 2;
	setTimeout(drawDelete, duration, baseDuration, screen, i, typingMistake);
}

function mixedLetters(baseDuration, screen, correct)
{
	if (correct === undefined){
		correct = [];
		for (let i = 0; i < finalString.length; i++)
			if (finalString[i] !== " ")
				correct.push(false);
			else
				correct.push(true);
	}

	screen.innerHTML = "";

	for (let i = 0; i < finalString.length; i++)
		if (correct[i])
			screen.innerHTML += finalString[i];
		else {
			screen.innerHTML += randomChar(true);
			if (Math.random() > 0.90)
				correct[i] = true;
		}
	
	if (screen.innerHTML === finalString) {
		screen.innerHTML += "_";
		keepBlinking(screen);
		return;
	}

	let duration = baseDuration + Math.random() * baseDuration * 2;
	setTimeout(mixedLetters, duration, baseDuration, screen, correct);
}

function unshuffle(baseDuration, screen, correct)
{
	if (correct === undefined)
		correct = 0;

	let len = finalString.length;
	if (correct === len) {
		screen.innerHTML = finalString + "_";
		keepBlinking(screen);
		return;
	}
	if (Math.random() > 0.30)
		correct++;
	
	screen.innerHTML = finalString.slice(0, correct)
						+ shuffleStr(finalString.slice(correct));

	let duration = baseDuration + Math.random() * baseDuration * 2;
	setTimeout(unshuffle, duration, baseDuration, screen, correct);
}

function randSign()
{
	return Math.random() > 0.5 ? -1 : 1;
}

function guessOneByOne(baseDuration, screen)
{
	const ERROR_RATE = 0.3;

	if (screen.innerHTML.length > 0)
		screen.innerHTML = screen.innerHTML.slice(0, -1);

	let len = screen.innerHTML.length;
	if (screen.innerHTML === finalString){
		screen.innerHTML += "_";
		keepBlinking(screen);
		return;
	}

	let nextCh = randomChar();

	if (   len === 0
		|| screen.innerHTML.charCodeAt(len - 1) === finalString.charCodeAt(len - 1) ) {
		/* insert */
		screen.innerHTML += nextCh;
	} else {
		/* substitute */
		if (Math.random() > ERROR_RATE)
			nextCh = finalString[len - 1];

		let buffer = screen.innerHTML;
		buffer = buffer.slice(0, -1) + nextCh;
		screen.innerHTML = buffer;
	}

	screen.innerHTML += cursor();

	let duration = baseDuration + Math.random() * baseDuration * 2;
	setTimeout(guessOneByOne, duration, baseDuration, screen);
}

const finalString = " VULPI IDEAS WEB DEVELOPMENT";

//const finalString = "aftas ardem doem hemorroidas idem ouviram do ipiranga";

const drawScreen = document.getElementById("draw");
const drawDeleteScreen = document.getElementById("draw-delete");
const mixedLettersScreen = document.getElementById("mixed-letters");
const guessScreen = document.getElementById("guess-one-by-one");
const unshuffleScreen = document.getElementById("unshuffle");

draw(80, drawScreen);
drawDelete(60, drawDeleteScreen);
mixedLetters(75, mixedLettersScreen);
guessOneByOne(30, guessScreen);
unshuffle(75, unshuffleScreen);

</script>
	
</body>
</html>