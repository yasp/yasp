if (typeof yasp == 'undefined') yasp = { };
if (!yasp.test) yasp.test = { };

/** Test-helper for the emulator
 * @param moduleName name of this module, see QUnit-Documentation
 * @constructor
 */
yasp.test.EmulatorTester = function (moduleName) {
  this.moduleName = "Emulator: " + moduleName;
  this.tests = [];
};

/** add a single test
 * @param test {object} {@link https://github.com/yasp/yasp/blob/master/doc/testing/commands.md|Additional documentation}.
 * @see yasp.test.EmulatorTester#addTests
 */
yasp.test.EmulatorTester.prototype.addTest = function (test) {
  if(!test.title)
    test.title = test.cmd.replace(/\n/g, ' / ');

  this.tests.push(test);
};

/** add a number of tests
 * @param tests {object[]} {@link https://github.com/yasp/yasp/blob/master/doc/testing/commands.md|Additional documentation}.
 * @see yasp.test.EmulatorTester#addTest
 */
yasp.test.EmulatorTester.prototype.addTests = function (tests) {
  for (var i = 0; i < tests.length; i++) {
    this.addTest(tests[i])
  }
};

/** Call once all tests have been added. This generates QUnit-Tests which will be run by QUnit later.
 */
yasp.test.EmulatorTester.prototype.done = function () {
  var tester = this;

  module(this.moduleName, {
    setup: function () {
      tester.assembler = new yasp.Assembler();

      tester.emulator = new yasp.Emulator();
      tester.emulator.ticksPerTick = 1;
      tester.emulator.forceStep = true;
      tester.emulator.running = true;
      tester.emulator.registerCallback("DEBUG",
        function (type, subtype, addr, val) {
          tester.lastDebugMessage = {
            type: type,
            subtype: subtype,
            addr: addr,
            val: val
          }
        }
      );
    },
    teardown: function () {
      tester.emulator = null;
      tester.lastEmulatorDebug = null;
      tester.assembler = null;
    }
  });

  QUnit.cases(this.tests).test("command", (function (test) {
    var asm = this.assembler.assemble({ code: test.cmd || "", jobs: ["bitcode"] });
    ok(asm.success, "Assembling works");

    if(!asm.success)
      return;

    this.emulator.pc = 0;
    this.emulator.load(asm.bitcode, 0);

    tester.applySetup(test.setup);

    test.steps = test.steps || [];

    if(!(test.steps instanceof Array))
      test.steps = [test.steps];

    for (var i = 0; i < test.steps.length; i++) {
      var step = test.steps[i];
      var stepPrefix = "Step " + (i+1) + ": ";

      this.emulator.running = true;
      this.emulator.tickWrapper();

      if(step.reg) {
        for (var r in step.reg) {
          var actual;
          var expected = this.parseLiteral(step.reg[r]);

          if(r.length < 2)
          {
            ok(false, stepPrefix + "Invalid test: step-register " + r);
            continue;
          }

          if(r == "pc") {
            actual = this.emulator.pc;
          } else if (r == "sp") {
            actual = this.emulator.sp;
          } else {
            var n = +r.substr(1);

            if(r.charAt(0) === "b")
              actual = this.emulator.readByteRegister(n);
            else if (r.charAt(0) === "w")
              actual = this.emulator.readWordRegister(n);
            else
            {
              ok(false, stepPrefix + "Invalid test: step-register " + r + " does not exist.");
              continue;
            }
          }

          strictEqual(actual, expected, stepPrefix + "register " + r + " is " + expected);
        }
      }
      if(step.flags) {
        var flags = this.emulator.readFlags();

        for (var flag in flags) {
          var longname = "unknown";
          if(flag == "c")
            longname = "carry";
          if(flag == "z")
            longname = "zero";
          var msg = stepPrefix +longname + " flag is " + (step.flags[flag] === true ? "set" : "not set");

          if(typeof step.flags[flag] === undefined && flags[flag] === false ||
            typeof step.flags[flag] !== undefined && flags[flag] == step.flags[flag])
            ok(true, msg);
          else
            ok(false, msg);
        }
      }
      if(step.ram) {
        for (var r in step.ram) {
          var expected = this.parseLiteral(step.ram[r]);
          var actual = this.emulator.ram[r];

          strictEqual(actual, expected, stepPrefix + "ram-byte " + r + " is " + expected);
        }
      }
      if(step.rom) {
        alert(stepPrefix +"Step-ROM-Checking is not yet implemented")
      }
      if(step.interruptMask) {
        deepEqual(this.emulator.interruptMask, step.interruptMask);
      }
      if(step.pin) {
        for (var p in step.pin) {
          var expected = step.pin[p];
          var actual = this.emulator.getIO(p);

          strictEqual(actual, expected, stepPrefix + "pin " + p + " is " + expected);
        }
      }
      if(step.triggerInterrupt) {
        this.emulator.scheduleInterrupt(step.triggerInterrupt);
      }
      if(step.stack) {
        for (var r in step.stack) {
          var expected = this.parseLiteral(step.stack[r]);
          var actual = this.emulator.stack[r];

          strictEqual(actual, expected, stepPrefix + "stack-entry " + r + " is " + expected);
        }
      }
      if(step.waitTime !== undefined) {
        strictEqual(this.emulator.waitTime, step.waitTime, "waitTime");
      }
      if(step.running !== undefined) {
        strictEqual(this.emulator.running, step.running, stepPrefix + "Emulator is " + (step.running ? "" : "not ") + "running");
      }
      if(step.debug !== undefined) {
        deepEqual(this.lastDebugMessage, step.debug, "Debug " + JSON.stringify(step.debug) + " was issued");
      }
    }
  }).bind(this));
};

