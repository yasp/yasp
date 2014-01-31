(function () {
  var emulator;
  var lastEmulatorDebug = null;
  var assembler;

  module("emulator commands", {
    setup: function () {
      emulator = new yasp.Emulator();
      emulator.ticksPerTick = 1;
      emulator.forceStep = true;
      emulator.running = true;
      emulator.registerCallback("DEBUG",
        function (type, subtype, addr, val) {
          lastEmulatorDebug = {
            type: type,
            subtype: subtype,
            addr: addr,
            val: val
          }
        }
      );
      assembler = new yasp.Assembler();
    },
    teardown: function () {
      emulator = null;
      lastEmulatorDebug = null;
      assembler = null;
    }
  });

  /*
    Test-Format:
      {
        cmd: "MOV b0,b1",
        setup: { reg: { }, flags: { }, stack: { } },
        steps: [
          { reg: { }, stack: { 0: 0xFF } },
          { ram: { 0x42: 1 }, pin: { .. to be defined .. } },
          { rom: { 0x00: 0 }, flags: { c: false, z: true } }
        ]
      }

    Checkable / setable registers:
      b0 to b31 - byte registers
      w0 to b31 - word registers
      pc        - programm counter
      sp        - stack pointer

    Possible value-formats: (reg, ram, rom, stack)
      hex - 0xFF       - normal JS number literal
      dec - 255        - normal JS number literal
      bin - "1111 111" - binary format, written as string, spaces allowed

    Minimal example:
      {
        cmd: "MOV b0,b2",
        setup: { reg: { "b2": 1 } },
        steps: { reg: { "b0": 1 } }
      }
  */

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

  // PUSH
  commandTestData = commandTestData.concat([
    {
      cmd: "PUSH b0",
      setup: { reg: { "b0": 0xFA } },
      steps: { reg: { "sp": 0 }, stack: { 0: 0xFA } }
    },
    {
      cmd: "PUSH w0",
      setup: { reg: { "w0": 0xFAFB } },
      steps: { reg: { "sp": 1 }, stack: { 0: 0xFB, 1: 0xFA } }
    }
  ]);

  // POP
  commandTestData = commandTestData.concat([
    {
      cmd: "POP b0",
      setup: { reg: { "sp": 0 }, stack: [0xFA] },
      steps: { reg: { "b0": 0xFA } }
    },
    {
      cmd: "POP w0",
      setup: { reg: { "sp": 1 }, stack: [0xFB, 0xFA] },
      steps: { reg: { "w0": 0xFAFB } }
    }
  ]);

  // Stack
  commandTestData = commandTestData.concat([
    {
      cmd: "PUSH b0\nPOP b1",
      setup: { reg: { "b0": 0xFA } },
      steps: [
        {},
        { reg: { "b1": 0xFA } }
      ]
    },
    {
      cmd: "PUSH w0\nPOP w1",
      setup: { reg: { "w0": 0xFAFB } },
      steps: [
        {},
        { reg: { "w1": 0xFAFB } }
      ]
    }
  ]);

  // JMP
  commandTestData = commandTestData.concat([
    {
      cmd: "JMP lbl\nDB 0xFF\nlbl:",
      setup: { },
      steps: [
        { reg: { "pc": 3 } }
      ]
    }
  ]);

  // JZ
  commandTestData = commandTestData.concat([
    {
      cmd: "JZ lbl\nDB 0xFF\nlbl:",
      setup: { flags: { z: false } },
      steps: [
        { reg: { "pc": 2 } }
      ]
    },
    {
      cmd: "JZ lbl\nDB 0xFF\nlbl:",
      setup: { flags: { z: true } },
      steps: [
        { reg: { "pc": 3 } }
      ]
    }
  ]);

  // JNZ
  commandTestData = commandTestData.concat([
    {
      cmd: "JNZ lbl\nDB 0xFF\nlbl:",
      setup: { flags: { z: false } },
      steps: [
        { reg: { "pc": 3 } }
      ]
    },
    {
      cmd: "JNZ lbl\nDB 0xFF\nlbl:",
      setup: { flags: { z: true } },
      steps: [
        { reg: { "pc": 2 } }
      ]
    }
  ]);

  // JC
  commandTestData = commandTestData.concat([
    {
      cmd: "JC lbl\nDB 0xFF\nlbl:",
      setup: { flags: { c: false } },
      steps: [
        { reg: { "pc": 2 } }
      ]
    },
    {
      cmd: "JC lbl\nDB 0xFF\nlbl:",
      setup: { flags: { c: true } },
      steps: [
        { reg: { "pc": 3 } }
      ]
    }
  ]);

  // JNC
  commandTestData = commandTestData.concat([
    {
      cmd: "JNC lbl\nDB 0xFF\nlbl:",
      setup: { flags: { c: false } },
      steps: [
        { reg: { "pc": 3 } }
      ]
    },
    {
      cmd: "JNC lbl\nDB 0xFF\nlbl:",
      setup: { flags: { c: true } },
      steps: [
        { reg: { "pc": 2 } }
      ]
    }
  ]);

  // WRITERAM
  commandTestData = commandTestData.concat([
    {
      cmd: "WRITERAM w0,b2",
      setup: { reg: { "w0": 0xFF, "b2": 0xFA } },
      steps: [
        { ram: { 0xFF: 0xFA } }
      ]
    },
    {
      cmd: "WRITERAM w0,b2",
      setup: { ram: new Uint8Array(160), reg: { "w0": 0xFFFF, "b2": 0xFA } },
      steps: [
        { flags: { "c": true, "z": false } }
      ]
    }
  ]);

  // READRAM
  commandTestData = commandTestData.concat([
    {
      cmd: "READRAM b2,w0",
      setup: { reg: { "w0": 0x03, "b3": 0xFA } },
      steps: [
        { reg: { "b2": 0xFA } }
      ]
    }
  ]);

  // HIGH
  commandTestData = commandTestData.concat([
    {
      cmd: "HIGH 3",
      setup: { pin: { 3: false } },
      steps: [
        { pin: { 3: 1 } }
      ]
    }
  ]);

  // LOW
  commandTestData = commandTestData.concat([
    {
      cmd: "LOW 3",
      setup: { pin: { 3: true } },
      steps: [
        { pin: { 3: 0 } }
      ]
    }
  ]);

  // TOGGLE
  commandTestData = commandTestData.concat([
    {
      cmd: "TOGGLE 3",
      setup: { pin: { 3: 1 } },
      steps: [
        { pin: { 3: 0 } }
      ]
    }
  ]);
  
  // PIN
  commandTestData = commandTestData.concat([
    {
      cmd: "PIN 3",
      setup: { pin: { 3: 1 } },
      steps: [
        { flags: { z: false, c: false } }
      ]
    },
    {
      cmd: "PIN 3",
      setup: { pin: { 3: 0 } },
      steps: [
        { flags: { z: true, c: false } }
      ]
    }
  ]);

  // RETI
  commandTestData = commandTestData.concat([
    {
      cmd: "RETI",
      setup: { reg: { "sp": 1 }, stack: [ 0x42, 0x41 ] },
      steps: [
        { reg: { "pc": 0x4142 } }
      ]
    }
  ]);

  // ENABLE
  commandTestData = commandTestData.concat([
    {
      cmd: "ENABLE 42",
      setup: { },
      steps: [
        { interruptMask: [ false, true, false, true, false, true, false, false ] }
      ]
    }
  ]);

  // DISABLE
  commandTestData = commandTestData.concat([
    {
      cmd: "DISABLE",
      setup: { interruptMask: [ true, true, true, true, true, true, true, true ] },
      steps: [
        { interruptMask: [ false, false, false, false, false, false, false, false ] }
      ]
    }
  ]);

  // Interrupt-Test
  commandTestData = commandTestData.concat([
    {
      title: "Interrupt",
      cmd: "MOV b0,1",
      setup: {
        interruptMask: [ false, true, false, false, false, false, false, false ],
        rom: { 0x102: 0x00, 0x103: 66 }
      },
      steps: [
        { "triggerInterrupt": 1 },
        { "reg": { "pc": 69 } } // not 66 because there is 0x00 0x00 0x00 at that address which is MOV b0,0
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

  // CALL/RET
  commandTestData = commandTestData.concat([
    {
      title: "CALL/RET",
      cmd: "CALL lbl\n"
         + "DB 255\n"
         + "lbl:"
         + "RET",
      setup: { },
      steps: [
        { reg: { "pc": 3, "sp": 1 }, stack: [ 0x02, 0x00 ]  },
        { reg: { "pc": 2, "sp": -1 } }
      ]
    }
  ]);

  // JMPI
  commandTestData = commandTestData.concat([
    {
      cmd: "JMPI w0",
      setup: { reg: { "w0": 0xFAFB } },
      steps: [
        { reg: { "pc": 0xFAFB } }
      ]
    }
  ]);

  // POT
  commandTestData = commandTestData.concat([
    {
      cmd: "POT 10,w0",
      setup: { pin: { 10: 0xFF } },
      steps: [
        { reg: { "w0": 0x00FF } }
      ]
    }
  ]);

  // LA
  commandTestData = commandTestData.concat([
    {
      cmd: "MOV b0,0\nlbl: LA w0,lbl",
      setup: {},
      steps: [
        { }, // MOV
        { reg: { "w0": 0x0003 } }
      ]
    }
  ]);

  // ECHO
  commandTestData = commandTestData.concat([
    {
      cmd: "ECHO str\nstr: STRING foo",
      setup: {},
      steps: [
        { debug: { "addr": 5, "subtype": null, "type": "string", "val": "foo" } }
      ]
    }
  ]);

  // DEBUG
  commandTestData = commandTestData.concat([
    {
      cmd: "DEBUG w1",
      setup: { reg: { "w1": 0x0102 } },
      steps: [
        { debug: { "addr": 1, "subtype": "w", "type": "register", "val": 0x0102 } }
      ]
    },
    {
      cmd: "DEBUG b2",
      setup: { reg: { "b2": 0xFA } },
      steps: [
        { debug: { "addr": 2, "subtype": "b", "type": "register", "val": 0xFA } }
      ]
    }
  ]);

  // ADC0/1/2
  commandTestData = commandTestData.concat([
    {
      cmd: "ADC0 w1",
      setup: { pin: { 10: 0xFA } },
      steps: [
        { reg: { "w1": 0x00FA } }
      ]
    },
    {
      cmd: "ADC1 w1",
      setup: { pin: { 11: 0xFA } },
      steps: [
        { reg: { "w1": 0x00FA } }
      ]
    },
    {
      cmd: "ADC2 w1",
      setup: { pin: { 12: 0xFA } },
      steps: [
        { reg: { "w1": 0x00FA } }
      ]
    },
  ]);

  // BREAK
  commandTestData = commandTestData.concat([
    {
      cmd: "BREAK",
      setup: {},
      steps: [
        { running: false }
      ]
    }
  ]);

  // breakpoints - general
  commandTestData = commandTestData.concat([
    {
      title: "breakpoint: offset",
      cmd: "MOV b0,0\n" +
           "MOV b0,0",
      setup: { breakpoints: [ { offset: 3, condition: null } ] },
      steps: [
        { running: true },
        { running: false }
      ]
    },
    {
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
    }
  ]);

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
      } else if(cat.type === "ram") {
        setup.ram = val[0];
      } else if(cat.type === "rom") {
        setup.rom = val[0];
      }

      commandTestData.push({
        title: cat.title + " " + JSON.stringify(val),
        setup: setup,
        steps: [ { running: !val[3] } ]
      });
    }
  }

  for (var i = 0; i < commandTestData.length; i++) {
    var test = commandTestData[i];

    if(!test.title)
      test.title = test.cmd.replace(/\n/g, ' / ');
  }

  QUnit.cases(commandTestData).test("command", function (params) {
    var asm = assembler.assemble({ code: params.cmd || "", jobs: ["bitcode"] });
    ok(asm.success, "Assembling works");

    if(!asm.success)
      return;

    emulator.pc = 0;
    emulator.load(asm.bitcode, 0);

    var setup = params.setup;

    if(setup) {
      if(setup.ram) {
        if(setup.ram instanceof Uint8Array) {
          emulator.ram = setup.ram;
        } else {
          for (var a in setup.ram) {
            emulator.ram[a] = setup.ram[a];
          }
        }
      }
      if(setup.reg) {
        for (var r in setup.reg) {
          var val = parseRegValue(setup.reg[r]);

          if(r.length < 2)
          {
            ok(false, "Invalid test: setup-register " + r);
            continue;
          }

          if(r == "pc") {
            emulator.pc = val;
          } else if (r == "sp") {
            emulator.sp = val;
          } else {
            var n = +r.substr(1);

            if(r.charAt(0) === "b")
              emulator.writeByteRegister(n, val);
            else if (r.charAt(0) === "w")
              emulator.writeWordRegister(n, val);
            else
            {
              ok(false, "Invalid test: setup-register " + r + " does not exist.");
            }
          }
        }
      }
      if(setup.stack) {
        emulator.stack = setup.stack;
      }
      if(setup.pin) {
        for (var p in setup.pin) {
          emulator.setIO(p, setup.pin[p], true);
        }
      }
      if(setup.rom) {
        for (var a in setup.rom) {
          emulator.rom[a] = setup.rom[a];
        }
      }
      if(setup.interruptMask) {
        emulator.interruptMask = setup.interruptMask;
      }
      if(setup.flags) {
        if(setup.flags.z)
          emulator.flags.z = true;
        if(setup.flags.c)
          emulator.flags.c = true;
      }
      if(setup.breakpoints) {
        emulator.setBreakpoints(setup.breakpoints);
      }
    }

    params.steps = params.steps || [];

    if(!(params.steps instanceof Array))
      params.steps = [params.steps];

    for (var i = 0; i < params.steps.length; i++) {
      var step = params.steps[i];
      var stepPrefix = "Step " + (i+1) + ": ";

      emulator.running = true;
      emulator.tickWrapper();

      if(step.reg) {
        for (var r in step.reg) {
          var actual;
          var expected = parseRegValue(step.reg[r]);

          if(r.length < 2)
          {
            ok(false, stepPrefix + "Invalid test: step-register " + r);
            continue;
          }

          if(r == "pc") {
            actual = emulator.pc;
          } else if (r == "sp") {
            actual = emulator.sp;
          } else {
            var n = +r.substr(1);

            if(r.charAt(0) === "b")
              actual = emulator.readByteRegister(n);
            else if (r.charAt(0) === "w")
              actual = emulator.readWordRegister(n);
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
        var flags = emulator.readFlags();

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
          var expected = parseRegValue(step.ram[r]);
          var actual = emulator.ram[r];

          strictEqual(actual, expected, stepPrefix + "ram-byte " + r + " is " + expected);
        }
      }
      if(step.rom) {
        alert(stepPrefix +"Step-ROM-Checking is not yet implemented")
      }
      if(step.interruptMask) {
        deepEqual(emulator.interruptMask, step.interruptMask);
      }
      if(step.pin) {
        for (var p in step.pin) {
          var expected = step.pin[p];
          var actual = emulator.getIO(p);

          strictEqual(actual, expected, stepPrefix + "pin " + p + " is " + expected);
        }
      }
      if(step.triggerInterrupt) {
        emulator.scheduleInterrupt(step.triggerInterrupt);
      }
      if(step.stack) {
        for (var r in step.stack) {
          var expected = parseRegValue(step.stack[r]);
          var actual = emulator.stack[r];

          strictEqual(actual, expected, stepPrefix + "stack-entry " + r + " is " + expected);
        }
      }
      if(step.waitTime !== undefined) {
        strictEqual(emulator.waitTime, step.waitTime);
      }
      if(step.running !== undefined) {
        strictEqual(emulator.running, step.running, stepPrefix + "Emulator is " + (step.running ? "" : "not ") + "running");
      }
      if(step.debug !== undefined) {
        deepEqual(lastEmulatorDebug, step.debug, "Debug " + JSON.stringify(step.debug) + " was issued");
      }
    }

    function parseRegValue (val) {
      if(typeof val === "string")
        return parseInt(val.replace(' ', ''), 2);
      return val;
    }
  });

})();
