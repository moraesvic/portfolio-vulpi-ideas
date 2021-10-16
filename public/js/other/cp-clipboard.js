const copyClipboardSuccess = "Link copied to clipboard!";
const copyClipboardFail	   = "Could not copy to clipboard.";

function fallbackCopyTextToClipboard(text) {
	var textArea = document.createElement("textarea");
	textArea.value = text;

	// Avoid scrolling to bottom
	textArea.style.top = "0";
	textArea.style.left = "0";
	textArea.style.position = "fixed";

	document.body.appendChild(textArea);
	textArea.focus();
	textArea.select();

	try {
		var successful = document.execCommand('copy');
		if (!successful)
			throw new Error;
		alert(copyClipboardSuccess);
	} catch (e) {
		alert(copyClipboardFail);
	}

	document.body.removeChild(textArea);
}

function copyTextToClipboard(text) {
	try {
		navigator.clipboard.writeText(text);
		alert(copyClipboardSuccess);
  } catch (e) {
		fallbackCopyTextToClipboard(text);
  }
}