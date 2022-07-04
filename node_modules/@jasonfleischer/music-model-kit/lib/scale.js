const log = require("@jasonfleischer/log");

class Scale {

	static TYPE = Object.freeze({
		
		// 7 notes
		Ionian: "Ionian",
		Dorian: "Dorian",
		Phrygian: "Phrygian",
		Lydian: "Lydian",
		Mixolydian: "Mixolydian",
		Aeolian: "Aeolian",
		Locrian: "Locrian",

		Melodic_minor: "Melodic minor (ascending)",
		Harmonic_minor: "Harmonic minor",

		Double_Harmonic_Major: "Double Harmonic Major",
		Double_Harmonic_minor: "Double Harmonic minor",

		Phrygian_Dominant: "Spanish",

		// 6 notes
		Whole_Tone: "Whole Tone",
		blues: "Blues",

		// 5 notes (pentatonic)
		minor_Pentatonic: "minor pentatonic",
		Major_Pentatonic: "Major pentatonic",
		neutral_Pentatonic: "Neutral pentatonic",

		// 4 notes
		minor_Seventh: "minor seventh",
		Major_Seventh: "Major seventh",
		Dom_Seventh: "Dominant seventh",
		diminished_Tone: "Diminished Tone",
		
		// 3 notes
		minor_Triad: "minor triad",
		Major_Triad: "Major triad",
		Aug_Triad: "Augmented triad",
		Dim_Triad: "Diminished triad"
		
	});


	constructor(root_note, scale_type = Scale.TYPE.Major){
		this.root_note = root_note;
		this.type = scale_type;

		function replaceAll(str, find, replace) {
			return str.replace(new RegExp(find, 'g'), replace);
		}
		this.file_name = root_note.note_name.file_name.concat(["audio/scale/"+ replaceAll(this.type.toLowerCase(),' ','_') +".mp3"]);
		this.note_sequence = Scale.getNoteSequence(scale_type);
		this.alternate_names = Scale.getAlternateNames(scale_type);
		this.note_labels = this.getLabels();
		this.structure = this.getStructure();
	}

	static getNoteSequence(scale_type){
		switch(scale_type){
			case Scale.TYPE.Ionian:
				return [0, 2, 4, 5, 7, 9, 11];
			case Scale.TYPE.Dorian:
				return [0, 2, 3, 5, 7, 9, 10];
			case Scale.TYPE.Phrygian:
				return [0, 1, 3, 5, 7, 8, 10];
			case Scale.TYPE.Lydian:
				return [0, 2, 4, 6, 7, 9, 11];
			case Scale.TYPE.Mixolydian:
				return [0, 2, 4, 5, 7, 9, 10];
			case Scale.TYPE.Aeolian:
				return [0, 2, 3, 5, 7, 8, 10];
			case Scale.TYPE.Locrian:
				return [0, 1, 3, 5, 6, 8, 10];
			case Scale.TYPE.Melodic_minor:
				return [0, 2, 3, 5, 7, 9, 11];
			case Scale.TYPE.Harmonic_minor:
				return [0, 2, 3, 5, 7, 8, 11];
			case Scale.TYPE.Double_Harmonic_Major:
				return [0, 1, 4, 5, 7, 8, 11];
			case Scale.TYPE.Double_Harmonic_minor:
				return [0, 2, 3, 6, 7, 8, 11];
			case Scale.TYPE.Phrygian_Dominant:
				return [0, 1, 4, 5, 7, 8, 10];

			case Scale.TYPE.Whole_Tone:
				return [0, 2, 4, 6, 8, 10];
			case Scale.TYPE.blues:
				return [0, 3, 5, 6, 7, 10];

			case Scale.TYPE.minor_Pentatonic:
				return [0, 3, 5, 7, 10];
			case Scale.TYPE.Major_Pentatonic:
				return [0, 2, 4, 7, 9];
			case Scale.TYPE.neutral_Pentatonic:
				return [0, 2, 5, 7, 10];

			case Scale.TYPE.minor_Seventh:
				return [0, 3, 7, 10];
			case Scale.TYPE.Major_Seventh:
				return [0, 4, 7, 11];
			case Scale.TYPE.Dom_Seventh:
				return [0, 4, 7, 10];
			case Scale.TYPE.diminished_Tone:
				return [0, 3, 6, 9];

			case Scale.TYPE.minor_Triad:
				return [0, 3, 7];
			case Scale.TYPE.Major_Triad:
				return [0, 4, 7];
			case Scale.TYPE.Aug_Triad:
				return [0, 4, 8];
			case Scale.TYPE.Dim_Triad:
				return [0, 3, 6];
		}
		log.e('getNoteSequence failed: ' + scale_type);
	}

