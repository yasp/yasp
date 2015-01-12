(function () {
  /** @type yasp.Pin */
  var pin;

  var ticks;
  var ticker = {
    getTicks: function () {
      return ticks;
    }
  };

  module("pin pwm", {
    setup: function () {
      ticks = 0;
      pin = new yasp.Pin(0, "gpio", "out", true, ticker);
    },
    teardown: function () {
      ticks = 0;
      pin = null;
    }
  });

  test("basic", function () {
    // 0123456789
    //  HHLLLHH

    ticks = 1; pin.setState(1, false);
    ticks = 3; pin.setState(0, false);
    ticks = 6; pin.setState(1, false);

    strictEqual(pin.state, 2 / (2 + 3));
  });

  asyncTest("HIGH", function (assert) {
    pin.STATE_CHANGED = function () {
      strictEqual(pin.state, 1);
      start();
    };

    ticks = 1; pin.setState(1, false);
  });

  asyncTest("HIGH, LOW", function (assert) {
    pin.STATE_CHANGED = function () {
      strictEqual(pin.state, 0);
      start();
    };

    ticks = 1; pin.setState(1, false);
    ticks = 2; pin.setState(0, false);
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

    ticks = 1; pin.setState(1, false);
    ticks = 2; pin.setState(0, false);
    ticks = 3; pin.setState(1, false);
  });

})();
