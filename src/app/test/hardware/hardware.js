(function() {
  module("hardware");

  test("ensure creating hardware works", function() {
    // arrange
    var hardwareButton, hardwareLED, hardwarePoti;

    // act
    hardwareButton = new yasp.Hardware({
      type: yasp.HardwareType.PUSHBUTTON
    });
    hardwareLED = new yasp.Hardware({
      type: yasp.HardwareType.LED,
      params: {
        color: 0xFF0000
      }
    });
    hardwarePoti = new yasp.Hardware({
      type: yasp.HardwareType.POTI
    });

    // assert
    notStrictEqual(hardwareButton, null);
    notStrictEqual(hardwareLED, null);
    notStrictEqual(hardwarePoti, null);
    deepEqual(hardwareLED.params, { color: 0xFF0000 });
  });

  test("ensure changing state calls callback", function() {
    // arrange
    var hardware;
    var cbCalled = false;

    // act
    hardware = new yasp.Hardware({
      type: yasp.HardwareType.PUSHBUTTON,
      cb: function() {
        cbCalled = true;
      }
    });
    hardware.receiveStateChange(yasp.HardwareType.PUSHBUTTON.States.PUSH);

    // assert
    notStrictEqual(hardware, null);
    strictEqual(cbCalled, true);
    strictEqual(hardware.state, yasp.HardwareType.PUSHBUTTON.States.PUSH);
  });
})();

(function() {
  var elem;
  module("hardware ui", {
    setup: function() {
      elem = $('<div></div>');
      elem.css({
        'width': '80px',
        'height': '80px'
      });

      elem.appendTo($('body'));
    },
    teardown: function() {
      if (!!elem) elem.remove();
      elem = null;
    }
  });

  test("ensure pushbutton is displayed", function() {
    // arrange
    var hardware;

    // act
    hardware = new yasp.Hardware({
      cb: function() { },
      container: elem,
      type: yasp.HardwareType.PUSHBUTTON,
      params: {
        color: 'red',
        pushcolor: 'rgb(200,0,0)'
      }
    });

    hardware.render();

    // assert
    equal(!hardware.element, false);
  });

  test("ensure pushbutton fires event", function() {
    // arrange
    var hardware;
    var fired = false;

    // act
    hardware = new yasp.Hardware({
      cb: function() {
        fired = true;
      },
      container: elem,
      type: yasp.HardwareType.PUSHBUTTON,
      params: {
        color: 'red',
        pushcolor: 'rgb(200,0,0)'
      }
    });
    hardware.receiveStateChange(yasp.HardwareType.PUSHBUTTON.States.PUSH);

    // assert
    equal(!hardware, false);
    equal(fired, true);
  });

  test("ensure led is displayed", function() {
    // arrange
    var hardware;

    // act
    hardware = new yasp.Hardware({
      cb: function() { },
      container: elem,
      type: yasp.HardwareType.LED,
      params: {
        onColor: 'red',
        offColor: 'blue'
      }
    });

    hardware.render();

    // assert
    equal(!hardware.element, false);
  });

  test("ensure led fires event", function() {
    // arrange
    var hardware;
    var fired = false;

    // act
    hardware = new yasp.Hardware({
      cb: function() {
        fired = true;
      },
      container: elem,
      type: yasp.HardwareType.LED,
      params: {
        onColor: 'red',
        offColor: 'blue'
      }
    });
    hardware.receiveStateChange(1);

    // assert
    equal(!hardware, false);
    equal(fired, true);
  });

  test("ensure poti is displayed", function() {
    // arrange
    var hardware;

    // act
    hardware = new yasp.Hardware({
      cb: function() { },
      container: elem,
      type: yasp.HardwareType.POTI,
      state: 42
    });

    hardware.render();

    // assert
    equal(!hardware.element, false);
  });

  test("ensure poti fires event", function() {
    // arrange
    var hardware;
    var fired = false;

    // act
    hardware = new yasp.Hardware({
      cb: function() {
        fired = true;
      },
      container: elem,
      type: yasp.HardwareType.POTI,
      state: 42
    });
    hardware.receiveStateChange(44);

    // assert
    equal(!hardware, false);
    equal(fired, true);
  });
})();