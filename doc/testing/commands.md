# Testing

## Commands
Testing the indivitual commands such as `MOV` is handled by the [EmulatorTester](http://doc.yasp.me/yasp.test.EmulatorTester.html).
This class has two basic methods: `addTest` and `done`, which should be called in this order. The only argument of `addTest` is
the test-case, which looks like this:

```javascript
{
    cmd: "",
    setup: { },
    steps: [ { } ]
}
```

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
* `reg`
* `stack`
* `pin`
* `rom`
* `interruptMask`
* `triggerInterrupt`
* `flag`
* `breakpoints`

## `steps`
* `reg`
* `flags`
* `ram`
* `rom`
* `interruptMask`
* `pin`
* `stack`
* `waitTime`
* `running`
* `debug`
* `ss`

## Format of literal values
Possible formats:
* hex - 0xFF      - normal javascript number literal
* dec - 255       - normal javascript number literal
* bin - "1111111" - binary format, written as string, spaces are allowed

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
  steps: { reg: { "b0": "11111110" }, flags: { c:false, z: false } }
});

tester.done();
```
