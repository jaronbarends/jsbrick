(() => {

	var finalTranscript = '';
	var isRecording = false;
	var ignoreOnend;
	var startTimestamp;
	var recognition;
	var startButton = document.getElementById('start_button');
	var startImg = document.getElementById('start_img');
	var finalSpan = document.getElementById('final_span');
	var interimSpan = document.getElementById('interim_span');
	var info = document.getElementById('info');
	var mySBrick;


	/**
	* 
	* @returns {undefined}
	*/
	var initRecognition = function() {
		startButton.style.display = 'inline-block';
		var recognition = new webkitSpeechRecognition();

		// recognition.continuous = true;// when set to true, accepts multiple results - Does not seem to work well on Android
		recognition.interimResults = true;
		recognition.lang = 'en-US';
		// recognition.lang = 'nl-NL';



		recognition.onstart = function() {
			isRecording = true;
			startImg.src = 'img/mic-animate.gif';
		};



		recognition.onerror = function(event) {
			if (event.error === 'no-speech') {
				startImg.src = 'img/mic.gif';
				showInfo('info_no_speech');
				ignoreOnend = true;
			}
			if (event.error === 'audio-capture') {
				startImg.src = 'img/mic.gif';
				showInfo('info_no_microphone');
				ignoreOnend = true;
			}
			if (event.error === 'not-allowed') {
				if (event.timeStamp - startTimestamp < 100) {
					showInfo('info_blocked');
				} else {
					showInfo('info_denied');
				}
				ignoreOnend = true;
			}
		};



		recognition.onend = function() {
			isRecording = false;
			if (ignoreOnend) {
				return;
			}
			startImg.src = 'img/mic.gif';
			if (!finalTranscript) {
				showInfo('info_start');
				return;
			}
		};


		recognition.onresult = function(event) {
			var interimTranscript = '';

			// error checking
			if (typeof(event.results) === 'undefined') {
				recognition.onend = null;
				recognition.stop();
				showNotSupportedMessage();
				return;
			}

			for (var i = event.resultIndex; i < event.results.length; ++i) {
				if (event.results[i].isFinal) {
					finalTranscript += event.results[i][0].transcript;
				} else {
					interimTranscript += event.results[i][0].transcript;
				}
			}

			finalSpan.innerHTML = finalTranscript;
			interimSpan.innerHTML = interimTranscript;
			if (finalTranscript || interimTranscript) {
				// there is a result - but we may not done be yet

				let eventName,
					eventData;
				if (finalTranscript) {
					eventName = 'final.speech';
					eventData = {
						command: finalTranscript,
						recognition: recognition
					};
				} else {
					eventName = 'interim.speech';
					eventData = {
						command: interimTranscript,
						recognition: recognition
					};
				}
				const event = new CustomEvent(eventName, {detail: eventData});
				document.body.dispatchEvent(event);
			}

		};

		return recognition;
	};

	function showNotSupportedMessage() {
		alert('Sorry, your browser does not support all functionality we need. Please update your browser');
	}


	function startHandler(event) {
		if (isRecording) {
			recognition.stop();
			return;
		}
		finalTranscript = '';

		recognition.start();
		ignoreOnend = false;
		finalSpan.innerHTML = '';
		interimSpan.innerHTML = '';
		startImg.src = 'img/mic-slash.gif';
		startTimestamp = event.timeStamp;
	}


	// show info div with content defined by id
	function showInfo(id) {
		if (id) {
			for (var child = info.firstChild; child; child = child.nextSibling) {
				if (child.style) {
					child.style.display = child.id == id ? 'inline' : 'none';
				}
			}
			info.style.visibility = 'visible';
		} else {
			info.style.visibility = 'hidden';
		}
	}


	/**
	* add logging for all kind of events
	* @returns {undefined}
	*/
	// BEWARE: ADDING THESE EVENTS OVERRIDES THE PREVIOUS EVENTHANDLERS
	// WHICH ARE PRETTY IMPORTANT FOR, LIKE, onstart, onresult AND onend...
	var addEventLogging = function() {
		var eventsToLog = [
			'onaudiostart',
			'onaudioend',
			'onsoundstart',
			'onsoundend',
			'onspeechstart',
			'onspeechend',
			// 'onstart',
			// 'onend',
			// 'onerror',
			'onnomatch',
			// 'onresult'
		];

		eventsToLog.forEach((eventName) => {
			recognition[eventName] = function(e) {
				console.log(eventName);
			};
		});
	};



	/**
	* initialize all
	* @returns {undefined}
	*/
	var init = function() {
		if (!('webkitSpeechRecognition' in window)) {
			showNotSupportedMessage();
		} else {
			// speech recognition requires a webserver - make sure we're on one
			if (window.location.href.indexOf('http') !== 0) {
				console.error('Speech recognition only works when run on a webserver');
				return;
			}
			recognition = initRecognition();
			startButton.addEventListener('click', startHandler);
		}

		// addEventLogging();

	};

	// kick of the script when all dom content has loaded
	document.addEventListener('DOMContentLoaded', init);

})();