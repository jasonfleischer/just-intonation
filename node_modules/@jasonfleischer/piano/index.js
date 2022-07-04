const PianoView = require("./lib/piano_view.js");
const log = require("@jasonfleischer/log");

function pianoBuilder(options) {

	this.id = options.id;
	if (this.id === undefined){
		log.e('id not provided for piano')
		return
	}

	this.pianoView = document.getElementById(this.id);
	if (this.pianoView === undefined){
		log.e('not piano exists with id: ' + this.id)
		return
	}

	function isInt(value) {
		var x = parseFloat(value);
		return !isNaN(value) && (x | 0) === x;
	}
	this.range = options.range;
	if (this.range === undefined){
		this.range = { min: 21, max: 108 }
	} else {
		if (options.range.min !== undefined && options.range.max !== undefined) {
			if(isInt(options.range.min)){
				this.range.min = Math.min(Math.max(this.range.min, options.range.min), this.range.max);
			}
			if(isInt(options.range.max)){
				this.range.max = Math.min(Math.max(this.range.min, options.range.max), this.range.max);
			}
		}
	}

	this.width = 1000;
	if (options.width !== undefined){
		this.width = options.width;
	}
	this.hover = false;
	if (options.hover !== undefined){
		this.hover = options.hover;
	}

	let backgroundColor = "#00000000";
	if (options.backgroundColor !== undefined){
		backgroundColor = options.backgroundColor;
	}

	this.view = new PianoView(this.id, this.width, this.range, options.onClick, this.hover, backgroundColor);
	return this.view;
}


module.exports = pianoBuilder;

