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
        },
        tooltip: {
          placement: "bottom"
        },
        pin: 11,
        appearance: {
          top: "1px",
          left: "120px",
          height: "80px",
          width: "80px"
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
          offColor: 'rgb(35,35,0)'
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
          offColor: 'rgb(35,0,0)'
        },
        pin: 3,
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
        tooltip: {
          placement: "left"
        },
        appearance: {
          top: "208px",
          left: "180px",
          height: "40px",
          width: "40px"
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
          top: "208px",
          left: "240px",
          height: "40px",
          width: "40px"
        }
      }
    ]
  };
})();