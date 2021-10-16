function centerTextVertically(svgText)
{
    /*
    Receives a text-SVG DOM element, set with the desired 
    x and y dimensions and places it appropriately.
    */
   const str = svgText.innerHTML;
   let textHeight = getTextWidthHeight(str)[1];
   let h0 = svgText.getAttribute("y");
   svgText.setAttribute("y", h0 - textHeight / 2);
}

function createTextBox(str, fontSize=60)
{
    let tbox = document.createElementNS(svgNS, "text");
    tbox.setAttribute("font-size", fontSize);
	tbox.setAttribute("text-anchor", "middle");
    tbox.setAttribute("x", 150);
    tbox.setAttribute("y", 150);
    tbox.appendChild(document.createTextNode(str));

    svgBox.appendChild(tbox);

    return tbox;
}

function createLine(ini_x, ini_y, end_x, end_y)
{
    let path = document.createElementNS(svgNS, "path");
    path.setAttribute("fill", "black");
	path.setAttribute("stroke", "black");
	path.setAttribute("stroke-width", "2");

	let d = `M ${ini_x} ${ini_y} L ${end_x} ${end_y}`;
    path.setAttribute("d", d);

    svgBox.appendChild(path);

    return path;
}

function getBoxWidthHeight(box)
{
    let bbox = box.getBoundingClientRect();
    let width = bbox.width;
    let height = bbox.height;
    return [width, height];
}

function deleteFromDOM(domElem)
{
    if (domElem != null)
        domElem.parentNode.removeChild(domElem);
}

function getTextWidthHeight(str, fontSize=60)
{
    let tmp = createTextBox(str, fontSize);
    let WH = getBoxWidthHeight(tmp);
    deleteFromDOM(tmp);
    return WH;    
}

function stackOfBoxes(str, nBoxes, fontSize, startX, startY, boxList, dontAdd=false)
{
	/*
	Breaks a long string in several box, giving the impression that
	the text "wraps", when SVG has actually no in-built function for that.
	*/

	let txtSplit = str.split(" ");

	while (Math.floor(txtSplit.length / nBoxes) === 0)
		nBoxes--;
	
	let txt = [];
	for (let i = 0; i < nBoxes; i++) {
		let begin = Math.floor(i / nBoxes * txtSplit.length);
		let end = Math.floor((i + 1) / nBoxes * txtSplit.length);
		let line = txtSplit.slice(begin, end);

		let lineStr = "";
		line.forEach( word => {
			lineStr += word + " ";
		});
		txt.push(lineStr);
	}

	let maxWidth = 0;
	let boxes = [];
	for (let i = 0; i < nBoxes; i++) {
		let newBox = createTextBox(txt[i], fontSize);
		let boxWidth = getBoxWidthHeight(newBox)[0];
		maxWidth = Math.max(maxWidth, boxWidth);
		boxes.push(newBox);
	}

	if (dontAdd)
		nextX = startX;
	else
		nextX = startX + maxWidth / 2;

	boxes.forEach( box => {
		box.setAttribute("x", nextX);
	});

	let stdHeight = getBoxWidthHeight(boxes[0])[1];
	for (let i = 0; i < nBoxes; i++) {
		boxes[i].setAttribute("y", startY - (nBoxes - i - 1) * stdHeight);
		boxList.push(boxes[i]);
	}

	let upperHandle = [nextX, startY - (nBoxes - 1 + 0.75) * stdHeight];
	let lowerHandle = [nextX, startY + 0.75 * stdHeight];
	return [upperHandle, lowerHandle];
}

function pickFontSizeNBoxes(str)
{
	/*
	Given a certain text, picks the appropriate font size and number of
	boxes to do the wrapping
	*/
	const stdFontSize = 24;

	let textLen = str.length;
	let fontSize;
	let nBoxes = 1;

	if (textLen <= 8)
		fontSize = stdFontSize;
	else if (textLen <= 12)
		fontSize = 24;
	else if (textLen <= 18)
		fontSize = 18;
	else if (textLen <= 30) {
		fontSize = 18;
		nBoxes = 2;
	} else if (textLen <= 50) {
		fontSize = 14;
		nBoxes = 3;
	} else {
		fontSize = 12;
		nBoxes = 4;
	}

	return [fontSize, nBoxes];
}

function drawLeaves(nodeList, objList){
	const stdFontSize = 30;
	let [svgBoxWidth, svgBoxHeight] = getBoxWidthHeight(svgBox);

    const spacingText = "xx"; // 2ex for spacing
	let [spacingWidth, spacingHeight] = getTextWidthHeight(spacingText, stdFontSize);
	
	let [fontSize, nBoxes] = pickFontSizeNBoxes(nodeList[0].txt);
	[nodeList[0].upperHandle, nodeList[0].lowerHandle] = 
										stackOfBoxes(nodeList[0].txt,
											nBoxes,
											fontSize,
											spacingWidth,
											svgBoxHeight - spacingHeight / 2,
											objList);
	nodeList[0].placed = true;	
	
    for (let i = 1; i < nodeList.length; i++) {
		let lastBox = objList[objList.length - 1];
		let lastWidth = getBoxWidthHeight(lastBox)[0];
		let lastX = Number(lastBox.getAttribute("x"));
		let lastY = Number(lastBox.getAttribute("y"));

		let [fontSize, nBoxes] = pickFontSizeNBoxes(nodeList[i].txt);
		[nodeList[i].upperHandle, nodeList[i].lowerHandle] = 
										stackOfBoxes(nodeList[i].txt,
													nBoxes,
													fontSize,
													lastX + lastWidth / 2 + spacingWidth,
													lastY,
													objList);
		nodeList[i].placed = true;
    }
}

