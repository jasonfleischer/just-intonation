class Interval {

	static TYPE = Object.freeze({
		MINOR_SECOND: "minor 2nd",
		MAJOR_SECOND: "Major 2nd",
		MINOR_THIRD: "minor 3rd",
		MAJOR_THIRD: "Major 3rd",
		PERFECT_FOURTH: "Fourth",
		TRITONE: "Tritone",
		PERFECT_FIFTH: "Fifth",
		MINOR_SIXTH: "minor 6th",
		MAJOR_SIXTH: "Major 6th",
		MINOR_SEVENTH: "minor 7th",
		MAJOR_SEVENTH: "Major 7th",
		OCTAVE: "Octave"
	});

	static PLAY_TYPE = Object.freeze({
		ASCENDING: "Ascending",
		DESCENDING: "Descending",
		HARMONIC: "Harmonic"
	});

	constructor(type, note, play_type) {
		this.type = type;
		this.lower_note = note;
		this.delay_in_ms = 500;
		this.play_type = play_type;
		function replaceAll(str, find, replace) {
			return str.replace(new RegExp(find, 'g'), replace);
		}
		this.audio_file_name = "audio/intervals/"+ replaceAll(this.type, ' ', '_').toLowerCase() +".mp3";

		this.higher_note_midi_value = note.midi_value + this.getIntervalStep();
		if(this.higher_note_midi_value > 128) {
			log.e("todo: out of bounds error")
		}
	}

	toString() {
		return  "INTERVAL: " + this.type + ": " + this.getIntervalStep();
	}

	isWithinRange(min, max){
		return this.lower_note.midi_value >= min && this.lower_note.midi_value <= max && this.higher_note_midi_value >= min && this.higher_note_midi_value <= max
	}

	getHigherNote(all_notes){
		return all_notes[this.higher_note_midi_value];
	}

	getIntervalStep = function(){

		switch(this.type){
			case Interval.TYPE.MINOR_SECOND:
				return 1;
			case Interval.TYPE.MAJOR_SECOND:
				return 2;
			case Interval.TYPE.MINOR_THIRD:
				return 3;
			case Interval.TYPE.MAJOR_THIRD:
				return 4;
			case Interval.TYPE.PERFECT_FOURTH:
				return 5;
			case Interval.TYPE.TRITONE:
				return 6;
			case Interval.TYPE.PERFECT_FIFTH:
				return 7;
			case Interval.TYPE.MINOR_SIXTH:
				return 8;
			case Interval.TYPE.MAJOR_SIXTH:
				return 9
			case Interval.TYPE.MINOR_SEVENTH:
				return 10
			case Interval.TYPE.MAJOR_SEVENTH:
				return 11
			case Interval.TYPE.OCTAVE:
				return 12;
		}
	}

	static ALL_TYPES = [Interval.TYPE.MINOR_SECOND, Interval.TYPE.MAJOR_SECOND, 
						Interval.TYPE.MINOR_THIRD, Interval.TYPE.MAJOR_THIRD,
						Interval.TYPE.PERFECT_FOURTH, Interval.TYPE.TRITONE,
						Interval.TYPE.PERFECT_FIFTH, Interval.TYPE.MINOR_SIXTH,
						Interval.TYPE.MAJOR_SIXTH, Interval.TYPE.MINOR_SEVENTH,
						Interval.TYPE.MAJOR_SEVENTH, Interval.TYPE.OCTAVE];
	static ALL_PLAY_TYPES = [Interval.PLAY_TYPE.ASCENDING, Interval.PLAY_TYPE.DESCENDING, 
							Interval.PLAY_TYPE.HARMONIC];

	static generateRandom(all_notes, range, types = ALL_TYPES, play_types = ALL_PLAY_TYPES) {
		let min = range.min;
		let max = range.max;

		function randomInteger(min, max) { // min and max included 
			return Math.floor(Math.random() * (max - min + 1) + min);
		}

		var rand = randomInteger(0, types.length-1);
		var type = types[rand];
		
		var note = all_notes[randomInteger(min, max)];

		var rand = randomInteger(0, play_types.length-1);
		var play_type = play_types[rand];

		var interval = new Interval(type, note, play_type);

		while(!interval.isWithinRange(min, max)){
			note = all_notes[randomInteger(min, max)];
			interval = new Interval(type, note, play_type);
		}
		return interval;
	}
}

module.exports = Interval;