	static getAlternateNames(scale_type){
		switch(scale_type){
			case Scale.TYPE.Ionian:
				return ["Major"];
			case Scale.TYPE.Aeolian:
				return ["minor", "Melodic minor (descending)"];
			case Scale.TYPE.Double_Harmonic_Major:
				return ["Byzantine", "Arabic", "Gypsy major"];
			case Scale.TYPE.Double_Harmonic_minor:
				return ["Hungarian minor", "Gypsy minor"];
			case Scale.TYPE.Phrygian_Dominant:
				return ["Phrygian Dominant", "Spanish Gypsy"];
			default:
				return [];
		}
	}
	
	getNoteArray(all_notes, range) {
	
		var note_names = this.getUniqueNoteName(all_notes, range);
		var note_array = [];
		var i;
		for(i=range.min; i<=range.max; i++){
			var note = all_notes[i];
			if (note_names.has(note.note_name.type)) {
				note_array.push(note);
			}
		}
		if (note_array.length == 0) {
			log.e("no notes found for scale");  
		}
		return note_array;
	}

	getUniqueNoteName(all_notes, range) {

		function isNoteWithinRange(midi_number, range){
			return midi_number >= range.min && midi_number <= range.max;
		}
		const noteNames = new Set();
		var i;
		for(i=0; i<this.note_sequence.length; i++){
			let midi_number = this.root_note.midi_value + this.note_sequence[i];
			if(isNoteWithinRange(midi_number, range)){
				noteNames.add(all_notes[midi_number].note_name.type);
			}
		}
		for(i=this.note_sequence.length-1; i>=0; i--){
			let midi_number = this.root_note.midi_value - (12 - this.note_sequence[i]);
			if(isNoteWithinRange(midi_number, range)){
				noteNames.add(all_notes[midi_number].note_name.type);
			}
		}
		return noteNames;
	}

	getLabels() {
		let result = [];
		let all_labels = ["R", "m2", "M2", "m3", "M3", "P4", "TT", "P5", "m6", "M6", "m7", "M7"];
		var i;
		for(i=0; i<this.note_sequence.length; i++){
			result.push(all_labels[this.note_sequence[i]]);
		}
		return result;
	}

	getLabel(note) {
		let all_labels = ["R", "m2", "M2", "m3", "M3", "P4", "TT", "P5", "m6", "M6", "m7", "M7"];
		if(note.midi_value >= this.root_note.midi_value) {
			return all_labels[(note.midi_value - this.root_note.midi_value) % 12];
		} else {
			var diff = this.root_note.midi_value - note.midi_value;
			if(diff >= 12) { diff = diff % 12; }
			if(diff % 12 == 0) return all_labels[0];
			return all_labels[12 - diff];
		}
	}

	getStructure() {
		let result = [];
		let all_labels = ["Root", "minor 2nd", "Major 2nd", "minor 3rd", "Major 3rd", "Fourth",
											"Tritone", "Fifth", "minor 6th", "Major 6th", "minor 7th", "Major 7th"];
		var i;
		for(i=0; i<=this.note_sequence.length; i++){
			result.push(all_labels[this.note_sequence[i]]);
		}
		return result;
	}

