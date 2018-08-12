# jsBrick

JavaScript library to control SBrick (a [Lego® Power Functions](https://www.lego.com/en-us/powerfunctions) compatible Bluetooth controller) through [Web Bluetooth APIs](https://www.w3.org/community/web-bluetooth/).

This is an adapted version of [sbrick.js](https://github.com/360fun/sbrick.js). Among other things, this version includes some convenience methods that make it easier to control motors, lights and sensors.

## Requirements

Check your [browser and platform implementation status](https://github.com/WebBluetoothCG/web-bluetooth/blob/gh-pages/implementation-status.md) first.

* Requires bluetooth.js and promise-queue library
* [bluetooth.js](https://github.com/360fun/bluetooth.js) Generic library to simplify the use of the Web BLuetooth APIs.
* [promise-queue](https://github.com/azproduction/promise-queue) Promise-based Queue library, since ECMAScript 6 doesn't implement one by itself.

You must have a SBrick or SBrick Plus in order to use this library with your Lego® creations.

If you want to be able to develop locally on a machine that doesn't support the web bluetooth api, also include a dummy bluetooth api:
* https://github.com/jaronbarends/bluetooth-dummy-js

### Supported SBrick Firmware
The currently supported firmware is 4.17+, so upgrade your SBrick to be compatible with the [SBrick protocol 17](https://social.sbrick.com/wiki/view/pageId/11/slug/the-sbrick-ble-protocol).


## Getting started

Include required scripts
```html
<script src="promise-queue.js"></script>
<script src="bluetooth.js"></script>
<script src="bluetooth-dummy.js"></script>
<script src="jsbrick.js"></script>
```



### Usage

You have to create an instance of the JSBrick class - this way is possible to connect multiple Sbricks at the same time. A lot of methods return a [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises).

#### Connecting with the SBrick

```javascript
let mySBrick = new JSBrick(); // create a new SBrick object
mySBrick.connect() // open a popup showing all the BLE devices nearby
    .then( () => {
        // the SBrick is now connected
    } );
```

This will list all nearby BLE devices, where you can select the SBrick you want to connect.

If you want to filter the BLE devices by a given string, pass it to the constructor:

```javascript
let mySBrick2 = new JSBrick('SBrick');
mySBrick2.connect() // show only the devices with "SBrick" in their name (e.g. also "SBrick1")
    .then( () => {
        // the SBrick is now connected
    } );
```
	
#### Disconnecting
```javascript
mySBrick.disconnect()
    .then( ()=> {
        // the SBrick is now disconnected
    } );
```
 
#### Check if the SBrick is connected:
```javascript
let isConnected = mySBrick.isConnected(); // returns true or false
```

#### Get basic SBrick Information

```javascript
mySBrick.getModelNumber().then( model => {
    console.log(model);
});

mySBrick.getFirmwareVersion().then( version => {
    console.log(version);
});

mySBrick.getHardwareVersion().then( version => {
    console.log(version);
});

mySBrick.getSoftwareVersion().then( version => {
    console.log(version);
});

mySBrick.getManufacturerName().then( name => {
    console.log(name);
});
```
	
Sending a command is pretty easy and some constants will help the process:

	mySBrick.CHANNEL0-3 // Channels 0 to 3
	mySBrick.CW-CCW     // Clockwise and Counterclockwise
	mySBrick.MIN        // Minimum power
	mySBrick.MAX	   // Maximum power for Drive (255)


Get the Battery voltage:

	mySBrick.getBattery()
	.then( battery => {
		alert( battery + '%' );
	} );


Get the SBrick internal Temperature:

	let fahrenheit = true-false; // default is false: C°
	mySBrick.getTemp(fahrenheit)
	.then( temp => {
		alert( temp + fahrenheit ? ' F°' : ' C°' );
	});

Get sensor data (SBrick Plus only!) - [work in progress](https://social.sbrick.com/forums/topic/511/-/view/post_id/5125):

	mySBrick.getSensor(mySBrick.PORT0)
	.then( data => {
		console.log( data );
	});
	
To send a Drive command is pretty easy, are just needed: channel, direction and power.
For example, the Channel 0 (supposedly a motor) drives in clockwise direction at the maximum (255) speed:

	mySBrick.drive( mySBrick.CHANNEL0, mySBrick.CW, mySBrick.MAX );
	
QuickDrive permits to send up to 4 Drive commands at the same instant, without any delay between the channels.
It accepts an Array of Objects (1 to 4) or a single Object (but better use Drive in that case).
In the following example Channel 0 and 1 start to drive both in clockwise direction at the max speed:

	mySBrick.quickDrive( [
		{ channel: mySBrick.CHANNEL0, direction: mySBrick.CW, power: mySBrick.MAX }
		{ channel: mySBrick.CHANNEL1, direction: mySBrick.CW, power: mySBrick.MAX }
	] );
	
Stop a specific Channel.
	
	mySBrick.stop( SBrick.CHANNEL0 ); //stops Channel 0
	
Stop all Channels at once.
	
	mySBrick.stopAll();



















## Additional public methods

### `setLights(data)`

Method for controlling lights. This is actually a convenience wrapper around `sbrick.drive`.

```
const data = {
    portId: mySBrick.TOPLEFT,
    power: 100// number 0-100
};
mySBrick.setLights(data);
```

Returns promise returning object `{portId, direction, power (0-255!), mode}`. (This is the promise `sbrick.drive` returns)

### `setDrive(data)`

Method for controlling a drive motor. This is actually a convenience wrapper around `sbrick.drive`.

```
const data = {
    portId: mySBrick.TOPLEFT,
    power: 100,// number 0-100
    direction: mySBrick.CCW
};
mySBrick.setDrive(data);
```

Returns promise returning object `{portId, direction, power (0-255!), mode}`. (This is the promise `sbrick.drive` returns)

### `setServo(data)`

Method for controlling a servo motor. This is actually a convenience wrapper around `sbrick.drive`.

```
const data = {
    portId: mySBrick.TOPLEFT,
    angle: 90,// number 0-90
    direction: mySBrick.CCW
};
mySBrick.setServo(data);
```

Returns promise returning object `{portId, direction, power (0-255!), mode}`. (This is the promise `sbrick.drive` returns)

Be aware that the Power Functions servo motors only allow 7 angles per 90°. These angles are in increments of approximately 13°, i.e. 13, 26, 39, 52, 65, 78, 90. `setServo` calculates the supported angle that's closest to the value of `data`'s `angle`-property


### `startSensor(portId)`

Starts a stream of sensor measurements and sends events when the sensor's value or the state (corresponding to a range of values) changes.

```
mySBrick.startSensor(mySBrick.TOPLEFT);
```

returns promise returning `undefined`

### `stopSensor(portId)`

Stop a stream of sensor measurements.

```
mySBrick.stopSensor(mySBrick.TOPLEFT);
```

returns `undefined`

## Additional events

### sensorstart.sbrick

Triggered on `document.body` when a stream of sensor measurements is started
data sent with `event.detail`: `{portId}`

### sensorstop.sbrick

Triggered on `document.body` when a stream of sensor measurements is stopped
data sent with `event.detail`: `{portId}`

### sensorchange.sbrick

Triggered when a port's sensor's state changes. (Sensors return a value; a range of values corresponds with an state.) States depend on the type of sensor.

data sent with `event.detail`: `{type, voltage, ch0_raw, ch1_raw, value, state}`

Possible `state` values for motion sensor:
`close`: the sensor is within a few centimeters of an object;
`midrange`: the sensor is within ca. 5-15 centimeters of an object;
`clear`: there is no object within ca 15 centimeters of the sensor

Possible `state` values for tilt sensor:
`flat`, `up`, `down`, `left`, `right`

### sensorvaluechange.sbrick

Triggered when the value of a port's sensor changes. The sensors aren't very accurate, so most of the time you'll want to use the `sensorchange.sbrick` event instead. May come in usefull for the motion sensor. 


## Lower level information

If you want to dive deeper into the communication

### Services
Device information - 180a
* Model number string
* Firmware revision string
* Hardware revision string
* Software revision string
* Manufacturer string

Remote control service - 4dc591b0-857c-41de-b5f1-15abda665b0c (**partially implemented**)
* 00 Break
* 01 Drive
* 0F Query ADC (Temperature, Battery voltage + Sensor measurements on Sbrick Plus)
* 2C PVM (Periodic Voltage Measurements on SBrick Plus)

Quick Drive - 489a6ae0-c1ab-4c9c-bdb2-11d373c1b7fb

OTA service - 1d14d6ee-fd63-4fa1-bfa4-8f47b42119f0 (**NOT implemented**)


## Authors

* **Jarón Barends** - *Initial work* - [jaronbarends](https://github.com/jaronbarends)

See also the list of [contributors](https://github.com/jaronbarends/your-project/graphs/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

