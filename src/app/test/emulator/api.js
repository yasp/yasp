(function () {
  var emulator;

  module("emulator api", {
    setup: function () {
      emulator = new yasp.Emulator();
    },
    teardown: function () {
      emulator = null;
    }
  });

  test("ensure that ram array is created", function () {
    ok(emulator.ram instanceof Uint8Array);
  });

  test("ensure that rom array is created", function () {
    ok(emulator.rom instanceof Uint8Array);
  });

  test("load - start < 0", function () {
    var expected = 0;
    var actual = emulator.load(new Uint8Array(0), -1);
    strictEqual(expected, actual);
  });

  test("load - start > len", function () {
    var expected = 0;
    var actual = emulator.load(new Uint8Array(0), emulator.rom.length);
    strictEqual(expected, actual);
  });

  test("load - bitcode is too big", function () {
    var expected = 1;
    var actual = emulator.load(new Uint8Array(20), emulator.rom.length - 10);
    strictEqual(expected, actual);
  });

  test("load - bitcode is no Uint8Array", function () {
    var expected = 2;
    var actual = emulator.load("yasp", 0);
    strictEqual(expected, actual);
  });

})();
