# homebridge-rootedtoon
This plugin enables homebridge to communicate with Toon.

`npm install -g homebridge-rootedToon`

## Configuration
The following should be added to the homebridge config.json:

{
    "bridge": {
        "name": "Homebridge",
        "username": "CC:22:3D:E3:CE:30",
        "port": 51826,
        "pin": "031-45-154"
    },
    "description": "This is an example configuration file for Toon.",
    "accessories": [
        {
            "accessory": "RootedToon",
            "name": "Toon Thermostaat",
            "apiroute": "http://<YOURROOTEDTOONIP>",
            //optional (remove this comment line when copy past from this section
            "maxTemp": 25,
            "minTemp": 15,
            "manufacturer": "Eneco",
            "model": "RootedToon",
            "serial_number": "xxx.xxx.xxx.xxx"
        }
    ]
}

The plugin automatically lists the available options in the Homebridge log.
