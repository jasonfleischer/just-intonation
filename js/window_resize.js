var window_resize_start_event_occured = false;
var resized_timer;
window.onresize = function(){
	clearTimeout(resized_timer);
	resized_timer = setTimeout(window_resized_end, 200);
	if(!window_resize_start_event_occured) {
		window_resized_start();
		window_resize_start_event_occured = true;
	}
};

function window_resized_start(){
	dismissInfo();	
}

function window_resized_end(){

	window_resize_start_event_occured = false;
	let contentWidth = document.body.clientWidth;
	
	audio_controller.stop();
	updateUIFrequencyTable();
	pianoView.removeCanvases();
	pianoView.removeOnClick();

	var range;
	var width;
	if( window.innerWidth <= 550){
		range = {min:48, max: 60};
		width = 340;
	}else if(window.innerWidth > 550 && window.innerWidth < 750) {
		range = {min:48, max: 72}
		width = 720;
	} else {
		range = musicKit.piano_range;
		width = 1000;
	}
	let pianoPaddingLeftRight = 30;
	pianoView = buildPianoView(range, Math.min(contentWidth-pianoPaddingLeftRight, width));
}