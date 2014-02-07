# Instructions
An instruction in yasp consist of a single file inside the [`/src/app/instructions/`](../src/app/instructions) directory. There is no code in the
emulator or assembler dealing with specific instructions. Although some new instructions might need additional
features in the emulator.

The instructions in the `instructions`-directory are later combined into `/src/app/js/commands.js`. This is done by
the grunt-task `commandsjs` or `watchcommands`, which can be used to update the file automatically once something has
changed. Internally this is done by the [doctool](https://github.com/yasp/doctool).

## Format of an instruction file
```javascript
{
  // name of the instruction, used by the assembler to identify it in the code
  "name": "ADD",

  // documentation section
  // each instruction should be documented in English and German, but the English version is more important.
  "doc": {
    "en": {
      // general description of what this command does
      "description": "Adds the values of both registers.",

      // if the command sets any flags you should document *when* these flags are set here
      // if there are no flags set at all you can ombit the "flags"-section totally.
      "flags": {
        "z": "is set if the result is 0",
        "c": "is set if the result is greater than 255 (one byte)"
      }
    },
    "de": { /* same as "en"-version */ }
  },

  // Tests for this command, which are executed by the EmulatorTester. See /doc/testing/instructions.md for more information.
  // A testcase here must not use any commands but its own, as this is the only one available. Assembler directives may
  // be used, though.
  "tests": [ ],

  // the code is the static part of the bitcode which is representing this command. It is at the very
  // beginning of the bitcode and must be unique across all instructions since the emulator uses it
  // to identify the commands.
  // The value can be given as number literal or as string containing a binary representation of a number. Literal
  // values must not exceed one byte in length, binary values do not have a length limitation.
  "code": [
    {
      "value": 0x10
    },
    {
      "value": "000001",
      "length": 6
    }
  ],

  // The parameters of this command are used by both, the assembler and the emulator. They consist of a type and
  // a optional "valueNeeded"-attribute, which indicates that the value of a register-parameter is not used in
  // the instructions code and should not be loaded, which can give your command a serious performance boost.
  // Currently the number of parameters is restricted to 0, 1 or 2 for performance reasons.
  // The total number of bits must be divisible by 8 (no half bytes).
  "params": [
    {
      "valueNeeded": false, // since this is ADD, this should be true.. but demo, hey!
      "type": "r_byte"
    },
    {
      // valueNeeded defaults to true here
      "type": "r_byte"
    }
  ],

  // the optional checkFlags-attribute can be used to set the zero-flag automatically.
  // if this is true the emulator checks the value of the first parameter for zero and
  // sets the flag accordingly.
  "checkFlags": { "z": true },

  // function which actually executes the command
  // the parameters are of the same types as given in the params-array.
  "exec": function (rbyte1, rbyte2) {
    var newVal = rbyte1.value + rbyte2.value;
    this.writeByteRegister(rbyte1.address, newVal & 0xFF);
    this.writeFlags((newVal > 0xFF), null);
  }
}

```

### Parameter-Types
| name          | bitcode-length  | description      | `value`        | `address`       |
| ------------- | ---------------:| ---------------- | -------------- | --------------- |
| r_byte        |  5 bits         | byte-register    | register-value | register-number |
| l_byte        |  8 bits         | literal byte     | value          | null            |
| r_word        |  5 bits         | word-register    | register-value | register-number |
| l_word        | 16 bits         | literal word     | value          | null            |
| pin           |  5 bits         | pin-number       | null           | pin-number      |
| address       | 11 bits         | memory adress, label in assembler | address | null |

### `exec`-function
All parameters which are given in the `params`-array will be interpreted by the emulator and then passed on
as objects into the `exec`-function. **Do not modify these objects.** They are reused for performance reasons.
```javascript
{
  type: "",     // e.g. "r_byte"
  value: null,  // see table
  address: null // see table
}
```
There is a number of functions you can use inside the exec-function to interact with the emulator. They are documented in the [class-documenation](http://doc.yasp.me/yasp.Emulator.html).
All functions marked as private must not be called.

## Boilerplate
```javascript
{
  "name": "",
  "doc": {
    "en": {
      "description": "",
      "flags": {
        "z": "",
        "c": ""
      }
    },
    "de": {
      "description": "",
      "flags": {
        "z": "",
        "c": ""
      }
    }
  },
  "tests": [
    {
      cmd: "",
      setup: { },
      steps: { }
    }
  ],
  "code": [
    {
      "value": 0x00
    }
  ],
  "params": [
    {
      "valueNeeded": true,
      "type": "r_byte"
    }
  ],
  "checkFlags": { "z": false },
  "exec": function (rbyte) {
  }
}
```
