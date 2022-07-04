const log = require("@jasonfleischer/log");
class Chord {

	static TYPE = Object.freeze({
		Major: "Major",
		minor: "minor",
		Aug: "augmented",
		Dim: "diminished",

		Major7: "Major 7",
		minor7: "minor 7",
		Dom7: "Dominant 7"
	});

	static INVERSION_TYPE = Object.freeze({
		Root: "Root",
		First: "first inversion",
		Second: "second inversion",
		Third: "third inversion"
	});

	static PLAY_TYPE = Object.freeze({
		HARMONIC: "Harmonic",
		ARPEGGIATE: "Arpeggiate"
	});

	constructor(root_note, chord_type = Chord.TYPE.Major, play_type = Chord.PLAY_TYPE.HARMONIC, inversion = Chord.INVERSION_TYPE.Root) {

		this.root_note = root_note;
		this.delay_in_ms = 500;
		this.name = root_note.note_name.type + " " + chord_type;
		this.inversion = inversion
		this.type = chord_type
		this.play_type = play_type

		function replaceAll(str, find, replace) {
			return str.replace(new RegExp(find, 'g'), replace);
		}
		this.file_name = root_note.note_name.file_name.concat(["audio/chords/"+ replaceAll(replaceAll(this.type.toLowerCase(),' ','_'), '7', 'seventh') +".mp3"]);

		switch(chord_type){
		case Chord.TYPE.Major:
			if(this.inversion == Chord.INVERSION_TYPE.Root) {
				this.note_sequence = [0, 4, 7];
			} else if (this.inversion == Chord.INVERSION_TYPE.First){
				this.note_sequence = [-8, -5, 0];
			} else {
				this.note_sequence = [-5, 0, 4]; 
			}
			break;
		case Chord.TYPE.minor:
			if(this.inversion == Chord.INVERSION_TYPE.Root) {
				this.note_sequence = [0, 3, 7];
			} else if (this.inversion == Chord.INVERSION_TYPE.First){
				this.note_sequence = [-9, -5, 0];
			} else {
				this.note_sequence = [-5, 0, 3];
			}
			break;

		case Chord.TYPE.Aug:
			if(this.inversion == Chord.INVERSION_TYPE.Root) {
				this.note_sequence = [0, 4, 8];
			} else if (this.inversion == Chord.INVERSION_TYPE.First){
				this.note_sequence = [-8, -4, 0];
			} else {
				this.note_sequence = [-4, 0, 4];
			}
			break;
		 case Chord.TYPE.Dim:
		 	if(this.inversion == Chord.INVERSION_TYPE.Root) {
				this.note_sequence = [0, 3, 6];
			} else if (this.inversion == Chord.INVERSION_TYPE.First){
				this.note_sequence = [-9, -6, 0];
			} else {
				this.note_sequence = [-6, 0, 3];
			}
			break;

		case Chord.TYPE.Major7:

			if(this.inversion == Chord.INVERSION_TYPE.Root) {
				this.note_sequence = [0, 4, 7, 11];
			} else if (this.inversion == Chord.INVERSION_TYPE.First){
				this.note_sequence = [-8, -5, -1, 0];
			} else if (this.inversion == Chord.INVERSION_TYPE.Second){
				this.note_sequence = [-5, -1, 0, 4];
			} else {
				this.note_sequence = [-1, 0, 4, 7];
			}
			this.file_name = root_note.note_name.file_name.concat(["audio/chords/major_seventh.mp3"]);
			break;
		case Chord.TYPE.minor7:
			if(this.inversion == Chord.INVERSION_TYPE.Root) {
				this.note_sequence = [0, 3, 7, 10];
			} else if (this.inversion == Chord.INVERSION_TYPE.First){
				this.note_sequence = [-9, -5, -2, 0];
			} else if (this.inversion == Chord.INVERSION_TYPE.Second){
				this.note_sequence = [-5, -2, 0, 3];
			} else {
				this.note_sequence = [-2, 0, 3, 7];
			}
			this.file_name = root_note.note_name.file_name.concat(["audio/chords/minor_seventh.mp3"]);
			break;

		case Chord.TYPE.Dom7:
			if(this.inversion == Chord.INVERSION_TYPE.Root) {
				this.note_sequence = [0, 4, 7, 10];
			} else if (this.inversion == Chord.INVERSION_TYPE.First){
				this.note_sequence = [-8, -5, -2, 0];
			} else if (this.inversion == Chord.INVERSION_TYPE.Second){
				this.note_sequence = [-5, -2, 0, 4];
			} else {
				this.note_sequence = [-2, 0, 4, 7];
			}
			break;
		}
		this.note_labels = this.getLabels();
		this.structure = this.getStructure();
	}

