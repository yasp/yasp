# Emulator

## Broadcasts
Some broadcasts (`DEBUG` and `IO_CHANGED`) are rate-limited due to the poor webworker-implementation of firefox.

### Broadcast: `BREAK`
The emulator has been stopped by a `BREAK`-Message, breakpoint, etc.
#### Payload
```javascript
{
  "state": { }, // see State in doc/emulator/data.md
  "reason": ""
}
```
Reasons:
* `count`: the number of instructions to be executed has been reached, see `CONTINUE`-Message
* `break_instr`: the `BREAK`-Instruction was executed
* `divide_by_zero`: the value of the second register of a `DIV`-Instruction was zero
* `break_msg`: a `BREAK`-Message has been issued
* `invalid_instr`: a invalid instruction has been found
* `breakpoint`: a breakpoint has been hit

### Broadcast: `CONTINUE`
The emulator has continued, this is caused by a `CONTINUE`-Message.
#### Payload
```javascript
{
  running: 0 // new state of the emulator (true, false or Number)
}
```

### Broadcast: `LOADED`
A program has been loaded into the emulator using the `LOAD`-Message.
#### Payload
```javascript
{
  start: 0,
  length: 0
}
```

### Broadcast: `DEBUG`
A `DEBUG` or `ECHO`-Instruction was executed. These instructions can send the value of an register or a string stored
in the ROM to the debugger. This broadcast is rate-limited to only be fired every 100 milliseconds.
#### Payload
```javascript
[
  { /* debug-object, see Data-section in emulator-documentation */ }
]
```

### Broadcast: `IO_CHANGED`
The state of the emulators output-pins has changed. This broadcast is rate-limited to only be fired every 50 ms for
**each pin**, so the real number of broadcasts can be higher.
#### Payload
IO-State-object, see Data-section in emulator-documentation.

### Broadcast: ``
#### Payload
```javascript
```

## Messages

### Message: `LOAD`
Load bitcode (probably form the assembler) into the ROM to be executed later
#### Message-Payload
```javascript
{
  "bitcode": new Uint8Array(),
  "start": 0 // byte offset to start loading
}
```

#### Response-Payload
empty object

#### Error-Payloads
| code | error                      |
| ---- | -------------------------- |
| 0    | start is out of bounds     |
| 1    | bitcode array too large    |
| 2    | bitcode is of invalid type |
| 3    | start is of invalid type   |

### Message: `CONTINUE`
Start or continue the exeuction of bitcode in the ROM. The `count`-parameter can be used to control the number of
instructions executed, which is used to step through a program instead of running it. If the `skipBreakpoint`-parameter
is set to `true` the execution will even be continued if the current instruction has a breakpoint set.
#### Message-Payload
```javascript
{
  "count": null, // null = run unlimited steps, number = run only x steps
  "skipBreakpoint": false
}
```

#### Response-Payload
empty object

#### Error-Payloads
| code | error                             |
| ---- | --------------------------------- |
| 0    | count is negative                 |
| 1    | count is of invalid type          |
| 2    | skipBreakpoint is of invalid type |

### Message: `BREAK`
Stops the execution. This will also cause a `BREAK`-broadcast to be issued.
#### Message-Payload
empty object

#### Response-Payload
empty object

#### Error-Payloads
none

### Message: `GET_STATE`
Get the current state of the emulator, such as registers, `pc`, stack, and so on.
#### Message-Payload
empty object

#### Response-Payload
state-object, see Data-section in emulator-documentation

#### Error-Payloads
none

### Message: `SET_STATE`
Sets the current state of the emulator.
#### Message-Payload
state-object, see Data-section in emulator-documentation

#### Response-Payload
empty object

#### Error-Payloads
none