

function randomInteger(min, max) { // min and max included 
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function replaceAll(str, find, replace) {
	return str.replace(new RegExp(find, 'g'), replace);
}
