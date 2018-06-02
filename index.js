var Service, Characteristic;
var request = require("request");

module.exports = function(homebridge){
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-rootedtoon", "RootedToon", RootedToon);
};

class RootedToon{
	constructor(log,config){
	this.log = log;
	this.name = config.name;
        this.apiroute = config.apiroute || "localhost";
	this.maxTemp = config.maxTemp || 26;
	this.minTemp = config.minTemp || 10;
	this.manufacturer = config.manufacturer || "Eneco";
	this.model = config.model || "RootedToon";
	this.serial_number = config.serial_number || "XXX.XXX.XXX.XXX";

	this.log(this.name, this.apiroute);

	//Characteristic.TemperatureDisplayUnits.CELSIUS = 0;
	//Characteristic.TemperatureDisplayUnits.FAHRENHEIT = 1;
	this.temperatureDisplayUnits = Characteristic.TemperatureDisplayUnits.CELSIUS;
	this.currentTemperature = 19;
	this.currentRelativeHumidity = 0;
	// The value property of CurrentHeatingCoolingState must be one of the following:
	//Characteristic.CurrentHeatingCoolingState.OFF = 0;
	//Characteristic.CurrentHeatingCoolingState.HEAT = 1;
	//Characteristic.CurrentHeatingCoolingState.COOL = 2;
	this.heatingCoolingState = Characteristic.CurrentHeatingCoolingState.OFF;
	this.targetTemperature = 21;
	this.targetRelativeHumidity = 0;
	this.heatingThresholdTemperature = 22;
	this.coolingThresholdTemperature = 16;
	// The value property of TargetHeatingCoolingState must be one of the following:
	//Characteristic.TargetHeatingCoolingState.OFF = 0;
	//Characteristic.TargetHeatingCoolingState.HEAT = 1;
	//Characteristic.TargetHeatingCoolingState.COOL = 2;
	//Characteristic.TargetHeatingCoolingState.AUTO = 3;
	this.targetHeatingCoolingState = Characteristic.TargetHeatingCoolingState.AUTO;
	this.service = new Service.Thermostat(this.name);
	}

	getServices() {

            const informationService = new Service.AccessoryInformation()
                .setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
                .setCharacteristic(Characteristic.Model, this.model)
                .setCharacteristic(Characteristic.SerialNumber, this.serial_number)

	    this.service
		.getCharacteristic(Characteristic.CurrentHeatingCoolingState)
		.on('get', this.getCurrentHeatingCoolingState.bind(this));

	   this.service
		.getCharacteristic(Characteristic.TargetHeatingCoolingState)
		.on('get', this.getTargetHeatingCoolingState.bind(this))
		.on('set', this.setTargetHeatingCoolingState.bind(this));

	    this.service
                .getCharacteristic(Characteristic.CurrentTemperature)
		.setProps({
			minValue: this.minTemp,
			maxValue: this.maxTemp,
			minStep: 0.1
		})
		.on('get', this.getCurrentTemperature.bind(this));

	    this.service
		.getCharacteristic(Characteristic.TargetTemperature)
		.setProps({
                        minValue: this.minTemp,
                        maxValue: this.maxTemp,
                        minStep: 0.1
                })
		.on('get', this.getTargetTemperature.bind(this))
		.on('set', this.setTargetTemperature.bind(this));

	    this.service
		.getCharacteristic(Characteristic.TemperatureDisplayUnits)
		.on('get', this.getTemperatureDisplayUnits.bind(this))
		.on('set', this.setTemperatureDisplayUnits.bind(this));

	    this.service
		.getCharacteristic(Characteristic.Name)
		.on('get', this.getName.bind(this));

             return [informationService, this.service];
        }

	getCurrentHeatingCoolingState(callback) {
		this.log("getCurrentHeatingCoolingState from:", this.apiroute+"/happ_thermstat?action=getThermostatInfo");
		request.get({
			url: this.apiroute+"/happ_thermstat?action=getThermostatInfo"
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				this.log("response success");
				var json = JSON.parse(body);
				this.log("currentHeatingCoolingState is %s", json.burnerInfo);
            			this.currentHeatingCoolingState = json.burnerInfo;
				this.service.setCharacteristic(Characteristic.CurrentHeatingCoolingState, this.currentHeatingCoolingState);

				callback(null, this.currentHeatingCoolingState); // success
			} else {
				this.log("Error getting CurrentHeatingCoolingState: %s", err);
				callback(err);
			}
		}.bind(this));
	}

	getTargetHeatingCoolingState(callback) {
            callback(null, Characteristic.TargetHeatingCoolingState.AUTO);
        }

	setTargetHeatingCoolingState(value, callback) {
            callback(null, Characteristic.TargetHeatingCoolingState.AUTO);
        }

	getCurrentTemperature(callback) {
      	    this.log("getCurrentTemperature from:", this.apiroute+"/happ_thermstat?action=getThermostatInfo");
		request.get({
			url: this.apiroute+"/happ_thermstat?action=getThermostatInfo"
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				this.log("response success");
				var json = JSON.parse(body);
				var output = (parseFloat(json.currentTemp) / 100).toFixed(0);
				this.currentTemperature = output;
				this.log("Current temperature is %s", this.currentTemperature);
				callback(null, this.currentTemperature); // success
			} else {
				this.log("Error getting state: %s", err);
				callback(err);
			}
		}.bind(this));
	}

	getTargetTemperature(callback) {
		this.log("getTargetTemperature from:", this.apiroute+"/happ_thermstat?action=getThermostatInfo");
		request.get({
			url: this.apiroute+"/happ_thermstat?action=getThermostatInfo"
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				this.log("response success");
				var json = JSON.parse(body);
				var output = (parseFloat(json.currentSetpoint) / 100).toFixed(0);
				this.targetTemperature = output;
				this.log("Target temperature is %s", this.targetTemperature);
				callback(null, this.targetTemperature); // success
			} else {
				this.log("Error getting state: %s", err);
				callback(err);
			}
		}.bind(this));
	}

	setTargetTemperature(value, callback) {
		this.log("setTargetTemperature from:", this.apiroute+"/happ_thermstat?action=setSetpoint&Setpoint="+value+"00");
		request.get({
			url: this.apiroute+"/happ_thermstat?action=setSetpoint&Setpoint="+value+"00"
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				this.log("response success");
				callback(null); // success
			} else {
				this.log("Error getting state: %s", err);
				callback(err);
			}
		}.bind(this));
	}

	getTemperatureDisplayUnits(callback) {
		this.log("getTemperatureDisplayUnits:", this.temperatureDisplayUnits);
		callback(null, this.temperatureDisplayUnits);
	}

	setTemperatureDisplayUnits(value, callback) {
		this.log("setTemperatureDisplayUnits from %s to %s", this.temperatureDisplayUnits, value);
		this.temperatureDisplayUnits = Characteristic.TemperatureDisplayUnits.CELSIUS;
		callback(null);
	}

	getName(callback) {
		this.log("getName :", this.name);
		callback(null, this.name);
	}

}
