const log = require("@jasonfleischer/log");

class KeySignature {

	static TYPE = Object.freeze({
		C: "C",
		G: "G",
		D: "D",
		A: "A",
		E: "E",

		B: "B",
		Cb: "Cb",

		F_sharp: "F#",
		G_flat: "Gb",

		F: "F",
		B_flat: "Bb",
		E_flat: "Eb",
		A_flat: "Ab",

		D_flat: "Db",
		C_sharp: "C#"
	});

	constructor(type){
		this.type = type;
		this.note_sequence = this.getNoteSequence(type);
		let pair = this.getNumberOfFlatsAndSharps();
		this.number_of_flats = pair[0];
		this.number_of_sharps = pair[1];
	}

	getNoteSequence(type){
		switch(type){
			case KeySignature.TYPE.C:
				return ["C", "D", "E", "F", "G", "A", "B"];
			case KeySignature.TYPE.G:
				return ["G", "A", "B", "C", "D", "E", "F#"];
			case KeySignature.TYPE.D:
				return ["D", "E", "F#", "G", "A", "B", "C#"];
			case KeySignature.TYPE.A:
				return ["A", "B", "C#", "D", "E", "F#", "G#"];
			case KeySignature.TYPE.E:
				return ["E", "F#", "G#", "A", "B", "C#", "D#"];
			case KeySignature.TYPE.B:
				return ["B", "C#", "D#", "E", "F#", "G#", "A#"];
			case KeySignature.TYPE.F_sharp:
				return ["F#", "G#", "A#", "B", "C#", "D#", "E#"];
			case KeySignature.TYPE.C_sharp:
				return ["C#", "D#", "E#", "F#", "G#", "A#", "B#"];

			case KeySignature.TYPE.F:
				return ["F", "G", "A", "Bb", "C", "D", "E"];
			case KeySignature.TYPE.B_flat:
				return ["Bb", "C", "D", "Eb", "F", "G", "A"];
			case KeySignature.TYPE.E_flat:
				return ["Eb", "F", "G", "Ab", "Bb", "C", "D"];
			case KeySignature.TYPE.A_flat:
				return ["Ab", "Bb", "C", "Db", "Eb", "F", "G"];
			case KeySignature.TYPE.D_flat:
				return ["Db", "Eb", "F", "Gb", "Ab", "Bb", "C"];
			case KeySignature.TYPE.G_flat:
				return ["Gb", "Ab", "Bb", "Cb", "Db", "Eb", "F"];
			case KeySignature.TYPE.Cb:
				return ["Cb", "Db", "Eb", "Fb", "Gb", "Ab", "Bb"];
 
			log.e("invalid getNoteSequence in KeySignature");
		}
	}

	getNumberOfFlatsAndSharps() {
		var flatResult = 0;
		var sharpResult = 0;
		var i;
		for(i=0; i<this.note_sequence.length; i++){
			var note = this.note_sequence[i];
			if (note.includes("b")){
				flatResult++;
			} else if (note.includes("#")){
				sharpResult++;
			}
		}
		return [flatResult, sharpResult];
	}
}

module.exports = KeySignature;