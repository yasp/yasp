# Breadboards
A breadboard is responsible for handling the the hardware-elements. It wires up the hardware to the emulator, relays
events and aligns the hardware as specified in one of the breadboard-files. Additionally it shows the user which
hardware is attached to which pin and has other visual clues.

It is possible to change the used hardware by defining a new breadboard in [`/src/app/js/editor/breadboard/`](/src/app/js/editor/breadboard/).

## Breadboard format
```javascript
if (typeof yasp == 'undefined') yasp = { };
if (!yasp.BreadBoardTypes) yasp.BreadBoardTypes = { };

(function () {
  yasp.BreadBoardTypes.usbmaster = {

    // humanreadable name which is shown in menus
    name: {
      "de": "USB-Master",
      "en": "USB-Master"
    },

    // a short description which should not exceed two sentences
    description: {
      "de": "Breadboard, das aussieht wie der USB-Master",
      "en": "Breadboard which mimics the USB-Masters look"
    },

    // background-image to use (optional)
    image: {
      url: "./app/img/usbmaster.png",
      height: "260px",
      width: "335px"
    },

    // definition of the hardware-elements to create, add and wire
    hardware: [
      {
        // hardware type, see /doc/hardware.md
        type: "POTI",

        // parameters for the hardware, see files in /doc/hardware/
        params: {
          onColor: 'rgb(255,0,0)',
          offColor: 'rgb(60,0,0)'
        },

        // pin on the emulator to attach this hardware to
        pin: 11,

        // where to show the tooltip which contains additional information such as used pin
        // possible values: left, right, top, bottom  (default = top)
        tooltip: {
          placement: "bottom"
        },

        // size and placement of this piece of hardware
        appearance: {
          top: "5px",
          left: "137px",
          height: "65px",
          width: "65px"
        }
      }
    ]
  };
})();
```

## Boilerplate
```javascript
if (typeof yasp == 'undefined') yasp = { };
if (!yasp.BreadBoardTypes) yasp.BreadBoardTypes = { };

(function () {
  yasp.BreadBoardTypes.CHANGEME = {
    name: {
      "de": "",
      "en": ""
    },
    description: {
      "de": "",
      "en": ""
    },
    image: { // optional
      url: "",
      height: "0",
      width: "0"
    },
    hardware: [
      {
        type: "",
        params: {
        },
        pin: 1,
        tooltip: { // optional
          placement: "top"
        },
        appearance: {
          top: "0",
          left: "0",
          height: "50px",
          width: "50px"
        }
      }
    ]
  };
})();
```