/** Applies the setup-part of an test to the emulator.
 * @param setup {?object}
 * @private
 */
yasp.test.EmulatorTester.prototype.applySetup = function (setup) {
  if(!setup)
    return;

  if(setup.ram) {
    if(setup.ram instanceof Uint8Array) {
      this.emulator.ram = setup.ram;
    } else {
      for (var a in setup.ram) {
        this.emulator.ram[a] = setup.ram[a];
      }
    }
  }
  if(setup.reg) {
    for (var r in setup.reg) {
      var val = this.parseLiteral(setup.reg[r]);

      if(r.length < 2) {
        ok(false, "Invalid test: setup-register " + r);
        continue;
      }

      if(r == "pc") {
        this.emulator.pc = val;
      } else if (r == "sp") {
        this.emulator.sp = val;
      } else {
        var n = +r.substr(1);

        if(r.charAt(0) === "b")
          this.emulator.writeByteRegister(n, val);
        else if (r.charAt(0) === "w")
          this.emulator.writeWordRegister(n, val);
        else
        {
          ok(false, "Invalid test: setup-register " + r + " does not exist.");
        }
      }
    }
  }
  if(setup.stack) {
    this.emulator.stack = setup.stack;
  }
  if(setup.pin) {
    for (var p in setup.pin) {
      this.emulator.setIO(p, setup.pin[p], true);
    }
  }
  if(setup.rom) {
    if(setup.rom instanceof Uint8Array) {
      this.emulator.rom = setup.rom;
    } else {
      for (var a in setup.rom) {
        this.emulator.rom[a] = setup.rom[a];
      }
    }
  }
  if(setup.interruptMask) {
    this.emulator.interruptMask = setup.interruptMask;
  }
  if(setup.flags) {
    if(setup.flags.z !== undefined)
      this.emulator.flags.z = setup.flags.z;
    if(setup.flags.c !== undefined)
      this.emulator.flags.c = setup.flags.c;
  }
  if(setup.breakpoints) {
    this.emulator.setBreakpoints(setup.breakpoints);
  }
};

/** If given an string this converts a binary string to a Number, spaces are allowed, too. If given a number, it returns that number.
 * @param lit {String|Number} number or string containing binary representation of a number
 * @private
 */
yasp.test.EmulatorTester.prototype.parseLiteral = function (lit) {
  if(typeof lit === "string")
    return parseInt(lit.replace(' ', ''), 2);
  return lit;
};
