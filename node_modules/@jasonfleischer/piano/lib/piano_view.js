const musicKit = require("@jasonfleischer/music-model-kit");
const log = require("@jasonfleischer/log")

class PianoView {
	constructor(id = "piano_view_id", width = 1000, range = musicKit.piano_range, onClick, hover = false, backgroundColor="#00000000") {

	  	this.id = id;
		this.BORDER_WIDTH = 1;
		this.range = range;
		this.min_midi_value = range.min;
		this.max_midi_value = range.max;
		this.number_of_white_keys = 0;
		this.number_of_black_keys = 0;
		this.midi_value_to_piano_key_map = {};
		this.hover = hover;
		this.backgroundColor = backgroundColor;
		this.onClick = onClick;
		var i;
		for(i = this.min_midi_value; i <= this.max_midi_value; i++){
			var note = musicKit.all_notes[i];
			if(!note.note_name.is_sharp_or_flat){
				this.number_of_white_keys++;
			} else {
				this.number_of_black_keys++;
			}
		}
		this.WIDTH = 1000;
		this.width = width;
		this.HEIGHT = this.calculateHeight(this.WIDTH, this.number_of_white_keys);
		this.buildCanvases();
		this.draw();
		this.resize(width);
	}

	buildCanvases() {

		let width = this.WIDTH;
		let height = this.HEIGHT;
		let rootView = document.getElementById(this.id);

	    this.white_keys_canvas = this.buildCanvas(rootView, "piano_white_keys_canvas_"+this.id, width, height);
	    this.white_keys_drawing_canvas = this.buildCanvas(rootView, "piano_white_keys_drawing_canvas_"+this.id, width, height);
	    if(this.hover) {
	    	this.white_keys_drawing_hover_canvas = this.buildCanvas(rootView, "piano_white_keys_drawing_hover_canvas_"+this.id, width, height);
	    }
	    this.black_keys_canvas = this.buildCanvas(rootView, "piano_black_keys_canvas_"+this.id, width, height);
	    this.black_keys_drawing_canvas = this.buildCanvas(rootView, "piano_black_keys_drawing_canvas_"+this.id, width, height);
	    if(this.hover) {
	    	this.black_keys_drawing_hover_canvas = this.buildCanvas(rootView, "piano_black_keys_drawing_hover_canvas_"+this.id, width, height);
	    }
		rootView.style.backgroundColor = this.backgroundColor;
		rootView.style.position = "relative"
		rootView.style.width = width  + "px";
		rootView.style.height = height  + "px";
		rootView.width = width;
		rootView.height = height;
	}

	buildCanvas(rootView, id, width, height) {

		var canvas = document.createElement('canvas'); 
	    canvas.id = id;
	    canvas.style.position = "absolute"
	    canvas.style.left = "0px"
	    canvas.style.right = "0px"
	    canvas.style.width = width + "px";
		canvas.style.height = height + "px";
		canvas.width = width;
		canvas.height = height;
	    rootView.appendChild(canvas);
	    return canvas;
	}

	removeCanvases(){
		const removeChilds = (parent) => {
		    while (parent.lastChild) {
				parent.removeChild(parent.lastChild);
			}
		};
		let rootView = document.getElementById(this.id);
		removeChilds(rootView);
	}

	resize(newWidth) {

		this.width = newWidth;

		let rootView = document.getElementById(this.id);

		var newWidth = Math.min(newWidth, this.WIDTH);

		var newHeight = this.calculateHeight(newWidth, this.number_of_white_keys);
		rootView.style.height = newHeight + "px";
		this.black_keys_canvas.style.height = newHeight + "px";
		this.black_keys_drawing_canvas.style.height = newHeight + "px";
		this.white_keys_canvas.style.height = newHeight + "px";
		this.white_keys_drawing_canvas.style.height = newHeight + "px";

		rootView.style.width = newWidth + "px";
		this.black_keys_canvas.style.width = newWidth + "px";
		this.black_keys_drawing_canvas.style.width = newWidth + "px";
		this.white_keys_canvas.style.width = newWidth + "px";
		this.white_keys_drawing_canvas.style.width = newWidth + "px";
		if(this.hover) {
	    	this.black_keys_drawing_hover_canvas.style.height = newHeight + "px";
	    	this.black_keys_drawing_hover_canvas.style.width = newWidth + "px";
	    	this.white_keys_drawing_hover_canvas.style.height = newHeight + "px";
	    	this.white_keys_drawing_hover_canvas.style.width = newWidth + "px";
			this.addHoverEventListeners();
		}
		if(this.onClick !== undefined) {
			this.addClickEventListeners(this.onClick);
		}
	}

