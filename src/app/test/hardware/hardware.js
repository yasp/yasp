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
  
  var elem;
  module("hardware ui", {
    setup: function() {
      elem = $('body').append('<div></div>');
    },
    teardown: function() {
      elem.remove();
    }
  });
  
  test("ensure pushbutton is displayed correctly", function() {
    // arrange
    var hardware;
    
    // act
    hardware = new yasp.Hardware({
      cb: function() { },
      container: elem,
      type: yasp.HardwareType.PUSHBUTTON
    });
    
    hardware.render();
    
    // assert
    ok();
  });
})();