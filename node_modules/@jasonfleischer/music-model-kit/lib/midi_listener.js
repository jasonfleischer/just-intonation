const log = require("@jasonfleischer/log");

//TODO: only connects to first found device
class MidiListener {
	
	constructor(noteOn, noteOff){

		this.noteOn = noteOn;
		this.noteOff = noteOff;

		let self = this;

		if (!navigator.requestMIDIAccess) {
			log.e("this browser does not support midi");
			return;
		}

		navigator.permissions.query({name: 'midi', sysex: true}).then(function(result) {
			if(result.state == 'granted') {
				log.i("Midi permissions granted");
			} else if (result.state == 'prompt'){
				log.i("Midi permissions prompt");
			} else {
				log.i("Midi permissions denied");
			}
		});

		navigator.requestMIDIAccess({sysex: true}).then(function(access) {
			if (access.inputs.size > 0) {
				self.connectToFirstDevice(Array.from(access.inputs.values()));
			} else {
				log.i("no midi devices found");
			}

			access.onstatechange = function(e) {
				log.i("Midi state changed, number of devices: " + access.inputs.size);
				if (access.inputs.size > 0) {
					self.connectToFirstDevice(Array.from(access.inputs.values()));
				}
			}
		}, function() {
			log.e("Midi request access failure");
		});
	}

	connectToFirstDevice(devices) {
		if (devices.length > 0) {
			this.connectToDevice(devices[0]);
		} else {
			log.e("connectToFirstDevice: no midi inputs");	
		}
	}

	connectToDevice(device) {

		if(this.connectedDevice !== undefined && device.id == this.connectedDevice.id) {
			log.i('Device already connected');
			return;
		}

		log.i('Connecting to device: ' + this.deviceToString(device));
		this.connectedDevice = device;
		let noteOn = this.noteOn;
		let noteOff = this.noteOff;
		let NOTE_ON = 0x9;
		let NOTE_OFF = 0x8;
		device.onmidimessage = function(m) {
			const [command, message, velocity] = m.data;
			let midi_value = message;
			let channel = command & 0x0F;
			let opCode = (command & 0xF0) >> 4;
			if (opCode === NOTE_ON) {
				noteOn(midi_value, channel, velocity);
			} else if(opCode === NOTE_OFF) {
				noteOff(midi_value, channel, velocity);
			}
		}
	}

	deviceToString(device) {
		return device.name + ' ' + device.manufacturer;
	}
}

module.exports = MidiListener;