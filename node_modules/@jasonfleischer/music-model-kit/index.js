const Note = require("./lib/note.js");
const Chord = require("./lib/chord.js");
const Scale = require("./lib/scale.js");
const KeySignature = require("./lib/key_signature.js");
const Interval = require("./lib/interval.js");
const MidiListener = require("./lib/midi_listener.js");

const midi_range = { min: 0, max: 127 };
const piano_range = { min: 21, max: 108 };
const guitar_range = { min: 40, max: 84 };

var all_notes = [];
var all_key_signatures = [];

function init(){
	function build_all_notes(){
		let ALL_NOTE_NAME_TYPES = Note.ALL_NOTE_NAME_TYPES;
		var midi_value = 0; // 0 - 127
		const octaves = 9;
		var octave = 0;
		for(octave = -1 ; octave <= octaves; octave++){
			var j;
			for(j = 0 ; j < ALL_NOTE_NAME_TYPES.length; j++){
				var note_name = ALL_NOTE_NAME_TYPES[j].sharp_name;
				var note = new Note(ALL_NOTE_NAME_TYPES[j], midi_value, octave);

				all_notes.push(note);

				midi_value++;

				if(midi_value > midi_range.max) break;
			}
		}
	}
	build_all_notes();

	function build_all_key_signatures(){
		let keySignatureTypes = KeySignature.TYPE;
		for(const key in keySignatureTypes){
			let value = keySignatureTypes[key];
			all_key_signatures.push(new KeySignature(value));
		}
	}
	build_all_key_signatures();
}

function changeNoteColors(color="#00f"){
    var i;
    for(i = 0; i <= 127; i++){
        all_notes[i].note_name.color = color;
    }
}

module.exports = {init, Note, Chord, Scale, KeySignature, Interval, MidiListener, all_notes, all_key_signatures, piano_range, guitar_range, changeNoteColors};