	getLabels() {
		let result = [];
		let all_labels = ["R", "m2", "M2", "m3", "M3", "P4", "TT", "P5", "m6", "M6", "m7", "M7"];
		var i;
		for(i=0; i<this.note_sequence.length; i++){
			var sequence = this.note_sequence[i]
			if(sequence < 0) {
				sequence = 12 + sequence;
			}
			result.push(all_labels[sequence]);
		}
		return result;
	}

	getStructure() {
		let result = [];
		let all_labels = ["Root", "minor 2nd", "Mahor 2nd", "minor 3rd", "Major 3rd", "Fourth",
						  "Tritone", "Fifth", "minor 6th", "Major 6th", "minor 7th", "Major 7th"];
		var i;
		for(i=0; i<this.note_sequence.length; i++){
			var sequence = this.note_sequence[i]
			if(sequence < 0) {
				sequence = 12 + sequence;
			}
			result.push(all_labels[sequence]);
		}
		return result;
	}

	toString() {
		return "CHORD: " + this.name +", "+ this.structure + ", ", this.note_sequence;
	}

	isWithinRange(range) {
		return (this.root_note.midi_value + this.note_sequence[0]) >= range.min  && 
			(this.root_note.midi_value + this.note_sequence[this.note_sequence.length-1]) <= range.max;
	}

	getNoteArray(all_notes, range) {
		function isNoteWithinRange(midi_number, range){
			return midi_number >= range.min && midi_number <= range.max ;
		}

		var note_array = [];
		var i;
		for(i=0; i<this.note_sequence.length; i++){
			let midi_number = this.root_note.midi_value + this.note_sequence[i];
			if(isNoteWithinRange(midi_number, range)){
				note_array.push(all_notes[midi_number]);
			}
		}
		if (note_array.length == 0) {
			log.i("no notes found for chord");  
		}
		return note_array;
	}

	
	static ALL_TYPES = [Chord.TYPE.Major, Chord.TYPE.minor, Chord.TYPE.Aug, Chord.TYPE.Dim,
						Chord.TYPE.Major7, Chord.TYPE.minor7, Chord.TYPE.Dom7];

	static ALL_PLAY_TYPES = [Chord.PLAY_TYPE.HARMONIC, Chord.PLAY_TYPE.ARPEGGIATE];

	static generateRandom(all_notes, range, types = ALL_TYPES, play_types = ALL_PLAY_TYPES,
							three_note_inversion_types = [Chord.INVERSION_TYPE.Root, Chord.INVERSION_TYPE.First, Chord.INVERSION_TYPE.Second], 
							four_note_inversion_types =  [Chord.INVERSION_TYPE.Root, Chord.INVERSION_TYPE.First, Chord.INVERSION_TYPE.Second, Chord.INVERSION_TYPE.Third]) {

		let min = range.min;
		let max = range.max;
		function randomInteger(min, max) { // min and max included 
			return Math.floor(Math.random() * (max - min + 1) + min);
		}
		function is_type_three_notes(type) {
			return type == Chord.TYPE.Major || type == Chord.TYPE.minor || type == Chord.TYPE.Aug || type == Chord.TYPE.Dim; 
		}

		var random_note = all_notes[randomInteger(min, max)];
		var play_type = play_types[ randomInteger(0, play_types.length-1) ];
		var random_chord_type = types[ randomInteger(0, types.length-1) ];

		
		var inversion = Chord.INVERSION_TYPE.Root;
		if (is_type_three_notes(random_chord_type)){
			inversion = three_note_inversion_types[ randomInteger(0, three_note_inversion_types.length-1) ];
		} else{
			inversion = four_note_inversion_types[ randomInteger(0, four_note_inversion_types.length-1) ];
		}
		var chord = new Chord(random_note, random_chord_type, play_type, inversion);
		var note_array = chord.getNoteArray(all_notes, range)
		let nunmber_of_notes = is_type_three_notes(random_chord_type) ? 3: 4;
		while(note_array.length != nunmber_of_notes){

			random_note = all_notes[randomInteger(min, max)];
			chord = new Chord(random_note, random_chord_type, play_type, inversion);
			note_array = chord.getNoteArray(all_notes, range);
		}

		return chord;
	}
}

module.exports = Chord;