	draw(){

		let white_key_width = Math.floor((this.WIDTH - ((this.number_of_white_keys+1)*this.BORDER_WIDTH) )/ this.number_of_white_keys);
		this.white_key_height =  Math.floor(white_key_width * 5);

		var white_keys = [];
		
		var i;
		var x = this.BORDER_WIDTH + (this.WIDTH - ((white_key_width + this.BORDER_WIDTH ) * this.number_of_white_keys))/2;
		for(i = this.min_midi_value; i <= this.max_midi_value; i++){
			var note = musicKit.all_notes[i];
			if(!note.note_name.is_sharp_or_flat){

				let key = new PianoView.Key(x, this.BORDER_WIDTH, 
					white_key_width, this.BORDER_WIDTH+this.white_key_height, note, "#fff")
				white_keys.push(key)

				this.midi_value_to_piano_key_map[note.midi_value] = key
				x = x + white_key_width + this.BORDER_WIDTH;
			}
		}

		var ctx = this.white_keys_canvas.getContext("2d");
		var j;
		for(j = 0; j < white_keys.length; j++){	
			var white_key = white_keys[j];
			white_key.draw(ctx);
		}

		var black_keys = [];
		var black_key_width = Math.floor(white_key_width * 0.6);
		var black_key_height = Math.floor(this.white_key_height * 0.67);
		var k;
		for(k = this.min_midi_value; k <= this.max_midi_value; k++){
			var note = musicKit.all_notes[k];
			if(note.note_name.is_sharp_or_flat){

				var flat_key = this.midi_value_to_piano_key_map[note.midi_value-1];
				var sharp_key = this.midi_value_to_piano_key_map[note.midi_value+1];
				if( flat_key != undefined && sharp_key != undefined) {

					var x = flat_key.x + this.BORDER_WIDTH + white_key_width - black_key_width/2;
					let key = new PianoView.Key(x, this.BORDER_WIDTH, black_key_width, black_key_height, note, "#333", true);
					black_keys.push(key)
					this.midi_value_to_piano_key_map[note.midi_value] = key
				}
			}
		}

		ctx = this.black_keys_canvas.getContext("2d");
		var l;
		for(l = 0; l < black_keys.length; l++){	
			var black_key = black_keys[l];
			black_key.draw(ctx);
		}
	}

	calculateHeight(width, number_of_white_keys) {
		let white_key_width = Math.floor((width - ((this.number_of_white_keys+1)*this.BORDER_WIDTH) )/ this.number_of_white_keys);
		return  Math.ceil((white_key_width * 5) + this.BORDER_WIDTH*2) +1 ;
	}

	clear() {
		this.black_keys_drawing_canvas.getContext("2d").clearRect(0, 0, this.WIDTH, this.HEIGHT);
		this.white_keys_drawing_canvas.getContext("2d").clearRect(0, 0, this.WIDTH, this.HEIGHT);
		var i;
	    for(i=this.range.min; i<=this.range.max; i++){
	    	this.midi_value_to_piano_key_map[i].isOn = false;
	    }
	}
	clearNote(note) {
		if(note == undefined) {
			log.e('note is undefined')
			return
		}
		if (!note.isWithinRange(this.range)) {
			log.i('note is out of range')
			return
		}
		let ctx = note.note_name.is_sharp_or_flat ? this.black_keys_drawing_canvas.getContext("2d") : 
													this.white_keys_drawing_canvas.getContext("2d");

		let key = this.midi_value_to_piano_key_map[note.midi_value];
		ctx.clearRect(key.x , key.y, key.width, key.height);
		key.isOn = false;
	}
	
