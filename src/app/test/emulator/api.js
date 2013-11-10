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

  test("load", function () {
    var expected = new Uint8Array(5);
    expected.set([1, 2, 3, 4, 5], 0);

    emulator.load(expected, 0);
    var actual = emulator.rom;

    for (var i = 0; i < expected.length; i++) {
      strictEqual(expected[i], actual[i]);
    }
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

  test("continue - invalid count type (str)", function () {
    var expected = 2;
    var actual = emulator.continue("a");
    strictEqual(expected, actual);
  });

  test("continue - invalid count type (bool)", function () {
    var expected = 2;
    var actual = emulator.continue(true);
    strictEqual(expected, actual);
  });

  test("continue - count < 0", function () {
    var expected = 0;
    var actual = emulator.continue(-1);
    strictEqual(expected, actual);
  });

  test("continue - count = null", function () {
    var expected = true;
    emulator.continue(null);
    var actual = emulator.running;
    strictEqual(expected, actual);
  });

  test("continue - count = 1", function () {
    var expected = 1;
    emulator.continue(1);
    var actual = emulator.running;
    strictEqual(expected, actual);
  });

  test("break", function () {
    var expected = false;
    emulator.running = true;
    emulator.break();
    var actual = emulator.running;
    strictEqual(expected, actual);
  });

  test("break", function () {
    var expected = 0;
    var actual = emulator.break();
    strictEqual(expected, actual);
  });

  test("writeByteRegister - r < 0", function () {
    var expected = 0;
    var actual = emulator.writeByteRegister(-1, 0);
    strictEqual(expected, actual);
  });

  test("writeByteRegister - r > 32", function () {
    var expected = 0;
    var actual = emulator.writeByteRegister(33, 0);
    strictEqual(expected, actual);
  });

  test("writeByteRegister - v < 0", function () {
    var expected = 1;
    var actual = emulator.writeByteRegister(0, -1);
    strictEqual(expected, actual);
  });

  test("writeByteRegister - v > 255", function () {
    var expected = 1;
    var actual = emulator.writeByteRegister(0, 256);
    strictEqual(expected, actual);
  });

  test("writeByteRegister", function () {
    var expected = 42;
    emulator.writeByteRegister(1, expected);
    var actual = emulator.ram[1];
    strictEqual(expected, actual);
  });

  test("readByteRegister - r < 0", function () {
    var expected = -1;
    var actual = emulator.readByteRegister(-1);
    strictEqual(expected, actual);
  });

  test("readByteRegister - r > 32", function () {
    var expected = -1;
    var actual = emulator.readByteRegister(33);
    strictEqual(expected, actual);
  });

  test("writeWordRegister - r < 0", function () {
    var expected = 0;
    var actual = emulator.writeWordRegister(-1, 0);
    strictEqual(expected, actual);
  });

  test("writeWordRegister - r > 32", function () {
    var expected = 0;
    var actual = emulator.writeWordRegister(33, 0);
    strictEqual(expected, actual);
  });

  test("writeWordRegister - v < 0", function () {
    var expected = 1;
    var actual = emulator.writeWordRegister(0, -1);
    strictEqual(expected, actual);
  });

  test("writeWordRegister - v > 65535", function () {
    var expected = 1;
    var actual = emulator.writeWordRegister(0, 65536);
    strictEqual(expected, actual);
  });

  test("writeWordRegister", function () {
    var expected1 = 0xAA;
    var expected2 = 0xFF;

    emulator.writeWordRegister(1, 0xAAFF);

    var actual1 = emulator.ram[2];
    var actual2 = emulator.ram[3];

    strictEqual(expected1, actual1);
    strictEqual(expected2, actual2);
  });

  test("readWordRegister - r < 0", function () {
    var expected = -1;
    var actual = emulator.readWordRegister(-1);
    strictEqual(expected, actual);
  });

  test("readWordRegister - r > 32", function () {
    var expected = -1;
    var actual = emulator.readWordRegister(33);
    strictEqual(expected, actual);
  });

  test("readWordRegister", function () {
    var expected = 0xAAFF;

    emulator.ram[2] = 0xAA;
    emulator.ram[3] = 0xFF;

    var actual = emulator.readWordRegister(1);

    strictEqual(expected, actual);
  });

  test("writeFlags - zero", function () {
    var expected = { z: true, c: false };
    emulator.writeFlags(null, true);
    var actual = emulator.flags;
    deepEqual(expected, actual);
  });

  test("writeFlags - carry", function () {
    var expected = { z: false, c: true };
    emulator.writeFlags(true, null);
    var actual = emulator.flags;
    deepEqual(expected, actual);
  });

  test("writeFlags - all", function () {
    var expected = { z: true, c: true };
    emulator.writeFlags(true, true);
    var actual = emulator.flags;
    deepEqual(expected, actual);
  });

  test("readFlags - zero", function () {
    var expected = { z: true, c: false };
    emulator.flags = expected;
    var actual = emulator.readFlags();
    deepEqual(expected, actual);
  });

  test("readFlags - carry", function () {
    var expected = { z: false, c: true };
    emulator.flags = expected;
    var actual = emulator.readFlags();
    deepEqual(expected, actual);
  });

  test("readFlags - all", function () {
    var expected = { z: true, c: true };
    emulator.flags = expected;
    var actual = emulator.readFlags();
    deepEqual(expected, actual);
  });
})();
