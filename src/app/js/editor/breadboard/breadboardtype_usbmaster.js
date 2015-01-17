if (typeof yasp == 'undefined') yasp = { };
if (!yasp.BreadBoardTypes) yasp.BreadBoardTypes = { };

(function () {
  yasp.BreadBoardTypes.usbmaster = {
    name: {
      "de": "USB-Master",
      "en": "USB-Master"
    },
    description: {
      "de": "Breadboard, das aussieht wie der USB-Master",
      "en": "Breadboard which mimics the USB-Masters look"
    },
    image: {
      url: "./app/img/usbmaster.png",
      height: "260",
      width: "335"
    },
    hardware: [
      {
        type: "POTI",
        renderer: 'dom',
        params: {},
        tooltip: {
          placement: "bottom"
        },
        pins: [ { emulator: 11, hardware: 1 } ],
        appearance: {
          top: "4",
          left: "129",
          height: "62",
          width: "62"
        }
      },
      {
        type: "OSCI",
        renderer: 'dom',
        params: {},
        tooltip: false,
        pins: [ { emulator: 3, hardware: 3 }, { emulator: 4, hardware: 4 }, { emulator: 5, hardware: 5 } ],
        appearance: {
          top: "0",
          left: "350",
          height: "250",
          width: "350"
        }
      },
      {
        type: "LED",
        renderer: 'dom',
        params: {
          onColor: 'rgb(0,255,0)',
          offColor: 'rgb(0,35,0)'
        },
        pins: [ { emulator: 5, hardware: 1 } ],
        appearance: {
          top: "170",
          left: "175",
          height: "30",
          width: "30"
        }
      },
      {
        type: "LED",
        renderer: 'dom',
        params: {
          onColor: 'rgb(255,255,0)',
          offColor: 'rgb(35,35,0)'
        },
        pins: [ { emulator: 4, hardware: 1 } ],
        appearance: {
          top: "170",
          left: "210",
          height: "30",
          width: "30"
        }
      },
      {
        type: "LED",
        renderer: 'dom',
        params: {
          onColor: 'rgb(255,0,0)',
          offColor: 'rgb(35,0,0)'
        },
        pins: [ { emulator: 3, hardware: 1 } ],
        appearance: {
          top: "170",
          left: "245",
          height: "30",
          width: "30"
        }
      },
      {
        type: "PUSHBUTTON",
        renderer: 'dom',
        params: {
          color: 'rgb(100,100,100)',
          pushcolor: 'rgb(60,60,60)'
        },
        pins: [ { emulator: 1, hardware: 1 } ],
        tooltip: {
          placement: "left"
        },
        appearance: {
          top: "208",
          left: "180",
          height: "40",
          width: "40"
        }
      },
      {
        type: "PUSHBUTTON",
        renderer: 'dom',
        params: {
          color: 'rgb(255,0,0)',
          pushcolor: 'rgb(180,0,0)'
        },
        pins: [ { emulator: 2, hardware: 1 } ],
        tooltip: {
          placement: "right"
        },
        appearance: {
          top: "208",
          left: "240",
          height: "40",
          width: "40"
        }
      }
    ]
  };
})();