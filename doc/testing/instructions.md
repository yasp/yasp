# Testing

## Commands
Testing the individual commands such as `MOV` is handled by the [EmulatorTester](http://doc.yasp.me/yasp.test.EmulatorTester.html).
This class has two basic methods: `addTest` and `done`, which should be called in this order. The only argument of `addTest` is
the test-case, which looks like this:

```javascript
{
    cmd: "",
    setup: { },
    steps: [ { } ]
}
```

All three of these attributes are optional. A single step can also be written as `steps: { }`.

## Process
The EmulatorTester then takes these values and does the following:
1. create an Emulator and Assembler
2. assemble the given `cmd`
3. set the `PC` to `0`
4. set all the values given in `setup`
5. load the bitcode from assembler into the emulator
4. step exactly the number of steps given, do each time:
  1. execute one step in the emulator
  2. check all values that should be checked
  3. execute the setup given in `ss`

## `setup`
* `ram`
  * `Uint8Array` replace the entire RAM
  * `object` replace indivitual bytes in the RAM
     like so: `{ 10: 42 }` writes `42` to byte `10`
* `rom` see `ram`
* `stack` see `ram`
* `reg` (`object`) change the value of an register: `{ b0: 10, pc: 3 }` possible registers:
  * `b0` - `b31` byte registers
  * `w0` - `w31` word registers
  * `pc` programm counter
  * `sp` stack pointer
* `pin` (`object`) set the state of an input or output pin: `{ 3: 1 }`
* `interruptMask` (`number`) set the interrupt-mask, see [Tutorial](./tutorial.md#interrupts)
* `triggerInterrupt` (`number`)
* `flag` (`object`) set the carry or zero flag: `{ c: true }`
* `breakpoints` array of breakpoints, see [Emulator Documentation](./emulator/data.md#breakpoints)

## `steps`
Step is an array of step-objects. If there is just one step the array can be omitted: `steps: { }`. A step executes a
number of checks and the issues QUnit-asserts to make sure commands work as intended. All valid steps:
* `ram` check individual bytes of the RAM: `{ 10: 42 }` (offset `10` is `42`)
* `rom` see `ram`
* `stack` see `ram`
* `reg` see `setup.reg`
* `pin` see `setup.pin`
* `interruptMask` see `setup.interruptMask`
* `flags` see `setup.flags`
* `waitTime` (`number`) check `DELAY`-instructions
* `running` (`boolean`) check if the emulator is running (`true`) or not (`false`).
* `debug` check if a debug message has been issued, see [Emulator Documentation](./emulator/data.md#debug)
* `ss` (`object`) execute an other setup. This is done **after** all the checks.

## Format of literal values
Values which are allowed for all literals, like `42` in `{ reg: { b0: 42 } }`:
* `hex` - `0xFF` - normal javascript number literal
* `dec` - `255` - normal javascript number literal
* `bin` - `"1111111"` - binary format, written as string, spaces are allowed

## Full example

```javascript
var tester = new yasp.test.EmulatorTester("demonstration");

tester.addTest({
    cmd: "ADD b0, 1",
    setup: { reg: { "b0": 0xFF } },
    steps: { reg: { "b0": 0 }, flags: { c: true, z: true } }
});

tester.addTest({
  cmd: "INV b0",
  setup: { reg: { "b0": "00000001" } },
  steps: { reg: { "b0": "11111110" }, flags: { c: false, z: false } }
});

tester.done();
```
