(function () {
  /** @type yasp.Emulator */
  var emulator;

  module("emulator api", {
    setup: function () {
      emulator = new yasp.Emulator();
      emulator.forceStep = true;
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

  test("load - invalid start type", function () {
    var expected = 3;
    var actual = emulator.load(new Uint8Array(0), "a");
    strictEqual(expected, actual);
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
    var expected = 1;
    var actual = emulator.continue("a");
    strictEqual(expected, actual);
  });

  test("continue - invalid count type (bool)", function () {
    var expected = 1;
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
    emulator.continue(expected);
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

  test("isCarryFlagSet", function () {
    var expected = { z: false, c: true };
    emulator.flags = expected;
    var actual = emulator.isCarryFlagSet();
    deepEqual(expected.c, actual);
  });

  test("isZeroFlagSet", function () {
    var expected = { z: true, c: false };
    emulator.flags = expected;
    var actual = emulator.isZeroFlagSet();
    deepEqual(expected.z, actual);
  });

  test("pushByte", function () {
    emulator.pushByte(0xFA);
    strictEqual(emulator.sp, emulator.initialSP + 1, "SP incremented");
    strictEqual(emulator.ram[emulator.initialSP + 1], 0xFA, "Value saved");
  });

  test("popByte", function () {
    emulator.sp = emulator.initialSP + 1;
    emulator.ram[emulator.initialSP + 1] = 0xFA;

    var actual = emulator.popByte();

    strictEqual(emulator.sp, emulator.initialSP, "SP decremented");
    strictEqual(actual, 0xFA);
  });

  test("byte stack", function () {
    var expected1 = 0xFA;
    var expected2 = 0xFB;

    emulator.pushByte(expected1);
    emulator.pushByte(expected2);

    var actual1 = emulator.popByte();
    var actual2 = emulator.popByte();

    strictEqual(actual2, expected1, "2nd pop");
    strictEqual(actual1, expected2, "1st pop");
  });

  test("pushWord", function () {
    emulator.pushWord(0xFAFB);
    strictEqual(emulator.ram[emulator.initialSP + 1], 0xFB, "byte 2 saved");
    strictEqual(emulator.ram[emulator.initialSP + 2], 0xFA, "byte 1 saved");
  });

  test("popWord", function () {
    emulator.sp = emulator.initialSP + 2;
    emulator.ram[emulator.initialSP + 1] = 0xFB;
    emulator.ram[emulator.initialSP + 2] = 0xFA;

    var actual = emulator.popWord();

    strictEqual(emulator.sp, emulator.initialSP, "SP decremented");
    strictEqual(actual, 0xFAFB);
  });

  test("word stack", function () {
    var expected1 = 0xF1F2;
    var expected2 = 0xFBFB;

    emulator.pushWord(expected1);
    emulator.pushWord(expected2);

    var actual1 = emulator.popWord();
    var actual2 = emulator.popWord();

    strictEqual(actual2, expected1, "2nd pop");
    strictEqual(actual1, expected2, "1st pop");
  });

  test("writePC", function () {
    var expected = 255;
    emulator.writePC(expected);
    strictEqual(emulator.pc, expected);
  });

  test("readPC", function () {
    var expected = 255;
    emulator.pc = expected;
    var actual = emulator.readPC();
    strictEqual(actual, expected);
  });

  test("writeRAM", function () {
    var expected = 241;
    emulator.writeRAM(100, expected);
    strictEqual(emulator.ram[100], expected);
  });

  test("readRAM", function () {
    var expected = 241;
    emulator.ram[100] = expected;
    var actual = emulator.readRAM(100);
    strictEqual(actual, expected);
  });

  test("readRAM - bounds", function () {
    var expected = 0;
    var actual = emulator.readRAM(emulator.ram.length + 1);
    strictEqual(actual, expected);
  });

  test("writeROM - simple", function () {
    var expected = 241;
    emulator.writeROM(100, expected);
    strictEqual(emulator.rom[100], expected);
  });

  test("writeROM - with commands 1", function () {
    emulator.commandCache[10] = true;
    emulator.commandCache[9] = true;
    emulator.commandCache[8] = { neededBytes: 3 };

    emulator.writeROM(10, 42);

    strictEqual(emulator.rom[10], 42);
    strictEqual(emulator.commandCache[10], undefined);
    strictEqual(emulator.commandCache[9], undefined);
    strictEqual(emulator.commandCache[8], undefined);
  });

  test("writeROM - with commands 2", function () {
    emulator.commandCache[10] = true;
    emulator.commandCache[9] = true;
    emulator.commandCache[8] = { neededBytes: 3 };

    emulator.writeROM(9, 42);

    strictEqual(emulator.rom[9], 42);
    strictEqual(emulator.commandCache[10], undefined);
    strictEqual(emulator.commandCache[9], undefined);
    strictEqual(emulator.commandCache[8], undefined);
  });

  test("writeROM - with commands 3", function () {
    emulator.commandCache[10] = true;
    emulator.commandCache[9] = true;
    emulator.commandCache[8] = { neededBytes: 3 };

    emulator.writeROM(8, 42);

    strictEqual(emulator.rom[8], 42);
    strictEqual(emulator.commandCache[10], undefined);
    strictEqual(emulator.commandCache[9], undefined);
    strictEqual(emulator.commandCache[8], undefined);
  });

  test("readROM", function () {
    var expected = 241;
    emulator.rom[100] = expected;
    var actual = emulator.readROM(100);
    strictEqual(actual, expected);
  });

  test("readROM - bounds", function () {
    var expected = 0;
    var actual = emulator.readROM(emulator.rom.length + 1);
    strictEqual(actual, expected);
  });

  test("setIO - unknown pin", function () {
    var expected = 1;
    var actual = emulator.setIO(1000, 1);
    strictEqual(actual, expected);
  });

  test("setIO - set an input pin", function () {
    var expected = 2;
    emulator.pins = { 0: { mode: "in" } };
    var actual = emulator.setIO(0, 1);
    strictEqual(actual, expected);
  });

  test("setIO - set an input pin from outside", function () {
    var expected = 0;
    var state = 1;
    emulator.pins = { 0: { mode: "in" } };
    var actual = emulator.setIO(0, state, true);
    strictEqual(actual, expected);
    strictEqual(emulator.pins[0].state, state);
  });

  test("setIO - invalid state, string", function () {
    var expected = 3;
    var actual = emulator.setIO(0, "12");
    strictEqual(actual, expected);
  });

  test("setIO - invalid state, obj", function () {
    var expected = 3;
    var actual = emulator.setIO(0, {});
    strictEqual(actual, expected);
  });

  test("setIO - invalid state, int, too big", function () {
    var expected = 3;
    var actual = emulator.setIO(0, 65536);
    strictEqual(actual, expected);
  });

  test("setIO - invalid state, int, too small", function () {
    var expected = 3;
    var actual = emulator.setIO(0, -5);
    strictEqual(actual, expected);
  });

  test("setIO - state = 1", function () {
    var expected = 0;
    var state = 1;
    var actual = emulator.setIO(3, state);
    strictEqual(actual, expected);
    strictEqual(emulator.pins[3].state, state);
  });

  test("setIO - state = 0", function () {
    var expected = 0;
    var state = 0;
    var actual = emulator.setIO(3, state);
    strictEqual(actual, expected);
    strictEqual(emulator.pins[3].state, state);
  });

  test("setIO - state = min", function () {
    var expected = 0;
    var actual = emulator.setIO(3, 0);
    strictEqual(actual, expected);
    strictEqual(emulator.pins[3].state, 0);
  });

  test("setIO - state = max", function () {
    var expected = 0;
    var actual = emulator.setIO(3, 255);
    strictEqual(actual, expected);
    strictEqual(emulator.pins[3].state, 255);
  });

  test("getIO - unknown pin", function () {
    var expected = null;
    var actual = emulator.getIO(300);
    strictEqual(actual, expected);
  });

  test("getIO", function () {
    var expected = true;
    emulator.pins = { 0: { mode: "in", state: expected } };
    var actual = emulator.getIO(0);
    strictEqual(actual, expected);
  });

  test("setInterruptMask", function () {
    var expected = [
      false,
      false,
      true,
      true,
      false,
      true,
      true,
      true
    ];
    emulator.setInterruptMask(236);
    var actual = emulator.interruptMask;
    deepEqual(actual, expected);
  });

  test("wait", function () {
    var val = 50;
    emulator.wait(val);
    strictEqual(emulator.waitTime, 0.75);
  });

  test("wait - tick", function () {
    emulator.wait(1000);
    emulator.running = true;
    emulator.tickWrapper();
    strictEqual(emulator.waitTime, 0);
  });

  test("setBreakpoints - no condition", function () {
    emulator.setBreakpoints([
      {
        offset: 3,
        condition: null
      },
      {
        offset: 10,
        condition: undefined
      }
    ]);

    strictEqual(emulator.breakpoints[3], true);
    strictEqual(emulator.breakpointConditions[3], null, "condition = null");
    strictEqual(emulator.breakpoints[10], true);
    strictEqual(emulator.breakpointConditions[10], null, "condition = undefined");
  });

  test("setBreakpoints - with condition", function () {
    emulator.setBreakpoints([{
      offset: 3,
      condition: {
        "type": "register",
        "param": "b2",
        "operator": "=",
        "value": 5
      }
    }]);

    if(emulator.breakpointConditions[3])
      emulator.breakpointConditions[3].uintArrayValue = {};

    strictEqual(emulator.breakpoints[3], true);
    deepEqual(emulator.breakpointConditions[3],
      {
        "boolValue": false,
        "isBigger": false,
        "isBiggerEquals": false,
        "isBoolValue": false,
        "isByteRegister": true,
        "isChange": false,
        "isEquals": true,
        "isNotEquals": false,
        "isNumValue": true,
        "isSmaller": false,
        "isSmallerEquals": false,
        "isUintArrayValue": false,
        "isWordRegister": false,
        "numValue": 5,
        "registerNumber": 2,
        "uintArrayValue": {}
      }
    );
  });

  test("setBreakpoints - invalid array", function () {
    var expected = 0;
    var actual = emulator.setBreakpoints("");
    deepEqual(actual, expected);
  });

  test("registerCallback", function () {
    var func = function () {};
    var actual = emulator.registerCallback("BREAK", func);
    strictEqual(actual, true);
    strictEqual(emulator.events["BREAK"], func);
  });

  test("registerCallback - invalid func", function () {
    var actual = emulator.registerCallback("BREAK", "asd");
    strictEqual(actual, false);
    strictEqual(emulator.events["BREAK"], emulator.noop);
  });
})();
