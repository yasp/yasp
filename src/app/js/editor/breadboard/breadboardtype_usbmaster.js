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
      height: "260px",
      width: "335px"
    },
    hardware: [
      {
        type: "POTI",
        params: {
          onColor: 'rgb(255,0,0)',
          offColor: 'rgb(60,0,0)'
        },
        pin: 11,
        appearance: {
          top: "5px",
          left: "137px",
          height: "65px",
          width: "65px"
        }
      },
      {
        type: "LED",
        params: {
          onColor: 'rgb(0,255,0)',
          offColor: 'rgb(0,60,0)'
        },
        pin: 3,
        appearance: {
          top: "170px",
          left: "175px",
          height: "30px",
          width: "30px"
        }
      },
      {
        type: "LED",
        params: {
          onColor: 'rgb(255,255,0)',
          offColor: 'rgb(60,60,0)'
        },
        pin: 4,
        appearance: {
          top: "170px",
          left: "210px",
          height: "30px",
          width: "30px"
        }
      },
      {
        type: "LED",
        params: {
          onColor: 'rgb(255,0,0)',
          offColor: 'rgb(60,0,0)'
        },
        pin: 5,
        appearance: {
          top: "170px",
          left: "245px",
          height: "30px",
          width: "30px"
        }
      },
      {
        type: "PUSHBUTTON",
        params: {
          color: 'rgb(100,100,100)',
          pushcolor: 'rgb(60,60,60)'
        },
        pin: 1,
        appearance: {
          top: "208px",
          left: "185px",
          height: "35px",
          width: "35px"
        }
      },
      {
        type: "PUSHBUTTON",
        params: {
          color: 'rgb(255,0,0)',
          pushcolor: 'rgb(180,0,0)'
        },
        pin: 2,
        appearance: {
          top: "208px",
          left: "243px",
          height: "35px",
          width: "35px"
        }
      }
    ]
  };
})();