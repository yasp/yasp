(function () {
  /** @type yasp.Pin */
  var pin;

  var ticks;

  module("pin pwm", {
    setup: function () {
      ticks = 0;
      pin = new yasp.Pin(0, "gpio", "out", true);
    },
    teardown: function () {
      ticks = 0;
      pin = null;
    }
  });

  test("basic", function () {
    // 0123456789
    //  HHLLLHH

    pin.setState(1, false, 1);
    pin.setState(0, false, 3);
    pin.setState(1, false, 6);

    strictEqual(pin.state, 2 / (2 + 3));
  });

  asyncTest("HIGH", function (assert) {
    pin.STATE_CHANGED = function () {
      strictEqual(pin.state, 1);
      start();
    };

    pin.setState(1, false, 1);
  });

  asyncTest("HIGH, LOW", function (assert) {
    pin.STATE_CHANGED = function () {
      strictEqual(pin.state, 0);
      start();
    };

    pin.setState(1, false, 1);
    pin.setState(0, false, 2);
  });

  asyncTest("HIGH, LOW, HIGH", function (assert) {
    var called = 0;
    pin.STATE_CHANGED = function () {
      called++;

      if(called === 2) {
        strictEqual(pin.state, 1);
        start();
      }
    };

    pin.setState(1, false, 1);
    pin.setState(0, false, 2);
    pin.setState(1, false, 3);
  });

})();
