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
        params: {
        },
        tooltip: {
          placement: "bottom"
        },
        pin: 11,
        appearance: {
          top: "1",
          left: "120",
          height: "80",
          width: "80"
        }
      },
      {
        type: "LED",
        params: {
          onColor: 'rgb(0,255,0)',
          offColor: 'rgb(0,35,0)'
        },
        pin: 5,
        appearance: {
          top: "170",
          left: "175",
          height: "30",
          width: "30"
        }
      },
      {
        type: "LED",
        params: {
          onColor: 'rgb(255,255,0)',
          offColor: 'rgb(35,35,0)'
        },
        pin: 4,
        appearance: {
          top: "170",
          left: "210",
          height: "30",
          width: "30"
        }
      },
      {
        type: "LED",
        params: {
          onColor: 'rgb(255,0,0)',
          offColor: 'rgb(35,0,0)'
        },
        pin: 3,
        appearance: {
          top: "170",
          left: "245",
          height: "30",
          width: "30"
        }
      },
      {
        type: "PUSHBUTTON",
        params: {
          color: 'rgb(100,100,100)',
          pushcolor: 'rgb(60,60,60)'
        },
        pin: 1,
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
        params: {
          color: 'rgb(255,0,0)',
          pushcolor: 'rgb(180,0,0)'
        },
        pin: 2,
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