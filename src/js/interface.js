/*
* General file for setting up the interface
* and the connection with the SBrick
*/
(() => {

	// (optional) tell jshint about globals (they should remain commented out)
	/* globals JSBrick */ //Tell jshint JSBrick exists as global var

	const SBRICKNAME = 'SBrick';

	let body = document.body,
		connectScreen,
		connectBtn,
		disconnectBtn,
		controlPanel,
		mySBrick;



	/**
	* set the page to busy state
	* @returns {undefined}
	*/
	const setPageBusy = function() {
		body.classList.add('page--is-busy');
	};


	/**
	* set the page to busy state
	* @returns {undefined}
	*/
	const setPageIdle = function() {
		body.classList.remove('page--is-busy');
	};


	/**
	* set the page to busy state
	* @returns {undefined}
	*/
	const setConnectScreenBusy = function() {
		connectScreen.classList.add('connect-screen--is-busy');
	};


	/**
	* set the page to busy state
	* @returns {undefined}
	*/
	const setConnectScreenIdle = function() {
		connectScreen.classList.remove('connect-screen--is-busy');
	};




	/**
	* connect the sbrick
	* @returns {undefined}
	*/
	var connectSBrick = function() {
		setPageBusy();
		setConnectScreenBusy();
		mySBrick.connect(SBRICKNAME)
		.then( (value) => {
			// SBrick now is connected
			setPageIdle();
			setConnectScreenIdle();
			updateConnectionState();
		} )
		.catch( (e) => {
			setPageIdle();
			setConnectScreenIdle();
			window.util.log('Caught error in SBrick.connect: ' + e);
			updateConnectionState();
		});
	};


	/**
	* disconnect the sbrick
	* @returns {undefined}
	*/
	var disconnectSBrick = function() {
		setPageBusy();
		mySBrick.disconnect(SBRICKNAME)
		.then( (value) => {
			// SBrick now is disconnected
			setPageIdle();
			setConnectScreenIdle();
			updateConnectionState();
		} )
		.catch( (e) => {
			// something went wrong
			setPageIdle();
			setConnectScreenIdle();
			window.util.log('Caught error in SBrick.disconnect: ' + e);
			updateConnectionState();
		});
	};
	


	/**
	* update the connect button and control panel
	* @returns {undefined}
	*/
	const updateConnectionState = function() {
		if (mySBrick.isConnected()) {
			// connectBtn.classList.remove('btn--is-busy', 'btn--start');
			// connectBtn.classList.add('btn--stop');
			// connectBtn.innerHTML = 'Disconnect';
			connectScreen.classList.remove('is-busy');
			connectScreen.classList.add('is-hidden');
			controlPanel.classList.remove('is-hidden');
		} else {
			// disconnected
			// connectBtn.classList.remove('btn--is-busy', 'btn--stop');
			// connectBtn.classList.add('btn--start');
			// connectBtn.innerHTML = 'Connect';
			connectScreen.classList.add('is-busy');
			connectScreen.classList.remove('is-hidden');
			// connectBtn.classList.remove('is-hidden');
			controlPanel.classList.add('is-hidden');
		}
	};
	
	


	/**
	* connect or disconnect the SBrick
	* @returns {undefined}
	*/
	const connectHandler = function() {
		// connectBtn.classList.add('btn--is-busy');
		connectSBrick();
	};



	/**
	* connect or disconnect the SBrick
	* @returns {undefined}
	*/
	const disconnectHandler = function() {
		// connectBtn.classList.add('btn--is-busy');
		disconnectSBrick();
	};
	


	/**
	* make the app run in dummy mode - webbluetooth calls will be handled by dummy code that always resolves the call
	* @returns {undefined}
	*/
	const enableDummyMode = function() {
		mySBrick.webbluetooth = new WebBluetoothDummy();
		mySBrick.getFirmwareVersion = function() {
			return new Promise( (resolve, reject) => {
				resolve(4.17);
			});
		};
		window.util.log = console.log;
	};
	


	/**
	* check if we want to run in dummy-mode
	* that's meant for developing when you do not need to have an actual bluetooth device
	* @returns {undefined}
	*/
	const checkDummyMode = function() {
		// check if we're on http (and not on localhost); if so, use the real webbluetooth api
		// otherwise, talk against the dummy
		const url = window.location.href;
		if (url.indexOf('http') !== 0 || url.indexOf('localhost') > -1) {
			enableDummyMode();
			console.warn('NOTE: Using bluetooth-dummy mode');
		}
	};

	

	/**
	* initialize all functionality
	* @param {string} varname - Description
	* @returns {undefined}
	*/
	const init = function() {
		// window.mySBrick = window.mySBrick || new SBrickExtended();
		window.mySBrick = window.mySBrick || new JSBrick();
		mySBrick = window.mySBrick;
		connectScreen = document.getElementById('connect-screen');
		connectBtn = document.getElementById('connect-btn');
		disconnectBtn = document.getElementById('disconnect-btn');
		controlPanel = document.getElementById('controlPanel');

		checkDummyMode();

		// Connect to SBrick via bluetooth.
		// Per the specs, this has to be done IN RESPONSE TO A USER ACTION
		connectBtn.addEventListener('click', connectHandler);
		disconnectBtn.addEventListener('click', disconnectHandler);
	};

	// kick of the script when all dom content has loaded
	document.addEventListener('DOMContentLoaded', init);

})();
