audio_controller = {
	setup: false,
	ctx: {},
	compressorNode: {},
	masterGainNode: {},
	frequencyToOscillatorMap: {}
};

audio_controller.startNote = function(frequency, volume_percent, harmonicsVolume) {

	if (!this.setup) {

		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		this.ctx = new AudioContext();

		this.frequencyToOscillatorMap = new Map();

		this.masterGainNode = this.ctx.createGain();
		this.masterGainNode.gain.value = volume_percent / 100;

		this.compressorNode = this.ctx.createDynamicsCompressor();
		this.compressorNode.threshold.setValueAtTime(-20, this.ctx.currentTime);
		this.compressorNode.knee.setValueAtTime(40, this.ctx.currentTime);
		this.compressorNode.ratio.setValueAtTime(12, this.ctx.currentTime);
		this.compressorNode.attack.setValueAtTime(0, this.ctx.currentTime);
		this.compressorNode.release.setValueAtTime(0.25, this.ctx.currentTime);

		this.compressorNode.connect(this.masterGainNode);		
		this.masterGainNode.connect(this.ctx.destination);

		this.setup = true;
	}

	if(!this.frequencyToOscillatorMap.has(frequency)){
	
		var osc = this.ctx.createOscillator();
		osc.frequency.value = frequency;
		this.updateHarmonicsVolume(osc, harmonicsVolume);

		osc.connect(this.compressorNode);

		osc.start();

		this.frequencyToOscillatorMap.set(frequency, osc);
		return true;
	} else {
		log.e('already started');
		return false;
	}
}

audio_controller.stop = function(){
	if (this.setup) {
		for (var [freq, osc] of this.frequencyToOscillatorMap.entries()) {
	  		this.stopNote(freq);
		}
	}
}

audio_controller.stopNote = function(frequency) {
	if(this.frequencyToOscillatorMap.has(frequency)){
		let osc = this.frequencyToOscillatorMap.get(frequency);
		osc.stop(0.00001);
		this.frequencyToOscillatorMap.delete(frequency);
	}
}

audio_controller.updateVolume = function(volume_percent){
	if (this.setup) {
		this.masterGainNode.gain.value = volume_percent / 100;
	}
}

audio_controller.updateHarmonicsVolumes = function(harmonicsVolume){
	if (this.setup) {
		for (var [freq, osc] of this.frequencyToOscillatorMap.entries()) {
  			this.updateHarmonicsVolume(osc, harmonicsVolume);
		}
	}
}

audio_controller.updateHarmonicsVolume = function(osc, harmonicsVolume){
	var real = new Float32Array(harmonicsVolume.length+1);
	var imag = new Float32Array(harmonicsVolume.length+1);
	real[0] = 0;
	imag[0] = 0;
	var i;
	for(i=0; i<harmonicsVolume.length; i++){
		real[i+1] = harmonicsVolume[i];
		imag[i+1] = 0;
	}
	var wave = this.ctx.createPeriodicWave(real, imag, {disableNormalization: true});
	osc.setPeriodicWave(wave);	
}