class SyntaxTreeNode
{
	constructor(level, txt)
	{
		this.level       = level;
		this.txt         = txt;
		this.children    = [];
		this.upperHandle = null;
		this.lowerHandle = null;
		this.placed      = false;
	}

	addChild(child)
	{
		this.children.push(child);
	}

	print()
	{
		let s = "";
		for (let i = 0; i < this.level; i++)
			s += "-";
		s += this.txt;
		console.log(s);
		this.children.forEach( child => {
			child.print();
		});
	}
}

function getAllFromLevel(root, level)
{
	/*
	Receives root node and outputs a list with all the children at
	a given level
	*/
	if (level === 0 && root.level === 0)
		return [root];
	
	let list = [];
	root.children.forEach( child => {
		if (child.level === level)
			list.push(child);
		else if (child.level < level)
			getAllFromLevelRec(child, level, list)
	});
	return list;
}

function getAllFromLevelRec(root, level, list)
{
	root.children.forEach( child => {
		if (child.level === level)
			list.push(child);
		else if (child.level < level)
			getAllFromLevelRec(child, level, list)
	});
}

function getMaxDepth(root)
{
	let maxDepth = root.level;
	root.children.forEach( child => {
		maxDepth = Math.max(maxDepth, getMaxDepth(child));
	});
	return maxDepth;
}

function getLeaves(root)
{
	let maxDepth = getMaxDepth(root);
	return getAllFromLevel(root, maxDepth);
}

function checkAllChildrenPlaced(node)
{
	node.children.forEach( child => {
		if (!child.placed)
			return false;
	});
	return true;
}

function drawTree(root, noRoot=true)
{
	const stdFontSize = 16;
	let [svgBoxWidth, svgBoxHeight] = getBoxWidthHeight(svgBox);

	let maxDepth = getMaxDepth(root);
	let leaves = getLeaves(root);
	let objList = [];
	drawLeaves(leaves, objList);
	let condition = noRoot ? 1 : 0;
	for (let depth = maxDepth - 1; depth >= condition; depth--) {
		let nodeList = getAllFromLevel(root, depth);
		nodeList.forEach( node => {
			if (checkAllChildrenPlaced(node)) {

				let avgX = 0;
				node.children.forEach( child => {
					avgX += child.upperHandle[0];
				});
				avgX /= node.children.length;

				nodeY = svgBoxHeight - 60 * (maxDepth - node.level) - 15;
				[node.upperHandle, node.lowerHandle] = 
							stackOfBoxes(node.txt,
										1,
										stdFontSize,
										avgX,
										nodeY,
										objList,
										true);

				node.children.forEach( child => {
					let line = createLine(node.lowerHandle[0],
										  node.lowerHandle[1],
										  child.upperHandle[0],
										  child.upperHandle[1]);
					objList.push(line);
				});
				
			}
		});
	}

	scaleTree();

}

function getExtremeDim()
{
	let allText = Array.from(svgBox.getElementsByTagNameNS(svgNS, "text"));
	let packed_vec = allText.map(text => {
		let box = text.getBBox();
		let x = box.x + box.width;
		let y = box.y + box.height;
		return [x, y];
	});
	let x_vec = [];
	let y_vec = [];
	packed_vec.forEach( xypair => {
		x_vec.push(xypair[0]);
		y_vec.push(xypair[1]);
	});
	return [Math.max(...x_vec), Math.max(...y_vec)];
}

function scaleTree()
{
	let [svgBoxWidth, svgBoxHeight] = getBoxWidthHeight(svgBox);
	let [maxx, maxy] = getExtremeDim();

	if (maxx === 0 || maxy === 0)
		throw new Error("Could not rescale tree");

	let factorx = svgBoxWidth / maxx;
	let factory = svgBoxHeight / maxy;
	let scale = Math.min(factorx, factory);

	if (scale < 1) {
		let scaleStr = `scale(${scale} ${scale})`;
		let elemList = Array.from(svgBox.children);
		elemList.forEach( elem => {
			elem.setAttribute("transform", scaleStr);
		});
	}
}

function countTab(str)
{
	let count = 0;
	for (let i = 0; i < str.length; i++)
		if (str[i] === '\t')
			count++;
		else
			break;
	return count;
}

function buildTree(str)
{
	let root = new SyntaxTreeNode(0, "S");

	let stack = [root];
	let level = 0;
	let splitStr = str.split("\n");
	splitStr.forEach( line => {
		if (line === "")
			return;
		
		let newLevel = countTab(line);		

		let txt = line.replaceAll("\t", "");
		let node = new SyntaxTreeNode(newLevel, txt);
		if (newLevel > level) {
			level = newLevel;
			stack[stack.length - 1].addChild(node);
			stack.push(node);
		} else {
			while (stack[stack.length - 1].level >= newLevel)
				stack.pop();
			stack[stack.length - 1].addChild(node);
			stack.push(node);
		}
	});

	return root;

}

function configureSvgBox()
{
	const syntacticDisplay = document.getElementById("syntactic-display");

	let [svgBoxWidth, svgBoxHeight] = getBoxWidthHeight(syntacticDisplay);
	svgBox.setAttribute("width", svgBoxWidth);
	svgBox.setAttribute("height", svgBoxHeight);
	
}

/* GLOBALS */

const svgNS = "http://www.w3.org/2000/svg"; // namespace for SVG
const svgBox = document.getElementById("svg-box");
