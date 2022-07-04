const log = require("@jasonfleischer/log");
const pianoKit = require("@jasonfleischer/piano");
const musicKit = require("@jasonfleischer/music-model-kit");
musicKit.init();

var pianoView = buildPianoView();

function buildPianoView(range = musicKit.piano_range, width = 1000){
	return pianoKit({
		id: 'piano',
		range: range,
		width: width,
		onClick: function(note, isOn) {
			if(isOn) {
				noteOn(note);
			} else {
				noteOff(note);
			}
		},
		hover: true
	});
}
new musicKit.MidiListener( // add a midi listener
	function (midiValue, channel, velocity) {
		let note = musicKit.all_notes[midiValue];
		noteOn(note);
	},
	function (midiValue, channel, velocity) {
		let note = musicKit.all_notes[midiValue];
		noteOff(note);
	}
);

function noteOn(note){
	const freq = model.is_just_intonation ? 
		model.midiValueToJustIntonationFrequencyMap.get(note.midi_value) : note.frequency;
	if (audio_controller.startNote(freq, model.master_volume_percent, model.harmonicsVolume)){
		let color = note.note_name.is_sharp_or_flat ? "#777": "#aaa";
		pianoView.drawNoteWithColor(note, color);
		updateUIFrequencyTableNoteOn(note);
	}
}

function noteOff(note){
	const freq = model.is_just_intonation ? 
		model.midiValueToJustIntonationFrequencyMap.get(note.midi_value) : note.frequency;
	audio_controller.stopNote(freq);
	pianoView.clearNote(note);
	updateUIFrequencyTableNoteOff(note);
}

init = function() {

	storage.load();
	alert.init();
	buildMidiValueToJustIntonationFrequencyMap();
	window_resized_end();
	setup_keyboard_listeners();
	setup_controls()

	var isSafariMobile = window.mobileAndTabletCheck() && isSafari;
	if (isSafariMobile && !isFromHomeScreen()){
		install.showAlert();
	}
	updateUIFrequencyTable();	
}

function buildMidiValueToJustIntonationFrequencyMap(){

	var rootNote = musicKit.all_notes[model.note_type];
	model.midiValueToJustIntonationFrequencyMap = new Map();
	var i;
	for (i=0; i<musicKit.all_notes.length; i++) {
		var note = musicKit.all_notes[i];
		if(note.note_name.type == rootNote.note_name.type){
			model.midiValueToJustIntonationFrequencyMap.set(note.midi_value, note.frequency);
			var j;
			var multipliers = [1.0000, 25.0000/24.0000, 9.0000/8.0000, 6.0000/5.0000, 5.0000/4.0000, 4.0000/3.0000, 
						45.0000/32.0000, 3.0000/2.0000, 8.0000/5.0000, 5.0000/3.0000, 9.0000/5.0000, 15.0000/8.0000];
			for (j=0; j<multipliers.length; j++) {
				var newFreq = note.frequency * multipliers[j];
				model.midiValueToJustIntonationFrequencyMap.set(note.midi_value+j, newFreq);
			}
		}
	}
}

updateUIPresetButtons = function() {
	const index = storage.get_preset_index(6)
	var i;
	for (i = 1; i <= 6; i++) {
		let elem = $('P'+i);
		if (i == index){
			addClass(elem, 'selected');
		}else{
			removeClass(elem, 'selected');
		}	
	}
}
function updateUIFrequencyTable() {
	
	buildTableHeader();
	function buildTableHeader() {
		var table_head = $("frequency_table_head");
		removeChildren(table_head);
		var tr = document.createElement('tr');
		
		var th1 = document.createElement('th');
		th1.innerHTML = "Note";
		tr.appendChild(th1);

		var th2 = document.createElement('th');
		th2.innerHTML = "Equal Temperment";
		if (!model.is_just_intonation){ addClass(th2, "highlighted"); }
		tr.appendChild(th2);

		var th3 = document.createElement('th');
		th3.innerHTML = "Just Intonantion";
		if (model.is_just_intonation){ addClass(th3, "highlighted"); }	
		tr.appendChild(th3);

		table_head.appendChild(tr);
	}

	buildTableBody();
	function buildTableBody() {
		var table_body = $("frequency_table_body");
		removeChildren(table_body);

		var i;
		for (i = musicKit.piano_range.min; i < musicKit.piano_range.max+1; i++) {
			const note = musicKit.all_notes[i];
			var tr = document.createElement('tr');

			var td1 = document.createElement('td');
			td1.innerHTML = note.note_name.sharp_name + note.octave;
			if(note.note_name.type == musicKit.all_notes[model.note_type].note_name.type){
				addClass(td1, "highlighted");
			}
			tr.appendChild(td1);

			var td2 = document.createElement('td');
			var td2InnerHtml = Number(note.frequency).toFixed(4) + " Hz";
			if(!model.is_just_intonation){
				td2InnerHtml = "<h4>"+td2InnerHtml+"</h4>";
			}
			td2.innerHTML = td2InnerHtml;
			td2.id = "et"+note.note_name.sharp_name+note.octave;
			tr.appendChild(td2);

			var td3 = document.createElement('td');
			var freq = model.midiValueToJustIntonationFrequencyMap.get(note.midi_value);
			var td3InnerHtml = (freq ? Number(freq).toFixed(4) :"todo") + " Hz";
			if(model.is_just_intonation){
				td3InnerHtml = "<h4>"+td3InnerHtml+"</h4>";
			}
			td3.innerHTML = td3InnerHtml;
			td3.id = "ji"+note.note_name.sharp_name+note.octave;
			tr.appendChild(td3);

			table_body.appendChild(tr);
		}
	}
}	

function updateUIFrequencyTableNoteOn(note) {
	addClass($((model.is_just_intonation?"ji":"et")+note.note_name.sharp_name+note.octave), "highlighted-background");
}

function updateUIFrequencyTableNoteOff(note) {
	removeClass($((model.is_just_intonation?"ji":"et")+note.note_name.sharp_name+note.octave), "highlighted-background")
}

