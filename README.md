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







## Usage

You have to create an instance of the JSBrick class - this way is it's possible to connect multiple Sbricks at the same time. A lot of methods return a [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises).

### Connecting with the SBrick

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
	
### Disconnecting
```javascript
mySBrick.disconnect()
    .then( ()=> {
        // the SBrick is now disconnected
    } );
```
 
### Check if the SBrick is connected
```javascript
let isConnected = mySBrick.isConnected(); // returns true or false
```

## Port numbering

When you want to send data to or receive data from the SBrick, you'll need to specify which of the ports you want to target. The SBrick's ports are numbered 0-3, like shown below. To make things easier, every JSBrick instance has constants for the ports's ids: `mySBrick.TOPLEFT`, `mySBrick.TOPRIGHT`, `mySBrick.BOTTOMLEFT`, `mySBrick.BOTTOMRIGHT`.
```
          TOP    TOP
          LEFT 0 RIGHT 2
┌────────┐─────────────┐
|        |             |
|        └──────┐────────────────┐
|               | BOTTOM  BOTTOM |
|               | LEFT 1  RIGHT 3|
|               |                |
└───────────────┘────────────────┘
```

## Controlling motors and lights

The easiest way to send commands to the SBrick and to receive sensor data, is by using JSBrick's dedicated methods for each type of Lego device (drive motor, servo motor, lights, tilt sensor, motion sensor). (Note that you can attach multiple Lego devices to one port - the dedicated methods only work as expected on a port, as long as you only have one type of device on the port. If you have different devices, use the more generic `drive` method instead.)

JSBrick has a few constants to make things easier to remember:  
``mySBrick.CW`` for clockwise direction
``mySBrick.CCW`` for counterclockwise direction

### Lights

```javascript
let data = {
    portId: mySBrick.TOPLEFT,
    power: 100// 0-100
};
mySBrick.setLights(data);
```

Returns a `promise` that returns object `{portId, direction, power (0-255!), mode}`. (This is the promise `sbrick.drive` returns)

### Drive motor

```javascript
let data = {
    portId: mySBrick.TOPLEFT,
    power: 100,// 0-100
    direction: mySBrick.CW
};
mySBrick.setDrive(data);
```

Returns a `promise` that returns object `{portId, direction, power (0-255!), mode}`. (This is the promise `sbrick.drive` returns)

### Servo motor

```javascript
let data = {
    portId: mySBrick.TOPLEFT,
    angle: 45,// 0-90
    direction: mySBrick.CW
};
mySBrick.setServo(data);
```

Returns a `promise` that returns object `{portId, direction, power (0-255!), mode}`. (This is the promise `sbrick.drive` returns)

Be aware that the Lego's servo motors only allow 7 angles per 90°. These angles are in increments of approximately 13°, i.e. 13, 26, 39, 52, 65, 78, 90. `setServo` calculates the supported angle that's closest to the value of `data`'s `angle`-property

All of these drive methods return an object with the new settings.


### Stop a specific port

Pass either one port or an array of ports
```javascript
	mySBrick.stop( mySBrick.TOPLEFT ); // stops top left port
	mySBrick.stop( [mySBrick.TOPLEFT, mySBrick.BOTTOMLEFT] ); // stops top left and bottom left ports
```
	
### Stop all ports at once.

```javascript
	mySBrick.stopAll();
```


## Start retrieving sensor values

For both the tilt and motion sensor:

```javascript
const portId = mySBrick.TOPLEFT;
mySbrick.startSensor(portId);
```

returns promise that returns `undefined`

This will start a stream of sensor measurements. For every new measurement, a `sensorchange.jsbrick` event is dispatched on the body. You can track these values like this:

```javascript
body.addEventListener('sensorchange.jsbrick', (e) => {
    const sensorData = e.detail;
    const sensorType = sensorData.type;// tilt | motion
    const sensorInterpration = mySBrick.getSensorState(sensorData.value, sensorType);
    console.log(sensorInterpretation);
});
```

The `sensorInterpretation` is depending on the type of sensor. Possible values:  
For the tilt sensor: `up`, `right`, `flat`, `down`, `left`.  
For the motion sensor: `close`, `midrange`, `clear`.  
_(it would be better to include the sensorInterpretation in the sensorchange event. It's on my to do list :))_

## Stop retrieving sensor values

For both the tilt and motion sensor:

```javascript
const portId = mySBrick.TOPLEFT;
mySbrick.stopSensor(portId);
```



Note that under the hood, the SBrick uses one single command to send data to the ports. You can send this command using JSBrick's `drive` method. To retrieve a single value from a sensor, however, JSBrick also has some convenience functions 


There is also another command that controls all types, _quick drive_, which supposedly has lower latency.)


## Additional events

JSBrick sends several events that other scripts can listen to. All of these events are namespaced with `.jsbrick` and are triggerd on the `document.body`.
Scripts can listen for them like this:
```javascript
body.addEventListener('eventname.jsbrick', (e) => {
	// do stuff with the event here
});
```

### sensorstart.jsbrick

Triggered when a stream of sensor measurements is started
data sent with `event.detail`: `{portId}`

### sensorstop.jsbrick

Triggered when a stream of sensor measurements is stopped
data sent with `event.detail`: `{portId}`

### sensorchange.jsbrick

Triggered when a port's sensor's state changes. (Sensors return a value; a range of values corresponds with an state.) States depend on the type of sensor.

data sent with `event.detail`: `{type, voltage, ch0_raw, ch1_raw, value, state}`

Possible `state` values for motion sensor:
`close`: the sensor is within a few centimeters of an object;
`midrange`: the sensor is within ca. 5-15 centimeters of an object;
`clear`: there is no object within ca 15 centimeters of the sensor

Possible `state` values for tilt sensor:
`flat`, `up`, `down`, `left`, `right`

### sensorvaluechange.jsbrick

Triggered when the value of a port's sensor changes. The sensors aren't very accurate, so most of the time you'll want to use the `sensorchange.jsbrick` event instead. May come in usefull for the motion sensor. 



## Getting basic SBrick Information

Apart from communicating with the SBrick's four ports, you can also get some info about the SBrick itself.

```javascript
// Get battery percentage
mySBrick.getBattery()
    .then( percentage => {
        console.log(percentage + '%');
    } );

// Get temperature in celsius or fahrenheit
let fahrenheit = false; // default is false: °C
mySBrick.getTemp(fahrenheit)
    .then( temp => {
        console.log(temp + fahrenheit ? ' °F' : ' °C');
    });
    
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


** README IS STILL IN PROGRESS - STUFF BELOW THIS LINE ISN'T EDITED YET **
---------------------



	
Sending a command is pretty easy and some constants will help the process:

	mySBrick.CHANNEL0-3 // Channels 0 to 3
	mySBrick.CW-CCW     // Clockwise and Counterclockwise
	mySBrick.MIN        // Minimum power
	mySBrick.MAX	   // Maximum power for Drive (255)




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














## Lower level information

If you want to dive deeper into the communication
https://social.sbrick.com/wiki/view/pageId/11/slug/the-sbrick-ble-protocol

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