	getContainingScaleTypeObjects(all_notes) {

		let result = [];

		var j;
		for(j = 0; j < this.note_sequence.length; j++){

			for (const key in Scale.TYPE) {
				let value = Scale.TYPE[key];			
				let sequence = Scale.getNoteSequence(value);
				if(sequence.length <= this.note_sequence.length){
					
					var newSequence = [];
					var k;
					for(k = 0; k < this.note_sequence.length; k++){
						newSequence[k] = this.note_sequence[k]-this.note_sequence[j];
						if(newSequence[k]<0){
							newSequence[k] = newSequence[k] + 12;
						}
					}

					var containsAllIntervals = true;
					var i;
					for(i = 0; i < sequence.length; i++){
						if(!newSequence.includes(sequence[i])){
							containsAllIntervals = false;
							break;
						}
					}
					if(containsAllIntervals){
						let containingNote = all_notes[this.root_note.midi_value + this.note_sequence[j]];
						result.push({note: containingNote, scale_type: value});
					}
				}
			}
		}
		return result;
	}

	getProperNoteNames(all_notes, all_key_signatures){
		
		var notes = [];
		var accidental_notes = [];

		var k;		
		for(k = 0; k < this.note_sequence.length; k++){
			let note = all_notes[this.root_note.midi_value + this.note_sequence[k]];
			if(note.note_name.is_sharp_or_flat){
				accidental_notes.push(note);
			}
			notes.push(note);
		}

		

		let number_of_accidentals = accidental_notes.length;

		if(this.type == Scale.TYPE.Ionian || this.type == Scale.TYPE.Dorian || this.type == Scale.TYPE.Phrygian || 
			this.type == Scale.TYPE.Lydian || this.type == Scale.TYPE.Mixolydian || this.type == Scale.TYPE.Aeolian || 
			this.type == Scale.TYPE.Locrian) {

			function getKeySignatures(){

				var available_key_signatures = [];
				var i;
				for(i = 0; i < all_key_signatures.length; i++){
					let key_signature = all_key_signatures[i];
					
					if (key_signature.number_of_flats == number_of_accidentals){

						var containsAllAccidentals = true;
						var l;
						for(l = 0; l < accidental_notes.length; l++){
							let accentalString = accidental_notes[l].note_name.flat_name;
							if(!key_signature.note_sequence.includes(accentalString)){
								containsAllAccidentals = false;
								break;
							}
						}
						if(containsAllAccidentals)
							available_key_signatures.push(key_signature);

					} else if(key_signature.number_of_sharps == number_of_accidentals){

						var containsAllAccidentals = true;
						var l;
						for(l = 0; l < accidental_notes.length; l++){
							let accentalString = accidental_notes[l].note_name.sharp_name;
							if(!key_signature.note_sequence.includes(accentalString)){
								containsAllAccidentals = false;
								break;
							}
						}
						if(containsAllAccidentals)
							available_key_signatures.push(key_signature);
						
					}
				}
				return available_key_signatures;
			}
			var available_key_signatures = getKeySignatures();

			if(number_of_accidentals != 0){


				function getResultFromKeySignature(key_signature) {
					var result = []
					var j;
					for(j = 0; j<notes.length; j++){
						let note = notes[j];

						if (note.note_name.is_sharp_or_flat){
							var n;
							for(n = 0; n<key_signature.note_sequence.length; n++){
								var key_signature_note = key_signature.note_sequence[n];
								if(note.note_name.sharp_name == key_signature_note || note.note_name.flat_name == key_signature_note) {
									result.push(key_signature_note);
								}
							}
						} else {
							result.push(note.note_name.type);
						}
					}
					return result;
				}

				if(available_key_signatures.length == 1){
					let key_signature = available_key_signatures[0];
					return getResultFromKeySignature(key_signature);
				} else {
					log.e('key signature not available');
				}
			}
		}


		function defaultAnswer(notes){
			var result = [];
			var j;
			for(j = 0; j<notes.length; j++){
				let note = notes[j];
				//result.push(note.note_name.is_sharp_or_flat ? note.note_name.sharp_name : note.note_name.type);
				
				result.push(note.note_name.type)
			}
			return result;
		}
		
		return defaultAnswer(notes);
	}

	toString() {
		return  this.root_note.note_name.type + " " + this.type;
	}
}

module.exports = Scale;