(function () {
  var tester = new yasp.test.EmulatorTester("Breakpoints");

  tester.addTest({
    title: "breakpoint: offset",
    cmd: "MOV b0,0\n" +
      "MOV b0,0",
    setup: { breakpoints: [ { offset: 3, condition: null } ] },
    steps: [
      { running: true },
      { running: false }
    ]
  });

  tester.addTest({
    title: "breakpoint: offset + =r_byte",
    cmd: "MOV b2,0\n"  + // PC: 0
      "MOV b2,20\n" + // PC: 3
      "MOV b2,30\n",  // PC: 6
    setup: {
      breakpoints: [
        { offset: 3, condition: { type: "register", param: "b2", operator: "=", value: 20 } },
        { offset: 6, condition: { type: "register", param: "b2", operator: "=", value: 20 } }
      ]
    },
    steps: [
      { },               // no breakpoint
      { running: true }, // 1. breakpoint
      { running: false } // 2. breakpoint
    ]
  });

  var breakpointCases = [];

  //  set value  operator  check-value  should break?
  //    [20,       "=",        20,          true]

  breakpointCases.push(
    {
      title: "breakpoint: offset + r_byte",
      type: "register", param: "b2",
      vals: [
        [20, "=",  20, true],
        [20, "=",  21, false],

        [20, "!=", 21, true],
        [20, "!=", 20, false],

        [21, ">", 20, true],
        [20, ">", 21, false],

        [21, ">=", 20, true],
        [20, ">=", 20, true],
        [20, ">=", 21, false],

        [20, "<",  21, true],
        [21, "<",  20, false],

        [20, "<=", 21, true],
        [20, "<=", 20, true],
        [21, "<=", 20, false]
      ]
    }
  );

  breakpointCases.push(
    {
      title: "breakpoint: offset + r_word",
      type: "register", param: "w2",
      vals: [
        [0x3522, "=", 0x3522, true],
        [0x3522, "=", 0x3521, false],
        [0x3522, "=", 0x3422, false],

        [0x3522, "!=", 0x3521, true],
        [0x3522, "!=", 0x3622, true],
        [0x3522, "!=", 0x3522, false],

        [0x5555, ">", 0x5554, true],
        [0x5555, ">", 0x5455, true],
        [0x5555, ">", 0x5555, false],
        [0x5554, ">", 0x5555, false],

        [0x5555, ">=", 0x5554, true],
        [0x5555, ">=", 0x5455, true],
        [0x5555, ">=", 0x5555, true],
        [0x5554, ">=", 0x5555, false],

        [0x5554, "<", 0x5555, true],
        [0x5455, "<", 0x5555, true],
        [0x5555, "<", 0x5555, false],
        [0x5555, "<", 0x5554, false],

        [0x5554, "<=", 0x5555, true],
        [0x5455, "<=", 0x5555, true],
        [0x5555, "<=", 0x5555, true],
        [0x5555, "<=", 0x5554, false],
      ]
    }
  );

  breakpointCases.push(
    {
      title: "breakpoint: offset + zero-flag",
      type: "flag", param: "z",
      vals: [
        [true,  "=", true,  true],
        [false, "=", false, true],
        [false, "=", true,  false],
        [true,  "=", false, false],

        [false, "!=", true,  true],
        [true,  "!=", false, true],
        [true,  "!=", true,  false],
        [false, "!=", false, false]
      ]
    }
  );

  breakpointCases.push(
    {
      title: "breakpoint: offset + zero-flag",
      type: "flag", param: "c",
      vals: [
        [true,  "=", true,  true],
        [false, "=", false, true],
        [false, "=", true,  false],
        [true,  "=", false, false],

        [false, "!=", true,  true],
        [true,  "!=", false, true],
        [true,  "!=", true,  false],
        [false, "!=", false, false]
      ]
    }
  );

  breakpointCases.push(
    {
      title: "breakpoint: offset + IO",
      type: "io", param: 1,
      vals: [
        [0, "=", 0, true],
        [1, "=", 1, true],
        [1, "=", 0, false],
        [0, "=", 1, false],

        [1, "!=", 0, true],
        [0, "!=", 1, true],
        [0, "!=", 0, false],
        [1, "!=", 1, false]
      ]
    }
  );

  breakpointCases.push(
    {
      title: "breakpoint: offset + RAM-byte",
      type: "ram", param: 10,
      vals: [
        [{ 10: 42 }, "=", 42, true],
        [{ 10: 42 }, "=", 41, false],

        [{ 10: 42 }, "!=", 41, true],
        [{ 10: 42 }, "!=", 42, false],

        [{ 10: 42 }, ">", 41, true],
        [{ 10: 42 }, ">", 42, false],
        [{ 10: 42 }, ">", 43, false],

        [{ 10: 42 }, ">=", 41, true],
        [{ 10: 42 }, ">=", 42, true],
        [{ 10: 42 }, ">=", 43, false],

        [{ 10: 41 }, "<", 42, true],
        [{ 10: 42 }, "<", 42, false],
        [{ 10: 43 }, "<", 42, false],

        [{ 10: 41 }, "<=", 42, true],
        [{ 10: 42 }, "<=", 42, true],
        [{ 10: 43 }, "<=", 42, false]
      ]
    }
  );

  breakpointCases.push({
    title: "breakpoint: offset + ROM-byte",
    type: "rom", param: 10,
    vals: breakpointCases[breakpointCases.length - 1].vals
  });

  breakpointCases.push(
    {
      title: "breakpoint: offset + RAM-array",
      type: "ram", param: 10,
      vals: [
        [{ 10: 42, 11: 43 }, "=", [42, 43], true],
        [{ 10: 42, 11: 43 }, "=", [10, 43], false],
        [{ 10: 42, 11: 43 }, "=", [42, 10], false],

        [{ 10: 42, 11: 43 }, "!=", [10, 43], true],
        [{ 10: 42, 11: 43 }, "!=", [42, 10], true],
        [{ 10: 42, 11: 43 }, "!=", [42, 43], false]
      ]
    }
  );

  breakpointCases.push({
    title: "breakpoint: offset + ROM-array",
    type: "rom", param: 10,
    vals: breakpointCases[breakpointCases.length - 1].vals
  });

  for (var i = 0; i < breakpointCases.length; i++) {
    var cat = breakpointCases[i];

    for (var j = 0; j < cat.vals.length; j++) {
      var val = cat.vals[j];
      var setup = {
        breakpoints: [
          {
            offset: 0,
            condition: {
              type: cat.type,
              param: cat.param,
              operator: val[1],
              value: val[2]
            }
          }
        ]
      };

      if(cat.type === "register") {
        setup.reg = {};
        setup.reg[cat.param] = val[0];
      } else if(cat.type === "flag") {
        setup.flags = {};
        setup.flags[cat.param] = val[0];
      } else if(cat.type === "io") {
        setup.pin = {};
        setup.pin[cat.param] = val[0];
      } else if(cat.type === "ram" || cat.type === "rom") {
        setup[cat.type] = val[0];

        if(setup.breakpoints[0].condition.value instanceof Array) {
          setup.breakpoints[0].condition.value = new Uint8Array(setup.breakpoints[0].condition.value);
        }
      }

      tester.addTest({
        title: cat.title + " " + JSON.stringify(val),
        setup: setup,
        steps: [ { running: !val[3] } ]
      });
    }
  }

  tester.done();
})();