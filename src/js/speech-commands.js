(() => {

	// (optional) tell jshint about globals (they should remain commented out)
	/* globals SBrick */ //Tell jshint someGlobalVar exists as global var

	let body = document.body,
		lastInterimMatch = "",// last interim result that matched a command
		mySBrick,
		commands = [];


	/**
	* 
	* @returns {undefined}
	*/
	const startDrive = function() {
		let data = {
			portId: 1,
			power: 255,
			direction: 0
		};
		mySBrick.drive(data);
	};


	/**
	* 
	* @returns {undefined}
	*/
	const stopDrive = function() {
		let data = {
			portId: 1,
			power: 0,
			direction: 0
		};
		mySBrick.drive(data);
	};


	/**
	* 
	* @returns {undefined}
	*/
	const lightsOn = function() {
		let data = {
			portId: 0,
			power: 255
		};
		mySBrick.drive(data);
	};


	/**
	* 
	* @returns {undefined}
	*/
	const lightsOff = function() {
		let data = {
			portId: 0,
			power: 0
		};
		mySBrick.drive(data);
	};
	
	
	


	/**
	* handle a speech command
	* @returns {undefined}
	*/
	const speechcommandHandler = function(e) {
		let command = e.detail.command,
			commandFound = false,
			executeCommand = false;

		// loop through defined commands, and check if we've got a match
		// we'll check interim results as they come in, and abort recognition as soon as we have a match
		commands.forEach((cmdObj) => {
			if (cmdObj.command === command) {
				cmdObj.fn();
				e.detail.recognition.abort();
			}
		});
		
	};
	


	/**
	* add listeners for sbrick events
	* @returns {undefined}
	*/
	const addSpeechCommandListeners = function() {
		body.addEventListener('interim.speech', speechcommandHandler);
		body.addEventListener('final.speech', speechcommandHandler);
	};


	/**
	* define speech commands
	* @returns {undefined}
	*/
	const defineCommands = function() {
		commands = [
			{ command: 'start motor', fn: startDrive },
			{ command: 'stop motor', fn: stopDrive },
			{ command: 'lights on', fn: lightsOn },
			{ command: 'lights off', fn: lightsOff }
		];
	};
	



	/**
	* initialize all functionality
	* @param {string} varname - Description
	* @returns {undefined}
	*/
	const init = function() {
		window.mySBrick = window.mySBrick || new SBrickExtended();
		mySBrick = window.mySBrick;// local var
		defineCommands();
		addSpeechCommandListeners();
	};



	// kick of the script when all dom content has loaded
	document.addEventListener('DOMContentLoaded', init);

})();