	clearHover() {
		var canvas = this.white_keys_drawing_hover_canvas;
		var ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);

		canvas = this.black_keys_drawing_hover_canvas;
		var ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
	}

	clearHoverNote(note) {
		let ctx = note.note_name.is_sharp_or_flat ? this.black_keys_drawing_hover_canvas.getContext("2d") : 
													this.white_keys_drawing_hover_canvas.getContext("2d");

		let key = this.midi_value_to_piano_key_map[note.midi_value];
		ctx.clearRect(key.x , key.y, key.width, key.height);
	}

	drawNote(note){
		if(note == undefined) {
			log.e('note is undefined')
			return
		}
		this.drawNoteWithColor(note);
	}

	drawNoteWithColor(note, color=note.note_name.color){
		if(note == undefined) {
			log.e('note is undefined')
			return
		}
		if (!note.isWithinRange(this.range)) {
			log.i('note is out of range')
			return
		}
		var ctx = note.note_name.is_sharp_or_flat ? this.black_keys_drawing_canvas.getContext("2d") : 
													this.white_keys_drawing_canvas.getContext("2d");

		let key = this.midi_value_to_piano_key_map[note.midi_value];
		key.draw(ctx, color);
	}

	drawHoverNote(note){
		if(note == undefined) {
			log.e('note is undefined')
			return
		}
		if (!note.isWithinRange(this.range)) {
			log.i('note is out of range')
			return
		}
		var ctx = note.note_name.is_sharp_or_flat ? this.black_keys_drawing_hover_canvas.getContext("2d") : 
													this.white_keys_drawing_hover_canvas.getContext("2d");
		let color = note.note_name.is_sharp_or_flat ? "#aaaaaaaa" : "#33333333";
		let key = this.midi_value_to_piano_key_map[note.midi_value];
		key.draw(ctx, color);
	}

	drawInterval(interval){

		var play_type = interval.play_type;
		let higher_note = interval.getHigherNote(musicKit.all_notes);
		var first_note = (play_type == musicKit.Interval.PLAY_TYPE.ASCENDING) ? interval.lower_note : higher_note;

		this.clear();
		this.drawNoteWithColor(first_note);
		setTimeout(() => {
			var second_note = (play_type == musicKit.Interval.PLAY_TYPE.ASCENDING) ? higher_note : interval.lower_note;
			this.drawNoteWithColor(second_note);
		}, (interval.play_type == musicKit.Interval.PLAY_TYPE.HARMONIC) ? 0 : interval.delay_in_ms);	
	}

	drawChord(chord){
		this.clear();
		var note_array = chord.getNoteArray(musicKit.all_notes, this.range);
		var j;
		for(j=0; j< note_array.length; j++) {
			var note = note_array[j];
			var label = chord.note_labels[j];
			if (label == 'R'){
				this.drawNoteWithColor(note);
			} else {
				this.drawNoteWithColor(note, "#999");
			}
		}
	}

	drawScale(scale){
		this.clear();
		var note_array = scale.getNoteArray(musicKit.all_notes, this.range);
		var j;
		for(j=0; j< note_array.length; j++) {
			var note = note_array[j];
			
			if (note.note_name.type == scale.root_note.note_name.type){
				this.drawNoteWithColor(note);
			} else {
				this.drawNoteWithColor(note, "#999");
			}
		}
	}

	addClickEventListeners(onClick) {

		let rootView = document.getElementById(this.id);
		rootView.style.cursor="pointer";
		let range = this.range;
		let key_map = this.midi_value_to_piano_key_map;
		let width = this.width;
		let WIDTH = this.WIDTH;
		let self = this;

		if(this.onClickFunction !== undefined)
			rootView.removeEventListener("click", this.onClickFunction);
		this.onClickFunction = function(event){
			let position =	self.getPosition(rootView);
		    let x = (event.clientX - position.x) * (WIDTH/width);
		    let y = (event.clientY- position.y) * (WIDTH/width);

		    var foundKey = self.findKey(key_map, range, x, y);

		    if(foundKey == undefined){
		    	log.e("No key found on click");
		    } else {
		    	foundKey.isOn = !foundKey.isOn;
		    	onClick(foundKey.note, foundKey.isOn);
		    }
		}
		rootView.addEventListener("click", this.onClickFunction);
	}

	removeOnClick(){
		let rootView = document.getElementById(this.id);
		rootView.removeEventListener("click", this.onClickFunction);
	}

	addHoverEventListeners() {

		let view = document.getElementById(this.id);
		view.style.cursor="pointer";
		let range = this.range;
		let key_map = this.midi_value_to_piano_key_map;
		let width = this.width;
		let WIDTH = this.WIDTH;
		let self = this;
		var previousKey = undefined;

		if(this.mouseOverFunction !== undefined)
			view.removeEventListener("mouseover", this.mouseOverFunction);
		if(this.mouseMoveFunction !== undefined)
			view.removeEventListener("mousemove", this.mouseMoveFunction);
		if(this.mouseOutFunction !== undefined)
			view.removeEventListener("mouseout", this.mouseOutFunction);

		this.mouseOverFunction = function(event) {
			previousKey = undefined;
		}
		view.addEventListener("mouseover", this.mouseOverFunction);

		this.mouseMoveFunction = function(event){
		    let position =	self.getPosition(view);
		    let x = (event.clientX - position.x) * (WIDTH/width);
		    let y = (event.clientY- position.y) * (WIDTH/width);

		    var foundKey = self.findKey(key_map, range, x, y);

		    if(foundKey !== undefined){
		    	
		    	if(previousKey === undefined) {
		    		previousKey = foundKey;
		    		self.drawHoverNote(foundKey.note);
		    	}
		    	if(previousKey.note.midi_value !== foundKey.note.midi_value) {

		    		self.clearHoverNote(previousKey.note);
		    		previousKey = foundKey;
		    		self.drawHoverNote(foundKey.note);
		    	}		    	
		    } else {
		    	if(previousKey !== undefined){
			    	self.clearHoverNote(previousKey.note);
			    	previousKey = undefined;
		    	}
		    }
		}
		view.addEventListener("mousemove", this.mouseMoveFunction);
		
		this.mouseOutFunction = function(event) {
			if(previousKey !== undefined){
				self.clearHoverNote(previousKey.note);
			}
		}
		view.addEventListener("mouseout", this.mouseOutFunction);
	}


	getPosition(element) {
		const rect = element.getBoundingClientRect();
		return { x: rect.left, y: rect.top };
	}

	findKey(key_map, range, x, y){
		var foundKey;
		var i;
	    for(i=range.min; i<=range.max; i++){
	    	var key = key_map[i];
	    	if(key.isWithinBounds({x: x, y: y})){
	    		foundKey = key;
	    		if(key.isBlack){
	    			break;
	    		}
	    	}
	    }
	    return foundKey;
	}
}

PianoView.Key = class  {
	constructor(x, y, width, height, note, color, isBlack = false){
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.note = note;
		this.color = color;
		this.isBlack = isBlack;
		this.isOn = false;
	}

	draw(ctx, color = this.color) {
		ctx.beginPath();
		ctx.lineWidth = 0;
		ctx.fillStyle = color;
		ctx.rect(this.x, this.y, this.width, this.height);
		ctx.fill();
		ctx.stroke();
    	
    	if (this.note.note_name.name == 'C' && this.note.octave == 4) {
			ctx.beginPath();
			ctx.arc(this.x + (this.width)/2, this.height - this.height*0.10, this.width * 0.15, 0, 2 * Math.PI, false);
			ctx.fillStyle = '#666';
			ctx.fill();
    	}
	}

	isWithinBounds(position) {
		return position.x >= this.x &&  position.x <= (this.width + this.x) &&
			position.y >= this.y &&  position.y <= (this.height + this.y);
	}
}

module.exports = PianoView;