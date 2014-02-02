(function () {
  var tester = new yasp.test.EmulatorTester("Basic");

  var commandTestData = [];

  // MOV
  commandTestData = commandTestData.concat([
    {
      cmd: "MOV b0,1",
      steps: { reg: { "b0": 1 } }
    },
    {
      cmd: "MOV b0,b1",
      setup: { reg: { "b1": 1 } },
      steps: { reg: { "b0": 1 } }
    },
    {
      cmd: "MOV w0,0xFFAA",
      steps: { reg: { "w0": 0xFFAA } }
    },
    {
      cmd: "MOV w0,w1",
      setup: { reg: { "w1": 0xFFAA } },
      steps: { reg: { "w0": 0xFFAA } }
    }
  ]);

  // ADD b,b
  commandTestData = commandTestData.concat([
    {
      cmd: "ADD b0,b1",
      setup: { reg: { "b0": 1, "b1": 1 } },
      steps: { reg: { "b0": 2 }, flags: { c: false, z: false } }
    },
    {
      cmd: "ADD b0,b1",
      setup: { reg: { "b0": 255, "b1": 2 } },
      steps: { reg: { "b0": 1 }, flags: { c: true, z: false } }
    },
    {
      cmd: "ADD b0,b1",
      setup: { reg: { "b0": 0xFF, "b1": 1 } },
      steps: { reg: { "b0": 0 }, flags: { c: true, z: true } }
    }
  ]);

  // ADD b,l
  commandTestData = commandTestData.concat([
    {
      cmd: "ADD b0,1",
      setup: { reg: { "b0": 1 } },
      steps: { reg: { "b0": 2 }, flags: { c: false, z: false } }
    },
    {
      cmd: "ADD b0,2",
      setup: { reg: { "b0": 0xFF } },
      steps: { reg: { "b0": 1 }, flags: { c: true, z: false } }
    },
    {
      cmd: "ADD b0,1",
      setup: { reg: { "b0": 0xFF } },
      steps: { reg: { "b0": 0 }, flags: { c: true, z: true } }
    }
  ]);

  // ADD w,l
  commandTestData = commandTestData.concat([
    {
      cmd: "ADD w0,1",
      setup: { reg: { "w0": 0x02FA } },
      steps: { reg: { "w0": 0x02FB }, flags: { c: false, z: false } }
    },
    {
      cmd: "ADD w0,2",
      setup: { reg: { "w0": 0xFFFF } },
      steps: { reg: { "w0": 0x0001 }, flags: { c: true, z: false } }
    },
    {
      cmd: "ADD w0,1",
      setup: { reg: { "w0": 0xFFFF } },
      steps: { reg: { "w0": 0x0000 }, flags: { c: true, z: true } }
    }
  ]);

  // ADD w,w
  commandTestData = commandTestData.concat([
    {
      cmd: "ADD w0,w1",
      setup: { reg: { "w0": 0x0A10, "w1": 0x01FF } },
      steps: { reg: { "w0": 0x0C0F }, flags: { c: false, z: false } }
    },
    {
      cmd: "ADD w0,w1",
      setup: { reg: { "w0": 0xFFFF, "w1": 0x0002 } },
      steps: { reg: { "w0": 0x0001 }, flags: { c: true, z: false } }
    },
    {
      cmd: "ADD w0,w1",
      setup: { reg: { "w0": 0xFFFF, "w1": 0x0001 } },
      steps: { reg: { "w0": 0x0000 }, flags: { c: true, z: true } }
    }
  ]);

  // SUB b,b
  commandTestData = commandTestData.concat([
    {
      cmd: "SUB b0,b1",
      setup: { reg: { "b0": 2, "b1": 1 } },
      steps: { reg: { "b0": 1 }, flags: { c: false, z: false } }
    },
    {
      cmd: "SUB b0,b1",
      setup: { reg: { "b0": 1, "b1": 2 } },
      steps: { reg: { "b0": 255 }, flags: { c: true, z: false } }
    },
    {
      cmd: "SUB b0,b1",
      setup: { reg: { "b0": 1, "b1": 1 } },
      steps: { reg: { "b0": 0 }, flags: { c: false, z: true } }
    }
  ]);

  // SUB b,l
  commandTestData = commandTestData.concat([
    {
      cmd: "SUB b0,1",
      setup: { reg: { "b0": 2 } },
      steps: { reg: { "b0": 1 }, flags: { c: false, z: false } }
    },
    {
      cmd: "SUB b0,2",
      setup: { reg: { "b0": 1 } },
      steps: { reg: { "b0": 255 }, flags: { c: true, z: false } }
    },
    {
      cmd: "SUB b0,1",
      setup: { reg: { "b0": 1 } },
      steps: { reg: { "b0": 0 }, flags: { c: false, z: true } }
    }
  ]);

  // SUB w,l
  commandTestData = commandTestData.concat([
    {
      cmd: "SUB w0,1",
      setup: { reg: { "w0": 0xFF00 } },
      steps: { reg: { "w0": 0xFEFF }, flags: { c: false, z: false } }
    },
    {
      cmd: "SUB w0,1",
      setup: { reg: { "w0": 0x0000 } },
      steps: { reg: { "w0": 0xFFFF }, flags: { c: true, z: false } }
    },
    {
      cmd: "SUB w0,0x0F01",
      setup: { reg: { "w0": 0x0F01 } },
      steps: { reg: { "w0": 0x0000 }, flags: { c: false, z: true } }
    }
  ]);

  // SUB w,w
  commandTestData = commandTestData.concat([
    {
      cmd: "SUB w0,w1",
      setup: { reg: { "w0": 0xFF00, "w1": 0x0001 } },
      steps: { reg: { "w0": 0xFEFF }, flags: { c: false, z: false } }
    },
    {
      cmd: "SUB w0,w1",
      setup: { reg: { "w0": 0x0000, "w1": 0x0001 } },
      steps: { reg: { "w0": 0xFFFF }, flags: { c: true, z: false } }
    },
    {
      cmd: "SUB w0,w1",
      setup: { reg: { "w0": 0x0F01, "w1": 0x0F01 } },
      steps: { reg: { "w0": 0x0000 }, flags: { c: false, z: true } }
    }
  ]);

  // RR
  commandTestData = commandTestData.concat([
    {
      cmd: "RR b0",
      setup: { reg: { "b0": "01000000" } },
      steps: { reg: { "b0": "00100000" }, flags: { c: false, z: false } }
    },
    {
      cmd: "RR b0",
      setup: { reg: { "b0": "01000001" } },
      steps: { reg: { "b0": "00100000" }, flags: { c: true, z: false } }
    },
    {
      cmd: "RR w0",
      setup: { reg: { "w0": "00011111 11111000" } },
      steps: { reg: { "w0": "00001111 11111100" }, flags: { c: false, z: false } }
    },
    {
      cmd: "RR w0",
      setup: { reg: { "w0": "11111111 10101011" } },
      steps: { reg: { "w0": "01111111 11010101" }, flags: { c: true, z: false } }
    }
  ]);

  // RL
  commandTestData = commandTestData.concat([
    {
      cmd: "RL b0",
      setup: { reg: { "b0": "01000000" } },
      steps: { reg: { "b0": "10000000" }, flags: { c: false, z: false } }
    },
    {
      cmd: "RL b0",
      setup: { reg: { "b0": "10000000" } },
      steps: { reg: { "b0": "00000000" }, flags: { c: true, z: false } }
    },
    {
      cmd: "RL w0",
      setup: { reg: { "w0": "01111111 10101010" } },
      steps: { reg: { "w0": "11111111 01010100" }, flags: { c: false, z: false } }
    },
    {
      cmd: "RL w0",
      setup: { reg: { "w0": "11111111 10101010" } },
      steps: { reg: { "w0": "11111111 01010100" }, flags: { c: true, z: false } }
    }
  ]);

  // CLR-Commands
  commandTestData = commandTestData.concat([
    {
      cmd: "CLR b0",
      setup: { reg: { "b0": 0xFF } },
      steps: { reg: { "b0": 0 }, flags: { c: false, z: true } }
    },
    {
      cmd: "CLR w0",
      setup: { reg: { "w0": 0xFFFF } },
      steps: { reg: { "w0": 0 }, flags: { c: false, z: true } }
    }
  ]);

  // INC b
  commandTestData = commandTestData.concat([
    {
      cmd: "INC b0",
      setup: { reg: { "b0": 0x00 } },
      steps: { reg: { "b0": 0x01 }, flags: { c: false, z: false } }
    },
    {
      cmd: "INC b0",
      setup: { reg: { "b0": 0xFF } },
      steps: { reg: { "b0": 0x00 }, flags: { c: true, z: true } }
    }
  ]);

  // INC w
  commandTestData = commandTestData.concat([
    {
      cmd: "INC w0",
      setup: { reg: { "w0": 0x0FFF } },
      steps: { reg: { "w0": 0x1000 }, flags: { c: false, z: false } }
    },
    {
      cmd: "INC w0",
      setup: { reg: { "w0": 0xFFFF } },
      steps: { reg: { "w0": 0x0000 }, flags: { c: true, z: true } }
    }
  ]);

  // DEC b
  commandTestData = commandTestData.concat([
    {
      cmd: "DEC b0",
      setup: { reg: { "b0": 0x02 } },
      steps: { reg: { "b0": 0x01 }, flags: { c: false, z: false } }
    },
    {
      cmd: "DEC b0",
      setup: { reg: { "b0": 0x01 } },
      steps: { reg: { "b0": 0x00 }, flags: { c: false, z: true } }
    },
    {
      cmd: "DEC b0",
      setup: { reg: { "b0": 0x00 } },
      steps: { reg: { "b0": 0xFF }, flags: { c: true, z: false } }
    }
  ]);

  // DEC w
  commandTestData = commandTestData.concat([
    {
      cmd: "DEC w0",
      setup: { reg: { "w0": 0xFF00 } },
      steps: { reg: { "w0": 0xFEFF }, flags: { c: false, z: false } }
    },
    {
      cmd: "DEC w0",
      setup: { reg: { "w0": 0x0001 } },
      steps: { reg: { "w0": 0x0000 }, flags: { c: false, z: true } }
    },
    {
      cmd: "DEC w0",
      setup: { reg: { "w0": 0x0000 } },
      steps: { reg: { "w0": 0xFFFF }, flags: { c: true, z: false } }
    }
  ]);

  // INV-Commands
  commandTestData = commandTestData.concat([
    {
      cmd: "INV b0",
      setup: { reg: { "b0": "00000001" } },
      steps: { reg: { "b0": "11111110" }, flags: { c:false, z: false } }
    },
    {
      cmd: "INV b0",
      setup: { reg: { "b0": "11111111" } },
      steps: { reg: { "b0": "00000000" }, flags: { c:false, z: true } }
    },
    {
      cmd: "INV w0",
      setup: { reg: { "w0": "00000000 00000001" } },
      steps: { reg: { "w0": "11111111 11111110" }, flags: { c:false, z: false } }
    },
    {
      cmd: "INV w0",
      setup: { reg: { "w0": "11111111 11111111" } },
      steps: { reg: { "w0": "00000000 00000000" }, flags: { c:false, z: true } }
    }
  ]);

  // OR b,b
  commandTestData = commandTestData.concat([
    {
      cmd: "OR b0,b1",
      setup: { reg: { "b0": "01010101",
        "b1": "01000011" } },
      steps: { reg: { "b0": "01010111" }, flags: { c: false, z: false } }
    },
    {
      cmd: "OR b0,b1",
      setup: { reg: { "b0": "00000000",
        "b1": "00000000" } },
      steps: { reg: { "b0": "00000000" }, flags: { c: false, z: true } }
    }
  ]);

  // OR b,l
  commandTestData = commandTestData.concat([
    {
      cmd: "OR b0,67", // 01000011
      setup: { reg: { "b0": "01010101" } },
      steps: { reg: { "b0": "01010111" }, flags: { c: false, z: false } }
    },
    {
      cmd: "OR b0,0",
      setup: { reg: { "b0": "00000000" } },
      steps: { reg: { "b0": "00000000" }, flags: { c: false, z: true } }
    }
  ]);

  // OR w,w
  commandTestData = commandTestData.concat([
    {
      cmd: "OR w0,w1",
      setup: { reg: { "w0": "01010101 10101010",
        "w1": "01000011 11000010" } },
      steps: { reg: { "w0": "01010111 11101010" }, flags: { c: false, z: false } }
    },
    {
      cmd: "OR w0,w1",
      setup: { reg: { "w0": "00000000 00000000",
        "w1": "00000000 00000000" } },
      steps: { reg: { "w0": "00000000 00000000" }, flags: { c: false, z: true } }
    }
  ]);

  // OR w,l
  commandTestData = commandTestData.concat([
    {
      cmd: "OR w0,17346", // 01000011 11000010
      setup: { reg: { "w0": "01010101 10101010" } },
      steps: { reg: { "w0": "01010111 11101010" }, flags: { c: false, z: false } }
    },
    {
      cmd: "OR w0,0",
      setup: { reg: { "w0": "00000000 00000000" } },
      steps: { reg: { "w0": "00000000 00000000" }, flags: { c: false, z: true } }
    }
  ]);

  // AND b,b
  commandTestData = commandTestData.concat([
    {
      cmd: "AND b0,b1",
      setup: { reg: { "b0": "01010101",
        "b1": "01000011" } },
      steps: { reg: { "b0": "01000001" }, flags: { c: false, z: false } }
    },
    {
      cmd: "AND b0,b1",
      setup: { reg: { "b0": "11000000",
        "b1": "00000011" } },
      steps: { reg: { "b0": "00000000" }, flags: { c: false, z: true } }
    }
  ]);

  // AND b,l
  commandTestData = commandTestData.concat([
    {
      cmd: "AND b0,67", // 01000011
      setup: { reg: { "b0": "01010101" } },
      steps: { reg: { "b0": "01000001" }, flags: { c: false, z: false } }
    },
    {
      cmd: "AND b0,1",
      setup: { reg: { "b0": "10000000" } },
      steps: { reg: { "b0": "00000000" }, flags: { c: false, z: true } }
    }
  ]);

  // AND w,w
  commandTestData = commandTestData.concat([
    {
      cmd: "AND w0,w1",
      setup: { reg: { "w0": "01010101 10101010",
        "w1": "01000011 11000010" } },
      steps: { reg: { "w0": "01000001 10000010" }, flags: { c: false, z: false } }
    },
    {
      cmd: "AND w0,w1",
      setup: { reg: { "w0": "00100000 00000100",
        "w1": "10000000 00000001" } },
      steps: { reg: { "w0": "00000000 00000000" }, flags: { c: false, z: true } }
    }
  ]);

  // AND w,l
  commandTestData = commandTestData.concat([
    {
      cmd: "AND w0,17346", //01000011 11000010
      setup: { reg: { "w0": "01010101 10101010" } },
      steps: { reg: { "w0": "01000001 10000010" }, flags: { c: false, z: false } }
    },
    {
      cmd: "AND w0,514", //  00000010 00000010
      setup: { reg: { "w0": "00000100 00010000" } },
      steps: { reg: { "w0": "00000000 00000000" }, flags: { c: false, z: true } }
    }
  ]);

  // XOR b,b
  commandTestData = commandTestData.concat([
    {
      cmd: "XOR b0,b1",
      setup: { reg: { "b0": "01010101",
        "b1": "01000011" } },
      steps: { reg: { "b0": "00010110" }, flags: { c: false, z: false } }
    },
    {
      cmd: "XOR b0,b1",
      setup: { reg: { "b0": "11000000",
        "b1": "11000000" } },
      steps: { reg: { "b0": "00000000" }, flags: { c: false, z: true } }
    }
  ]);

  // XOR b,l
  commandTestData = commandTestData.concat([
    {
      cmd: "XOR b0,67", //   01000011
      setup: { reg: { "b0": "01010101" } },
      steps: { reg: { "b0": "00010110" }, flags: { c: false, z: false } }
    },
    {
      cmd: "XOR b0,3",
      setup: { reg: { "b0": "00000011" } },
      steps: { reg: { "b0": "00000000" }, flags: { c: false, z: true } }
    }
  ]);

  // XOR w,w
  commandTestData = commandTestData.concat([
    {
      cmd: "XOR w0,w1",
      setup: { reg: { "w0": "01010101 10101010",
        "w1": "01000011 11000010" } },
      steps: { reg: { "w0": "00010110 01101000" }, flags: { c: false, z: false } }
    },
    {
      cmd: "XOR w0,w1",
      setup: { reg: { "w0": "00100000 00000100",
        "w1": "00100000 00000100" } },
      steps: { reg: { "w0": "00000000 00000000" }, flags: { c: false, z: true } }
    }
  ]);

  // XOR w,l
  commandTestData = commandTestData.concat([
    {
      cmd: "XOR w0,17346", //01000011 11000010
      setup: { reg: { "w0": "01010101 10101010" } },
      steps: { reg: { "w0": "00010110 01101000" }, flags: { c: false, z: false } }
    },
    {
      cmd: "XOR w0,514",  // 00000010 00000010
      setup: { reg: { "w0": "00000010 00000010" } },
      steps: { reg: { "w0": "00000000 00000000" }, flags: { c: false, z: true } }
    }
  ]);

  // CMP b,b
  commandTestData = commandTestData.concat([
    {
      cmd: "CMP b0,b1 ;equal",
      setup: { reg: { "b0": 1, "b1": 1 } },
      steps: { flags: { c: false, z: true } }
    },
    {
      cmd: "CMP b0,b1 ;1st bigger",
      setup: { reg: { "b0": 1, "b1": 0 } },
      steps: { flags: { c: false, z: false } }
    },
    {
      cmd: "CMP b0,b1 ;2nd bigger",
      setup: { reg: { "b0": 0, "b1": 1 } },
      steps: { flags: { c: true, z: false } }
    }
  ]);

  // CMP b,l
  commandTestData = commandTestData.concat([
    {
      cmd: "CMP b0,1 ;equal",
      setup: { reg: { "b0": 1 } },
      steps: { flags: { c: false, z: true } }
    },
    {
      cmd: "CMP b0,0 ;1st bigger",
      setup: { reg: { "b0": 1 } },
      steps: { flags: { c: false, z: false } }
    },
    {
      cmd: "CMP b0,1 ;2nd bigger",
      setup: { reg: { "b0": 0 } },
      steps: { flags: { c: true, z: false } }
    }
  ]);

  // CMP w,w
  commandTestData = commandTestData.concat([
    {
      cmd: "CMP w0,w1 ;equal",
      setup: { reg: { "w0": 0x0001, "w1": 0x0001 } },
      steps: { flags: { c: false, z: true } }
    },
    {
      cmd: "CMP w0,w1 ;1st bigger",
      setup: { reg: { "w0": 0xAB00, "w1": 0xAA00 } },
      steps: { flags: { c: false, z: false } }
    },
    {
      cmd: "CMP w0,w1 ;1st bigger",
      setup: { reg: { "w0": 0x0001, "w1": 0x0000 } },
      steps: { flags: { c: false, z: false } }
    },
    {
      cmd: "CMP w0,w1 ;2nd bigger",
      setup: { reg: { "w0": 0xAA00, "w1": 0xAB00 } },
      steps: { flags: { c: true, z: false } }
    },
    {
      cmd: "CMP w0,w1 ;2nd bigger",
      setup: { reg: { "w0": 0x0000, "w1": 0x0001 } },
      steps: { flags: { c: true, z: false } }
    }
  ]);

  // CMP w,l
  commandTestData = commandTestData.concat([
    {
      cmd: "CMP w0,0x0001 ;equal",
      setup: { reg: { "w0": 0x0001 } },
      steps: { flags: { c: false, z: true } }
    },
    {
      cmd: "CMP w0,0xAA00 ;1st bigger",
      setup: { reg: { "w0": 0xAB00 } },
      steps: { flags: { c: false, z: false } }
    },
    {
      cmd: "CMP w0,0x0000 ;1st bigger",
      setup: { reg: { "w0": 0x0001 } },
      steps: { flags: { c: false, z: false } }
    },
    {
      cmd: "CMP w0,0xAB00 ;2nd bigger",
      setup: { reg: { "w0": 0xAA00 } },
      steps: { flags: { c: true, z: false } }
    },
    {
      cmd: "CMP w0,0x0001 ;2nd bigger",
      setup: { reg: { "w0": 0x0000 } },
      steps: { flags: { c: true, z: false } }
    }
  ]);

  // MUL
  commandTestData = commandTestData.concat([
    {
      cmd: "MUL w0,w1",
      setup: { reg: { "w0": 0xFF10, "w1": 0xFF02 } },
      steps: { reg: { "w0": 0x0020 } }
    },
    {
      cmd: "MUL w0,w1",
      setup: { reg: { "w0": 0x00FF, "w1": 0x00FF } },
      steps: { reg: { "w0": 0xFE01 } }
    }
  ]);

  // DIV
  commandTestData = commandTestData.concat([
    {
      cmd: "DIV w0,w1",
      setup: { reg: { "w0": 0x00FA, "w1": 0xFF02 } },
      steps: { reg: { "w0": 0x7D } }
    },
    {
      cmd: "DIV w0,w1",
      setup: { reg: { "w0": 0xFF10, "w1": 0xFF02 } },
      steps: { reg: { "w0": 0x7F88 } }
    },
    {
      cmd: "DIV w0,w1",
      setup: { reg: { "w0": 0x000F, "w1": 0xFF02 } },
      steps: { reg: { "w0": 0x0007 } }
    }
  ]);

  // PAUSE/DELAY register
  commandTestData = commandTestData.concat([
    {
      cmd: "PAUSE w0",
      setup: { reg: { "w0": 1000 } },
      steps: [
        { waitTime: 15 }
      ]
    },
    {
      cmd: "DELAY w0",
      setup: { reg: { "w0": 1000 } },
      steps: [
        { waitTime: 15 }
      ]
    }
  ]);

  // PAUSE/DELAY literal
  commandTestData = commandTestData.concat([
    {
      cmd: "PAUSE 1000",
      setup: { },
      steps: [
        { waitTime: 15 }
      ]
    },
    {
      cmd: "DELAY 1000",
      setup: { },
      steps: [
        { waitTime: 15 }
      ]
    }
  ]);

  // RANDOM
  commandTestData = commandTestData.concat([
    {
      cmd: "RANDOM b1",
      setup: { },
      steps: [
        { }
      ]
    }
  ]);

  tester.addTests(commandTestData);
  tester.done();
})();