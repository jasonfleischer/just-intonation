function setup_controls(){

	setupOnClicks();
	function setupOnClicks(){
		$("page_name").onclick = function() { info(); };
		$("kofi_button").onclick = function() { kofi(); };
		$("info_button").onclick = function() { info(); };

		setupPresetOnClicks();
		function setupPresetOnClicks(){
			$("P1").onclick = function(){
				model.harmonicsVolume = [1, 0];
				audio_controller.updateHarmonicsVolumes(model.harmonicsVolume);
				storage.set_preset_index(1);
				updateUIPresetButtons();
			}
			$("P2").onclick = function() {
				var volumeAry = [];
				volumeAry[0] = 1;
				for (i = 1; i < 26; i++) {
					volumeAry[i] = volumeAry[i-1]/2;
				}
				model.harmonicsVolume = volumeAry;
				audio_controller.updateHarmonicsVolumes(model.harmonicsVolume);
				storage.set_preset_index(2);
				updateUIPresetButtons(2);
			}
			$("P3").onclick = function() {
				var volumeAry = [];
				var numberOfHarmonicsToSet = 7;
				for (i = 0; i < 26; i++) {
					volumeAry[i] =  Math.max(0, 1 - (i/(numberOfHarmonicsToSet-1)));
				}
				model.harmonicsVolume = volumeAry;
				audio_controller.updateHarmonicsVolumes(model.harmonicsVolume);
				storage.set_preset_index(3);
				updateUIPresetButtons();
			}
			$("P4").onclick = function() {
				var volumeAry = [];
				var numberOfHarmonicsToSet = 5;
				for (i = 0; i < 26; i++) {
					if (i%2 == 0) {
						volumeAry[i] =  Math.max(0, 1 - (i/(numberOfHarmonicsToSet*2-1)));
					} else {
						volumeAry[i] = 0;
					}
				}
				model.harmonicsVolume = volumeAry;
				audio_controller.updateHarmonicsVolumes(model.harmonicsVolume);
				storage.set_preset_index(4);
				updateUIPresetButtons();
			}
			$("P5").onclick = function() {
				var volumeAry = [];
				var numberOfHarmonicsToSet = 5;
				for (i = 0; i < 26; i++) {
					volumeAry[i] =  (100/(2+i-1))/100;
				}
				model.harmonicsVolume = volumeAry;
				audio_controller.updateHarmonicsVolumes(model.harmonicsVolume);
				storage.set_preset_index(5);
				updateUIPresetButtons();
			}
			$("P6").onclick = function() {
				model.harmonicsVolume = [1, 0.286699025, 0.63513, 0.042909002, 0.2522, 0.30904, 0.25045, 0.2004, 0, 0.14836, 
			            0.17415, 0.07979, 0.05383, 0.07332, 0.07206, 0.08451, 0.022270261, 0.013072562, 
			            0.008585879, 0.005771505, 0.004343925, 0.002141371, 0.005343231, 0.000530244, 
			            0.004711017, 0.009014153];
				audio_controller.updateHarmonicsVolumes(model.harmonicsVolume);
				storage.set_preset_index(6);
				updateUIPresetButtons();
			}

			$('P'+storage.get_preset_index(6)).click();
		}
	}

	setupVolumeSlider();
	function setupVolumeSlider() {
		var slider = $("volumeRange");
		slider.value = model.master_volume_percent*10;
		var sliderText = $("volume");
		sliderText.innerHTML = "Volume: " + Number(model.master_volume_percent).toFixed() + "%";
		slider.oninput = function() {
			model.master_volume_percent = Math.max(0.00001, this.value / 10);
			storage.set_volume(model.master_volume_percent);
			sliderText.innerHTML = "Volume: " + Number(model.master_volume_percent).toFixed() + "%";
			audio_controller.updateVolume(model.master_volume_percent);
		}
	}

	setupJustIntonationSwitch();
	function setupJustIntonationSwitch() {
		const base_id = "just_intonate" 
		/*$(base_id).addEventListener("click", function(e){
			$(base_id+"_checkbox").click();



		});*/
		$(base_id+"_checkbox_switch").addEventListener('keyup', function(e) {
			if (event.code === 'Space' || event.code === 'Enter') $(base_id+"_checkbox").click();
		});
		$(base_id+"_checkbox").addEventListener("change", function(e){
			var value = this.checked;
			log.i("on "+base_id+" change: " + value);
			model.is_just_intonation = value;
			storage.set_is_just_intonation(value);
			audio_controller.stop();
			updateUIFrequencyTable();
		});
		$(base_id+"_checkbox").checked = model.is_just_intonation;
	}

	setupSelectControls();
	function setupSelectControls(){
		setupRootNoteSelect();
		function setupRootNoteSelect() {
			const id = "note_type_select";
			var select = $(id);
			var i;
			let noteTypes = musicKit.Note.ALL_NOTE_NAME_TYPES;
			var midi_value = 60;
			for (i = 0; i < noteTypes.length; i++) {
				let noteType = noteTypes[i];
				let value = noteType.type;
				var option = document.createElement('option');
				if(midi_value == model.selected_root_note) {
					option.setAttribute('selected','selected');
				}
				option.setAttribute('value', midi_value);
				midi_value++;
				option.innerHTML = value;
				select.appendChild(option);
			}

			$(id).addEventListener("change", function(e){
				var value = parseInt(this.value);
				log.i("on "+id+": " + value);
				model.note_type = value;
				storage.set_root_note(value);
				audio_controller.stop();
				buildMidiValueToJustIntonationFrequencyMap();
				updateUIFrequencyTable();
			});
			$(id).value = model.note_type;
		}
	}
}

kofi = function(){
	window.open("https://ko-fi.com/jasonfleischer", "_blank");
}
info = function(){
	information.showAlert();
}
dismissInfo = function (){
	information.dismissAlert();
}

