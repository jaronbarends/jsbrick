/*
* specific helper functions for sbrick
*/
(() => {

	// (optional) tell jshint about globals (they should remain commented out)
	/* globals SBrick */ //Tell jshint someGlobalVar exists as global var
		

	const PORTS = {
		PORT_TOP_LEFT: 0,
		PORT_BOTTOM_LEFT: 1,
		PORT_TOP_RIGHT: 2,
		PORT_BOTTOM_RIGHT: 3
	};

	/**
	* servo motor only supports 7 angles per 90 degrees
	* and these angles do not correspond linearly with power values
	* for every supported angle:
	*	angle: the angle in degrees
	*	powerMin: the minimum power value that rotates the servo motor to this angle
	*	powerMax: the maximum power value that rotates the servo motor to this angle
	*	power: a value somewhere between min and max, so we're sure we're in the right range
	*/
	const powerAngles = [
		{ angle: 0, power: 0, powerMin: 0, powerMax: 0},
		{ angle: 13, power: 10, powerMin: 1, powerMax: 19},
		{ angle: 26, power: 40, powerMin: 20, powerMax: 52},
		{ angle: 39, power: 70, powerMin: 53, powerMax: 83},
		{ angle: 52, power: 100, powerMin: 84, powerMax: 116},
		{ angle: 65, power: 130, powerMin: 117, powerMax: 145},
		{ angle: 78, power: 160, powerMin: 146, powerMax: 179},
		{ angle: 90, power: 200, powerMin: 180, powerMax: 255}
	];

	const MIN_VALUE_BELOW_WHICH_MOTOR_DOES_NOT_WORK = 98;// somehow, motor does not seem to work for power values < 98


	/**
	* translate servo's angle to corresponding power-value
	* @param {number} angle - The angle of the servo motor
	* @returns {number} The corresponding power value
	*/
	const servoAngleToPower = function(angle) {
		let power = 0;
		angle = parseInt(angle, 10);
		for (let i=0, len=powerAngles.length; i<len; i++) {
			const obj = powerAngles[i];
			if (angle === obj.angle) {
				power = obj.power;
				break;
			}
		}

		return power;
	};


	/**
	* translate servo's power to corresponding angle-value
	* @param {number} power - The current power of the servo motor
	* @returns {number} The corresponding angle value
	*/
	const servoPowerToAngle = function(power) {
		let angle = 0;
		power = parseInt(power, 10);
		for (let i=0, len=powerAngles.length; i<len; i++) {
			const obj = powerAngles[i];
			if (power === obj.power) {
				angle = obj.angle;
				break;
			}
		}

		return angle;
	};


	/**
	* drive motor does not seem to work below certain power threshold value
	* translate the requested percentage to the actual working power range
	* @param {number} powerPerc - The requested power as percentage
	* @returns {number}	- A value within the acutal power range
	*/
	const drivePercentageToPower = function(powerPerc) {
		let power = 0;
		if (powerPerc !== 0) {
			// define the power range within which the drive does work
			const powerRange = mySBrick.MAX - MIN_VALUE_BELOW_WHICH_MOTOR_DOES_NOT_WORK;
			power = Math.round(powerRange * powerPerc/100 + MIN_VALUE_BELOW_WHICH_MOTOR_DOES_NOT_WORK);
		}

		return power;
	};


	/**
	* drive motor does not seem to work below certain power threshold value
	* translate the actual power in the percentage within the actual working power range
	* @returns {number} - The percentage within the actual power range
	*/
	const drivePowerToPercentage = function(power) {
		// define the power range within which the drive does work
		let powerPerc = 0;
		if (power !== 0) {
			const powerRange = mySBrick.MAX - MIN_VALUE_BELOW_WHICH_MOTOR_DOES_NOT_WORK,
				relativePower = power - MIN_VALUE_BELOW_WHICH_MOTOR_DOES_NOT_WORK;
			powerPerc = Math.round(100 * relativePower / powerRange);
		}

		return powerPerc;
	};
	
	


	/**
	* check if a value is between two other values
	* @returns {undefined}
	*/
	const isValueBetween = function(value, compare1, compare2) {
		const min = (compare1 <= compare2) ? compare1 : compare2,
			max = (compare1 > compare2) ? compare1 : compare2;

		return (value >= min && value <= max);
	};
	
	


	/**
	* get the type of sensor (tilt, motion) by channel value
	* @returns {undefined}
	*/
	const getSensorType = function(ch0Value) {
		let sensorType = 'unknown';
		if (isValueBetween(ch0Value, 48, 52)) {
			sensorType = 'tilt';
		} if (isValueBetween(ch0Value, 105, 110)) {
			sensorType = 'motion';
		}

		return sensorType;
	};


	/**
	* get interpretation for a sensor value
	* @returns {undefined}
	*/
	const getSensorInterpretation = function(value, sensorType) {
		let interpretation = 'unknown';

		if (sensorType === 'motion') {

			if (value <= 60) {
				interpretation = 'close';
			} else if (isValueBetween(value, 61, 109)) {
				interpretation = 'nearing';
			} else if (value >= 110) {
				interpretation = 'clear';
			}

		} else if (sensorType === 'tilt') {

			if (isValueBetween(value, 14, 18)) {
				interpretation = 'up';
			} else if (isValueBetween(value, 51, 55)) {
				interpretation = 'right';
			} else if (isValueBetween(value, 95, 100)) {
				interpretation = 'flat';
			} else if (isValueBetween(value, 143, 148)) {
				interpretation = 'down';
			} else if (isValueBetween(value, 191, 196)) {
				interpretation = 'left';
			}

		}

		return interpretation;
	};
	
	


	// now make functions available to outside world
	window.sbrickUtil = {
		PORTS,
		drivePercentageToPower,
		drivePowerToPercentage,
		servoAngleToPower,
		servoPowerToAngle,
		getSensorType,
		getSensorInterpretation
	};


})();