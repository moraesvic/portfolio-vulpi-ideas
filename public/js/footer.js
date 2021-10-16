var Footer = new function()
/* ----- FOOTER -----*/ {

function configureHelpSpans()
{
	let helpSpans = Array.from( document.querySelectorAll(".help") );
	helpSpans.forEach( h => {
		let place;
		
		if (h.classList.contains("help-top"))
			place = "top";
		else if (h.classList.contains("help-bottom"))
			place = "bottom";
		else if (h.classList.contains("help-right"))
			place = "right";
		else if (h.classList.contains("help-left"))
			place = "left";
		let title = h.innerHTML.replace(/"/g, "&quot;");
		let img =
		`<i class="fas fa-question-circle"
		data-bs-toggle="tooltip" data-bs-html="true"
		data-bs-placement="${place}"
		title="${title}"></i>`;
		h.insertAdjacentHTML("beforebegin", img);
		h.remove();
	});
}

function configureBootstrapTooltip()
{
	let tooltipList = Array.from( document.querySelectorAll('[data-bs-toggle="tooltip"]') );
	tooltipList.map( elem => { return new bootstrap.Tooltip(elem) });
}

function addTitleToImgs()
{
	let imgsWithAlt = document.querySelectorAll("[alt]");
	imgsWithAlt.forEach( img => {
		let alt = img.getAttribute("alt");
		img.setAttribute("title", alt);
	})
}

function configureNotes()
{
	let notes = document.querySelectorAll(".note");
	let refs  = document.querySelectorAll(".note-ref");
	if (notes.length !== refs.length) {
		console.log("Error! Number of notes and references don't match!");
		return;
	}
	for (let i = 0; i < notes.length; i++) {
		let anchor = `<a href="#note-${i+1}">[${i+1}]</a>`;
		let backAnchor = 
		`<span class="footnote">
			<a href="#note-${i+1}-back">[${i+1}]</a>
		</span> `;
		notes[i].id = `note-${i+1}-back`;
		refs[i].id = `note-${i+1}`;
		notes[i].insertAdjacentHTML("afterbegin", anchor);
		refs[i].insertAdjacentHTML("afterbegin", backAnchor);
	}
}

function fillTimeToRead()
{
	let timeToRead = document.querySelector(".time-to-read");
	if (!timeToRead)
		return;
	let nWords = getWordCount();
	
	let minutes = Math.floor(nWords / 250);
	
	if (minutes === 0)
		return;
	let minutesWord = 	minutes === 1 ?
						MINUTES_SINGULAR : 
						MINUTES_PLURAL;
	timeToRead.innerText = `${READING_TIME}: ${minutes} ${minutesWord}`;
}

function getWordCount()
{
	let main = document.querySelector(".page-main-content");
	let nodes = main.querySelectorAll("p, h1, h2, h3, h4, h5, h6");
	let count = 0;
	for (let i = 0; i < nodes.length; i++) {
		let arr = nodes[i].textContent.split(" ");
		let filter = arr.filter( word => word.match(/\w+/) );
		count += filter.length;
	}
	return count;
}

async function logout()
{
	let data = await Auth.postLogout();
	if (data.success) {
		location = `/${PAGE_LANGUAGE_ISO}`;
	}
	else
		alert(`${ERROR_IN_LOGOUT}: ${data.error}.`);
}

function runFooter()
{
	configureHelpSpans();
	configureBootstrapTooltip();
	fillTimeToRead();
	addTitleToImgs();
	configureNotes();
}

/* ----- CALLED WHEN PAGE IS LOADED ----- */
document.addEventListener("DOMContentLoaded", function(){
	setTimeout(runFooter, 0);
});

document.getElementById("logout-button")
.addEventListener("click", logout);

/* ----- EXPORTS ----- */

/* ----- FOOTER -----*/ };




