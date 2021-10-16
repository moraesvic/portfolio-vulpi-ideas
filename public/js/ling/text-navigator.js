/* DATA */

const sentence = {
	id: 0,
	title: "All Star",
	author: "Smash Mouth",
	year:   1999,
	specification: "00 min 12 s", /* page, chapter etc */
	content:
		[
			/* word , classification */
			["somebody", "pron"],
			["once", "adv"],
			["told", "verb"],
			["me", "pron"],
			["the", "art"],
			["world", "noun"],
			["is", "verb"],
			["gonna", "verb"],
			["roll", "verb"],
			["me", "pron"]
		],
	translation: 
		{
			"pt": "Um dia alguém me disse que o mundo vai me rolar (?)",
			"de": "Jemand hat mir mal erzählt diese Welt wird mich total überfordern"
		},
	tree: `
	SUBJ
				somebody
	ADV_temp
				once
	V_typical
				told
	INDOBJ
				me
	DIROBJ
		SUBJ
				the world
		V
			V_aux
				is gonna
			V_typ
				roll
		DIROBJ
				me
`
}

/* FUNCTIONS */

function genSentenceHTML()
{
	const infoDisplay = document.getElementById("info-display");
	const textDisplay = document.getElementById("text-display");

	let spec = "";
	if (stc.specification != "")
		spec = `(${stc.specification})`;
	
	let innerHTML = `<p><strong>id:</strong> ${stc.id}</p>
	<p><strong>${source}:</strong> <em>${stc.title}</em>, ${stc.author}, ${stc.year} ${spec}</p>`;
	
	infoDisplay.innerHTML = innerHTML;
	
	innerHTML = "<p>";
	stc.content.forEach( elem => {
		innerHTML += `<span class="word">${elem[0]}</span><span class="toggle-morphology">${elem[1]}</span> `;
	});
	innerHTML += "</p>"
	
	textDisplay.innerHTML = innerHTML;
}

function toggleMorphologyDisplay() {
	showMorphology = !showMorphology;
	updateMorphologyDisplay();
}

function updateMorphologyDisplay() {
	const textDisplay = document.getElementById("text-display");
	let allTags = Array.from(document.getElementsByClassName("toggle-morphology"));
	allTags.forEach( span => {
		if (showMorphology)
			span.setAttribute("style", "display: inline");
		else
			span.setAttribute("style", "display: none");
	});

	if (showMorphology)
		textDisplay.setAttribute("style", "word-spacing: 3ex");
	else
		textDisplay.setAttribute("style", "word-spacing: normal");
}

/* */

function showLexicalInfo()
{
	const lexicalDisplay = document.getElementById("lexical-display");
	lexicalDisplay.innerHTML = `${this.innerHTML}: Not available yet, sorry!`;
}

function configureMorphology()
{
	const allWords = Array.from(document.getElementsByClassName("word"));
	allWords.forEach( word => {
		word.onclick = showLexicalInfo;
	});
}

/* */

function toggleSyntaxTreeDisplay()
{
	const syntacticDisplayMsg = document.getElementById("syntactic-display-msg");
	showSyntaxTree = !showSyntaxTree;
	if (showSyntaxTree) {
		svgBox.setAttribute("style", "visibility: visible");
		syntacticDisplayMsg.setAttribute("style", "visibility: visible");
	} else {
		svgBox.setAttribute("style", "visibility: hidden");
		syntacticDisplayMsg.setAttribute("style", "visibility: hidden");
	}
}

function toggleTranslationDisplay()
{
	const translDisplay = document.getElementById("translation");
	showTranslation = !showTranslation;
	let candidate = stc.translation[lang];

	if (showTranslation)
		if (typeof(candidate) === "undefined")
			translDisplay.innerHTML = "Translation not available";
		else
			translDisplay.innerHTML = candidate;
	else
		translDisplay.innerHTML = "";
}

function configureSyntaxTree()
{
	const syntacticDisplayMsg = document.getElementById("syntactic-display-msg");
	configureSvgBox();
	if (typeof(stc.tree) === "undefined" || stc.tree === "")
		syntacticDisplayMsg.innerHTML = "Syntax tree not available for this sentence";
	else {
		let newRoot = buildTree(stc.tree);
		drawTree(newRoot, false);
	}
}

/* GLOBALS AND MAIN */

let showMorphology = false;
let showSyntaxTree = false;
let showTranslation = false;
let stc;
let lang;

function main()
{
	stc = sentence;
	lang = "pt";

	genSentenceHTML();
	updateMorphologyDisplay();
	const toggleMorphButton = document.getElementById("toggle-morph");
	toggleMorphButton.onclick = toggleMorphologyDisplay;

	const toggleSyntaxTree = document.getElementById("toggle-syntax-tree");
	toggleSyntaxTree.onclick = toggleSyntaxTreeDisplay;

	const toggleTransl = document.getElementById("toggle-transl");
	toggleTransl.onclick = toggleTranslationDisplay;

	configureMorphology();
	configureSyntaxTree();
}

main();