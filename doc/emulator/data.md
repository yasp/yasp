# Emulator

## Data
All more complex data structures used by the emulator are documented here.

### State
The emulator-state is used by `GET_STATE` and `SET_STATE` messages.
```javascript
{
  "rom": new Uint8Array(),
  "ram": new Uint8Array(),
  "stack": new Uint8Array(),
  "registers": {
    "general": {
      "b": { /* indices 0-31 */ },
      "w": { /* indices 0-31 */ }
    },
    "special": {
      "pc": 0, // programm counter
      "sp": 0  // stack pointer
    },
    "flags": {
      "C": true, // carry flag
      "Z": true  // zero flag
    }
  },
  "io": [ /* IO-States */ ]
}
```

### IO-State
State of an input or output pin. Used by the `IO_CHANGED`-Broadcast and `SET_STATE`-Message.
```javascript
{
  "pin": 0,   // pin number
  "type": "", // "adc" or "gpio"
  "mode": "", // "in" or "out"
  "state": 0, // 0-255
  "tick": 0   // tick number at which this change happened (used for timing in HW/PWM)
}
```

### Breakpoints
```javascript
{
  "offset": 0,      // byte offset, or null (to break at specific statements)
  "condition": {    // can be null
    "type": "",     // "register", "flag", "io", "ram" or "rom", see table
    "param": "",    // see table
    "operator": "", // see table
    "value": null   // number, Uint8Array or null
  }
}
```

#### Types

| type      | param                    | value                       | valid operators                           |
| --------- | ------------------------ | --------------------------- | ----------------------------------------- |
| register  | `b0 - b31` or `w0 - w31` | number (byte or word)       | `=`, `!=`, `<`, `>`, `<=`, `>=`, `change` |
| flag      | `c` or `z`               | boolean                     | `=`, `!=`, `change`                       |
| io        | pin-number               | number (byte)               | `=`, `!=`, `change`                       |
| ram       | byte-offset              | number (byte) or Uint8Array | `=`, `!=`, `<`, `>`, `<=`, `>=`, `change` |
| rom       | byte-offset              | number (byte) or Uint8Array | `=`, `!=`, `<`, `>`, `<=`, `>=`, `change` |

#### Examples

**stop at byte offset 8**

```javascript
{
  "offset": 8,
  "condition": null
}
```

**stop at byte offset 5 if pin 3 is high**

```javascript
{
  "offset": 5,
  "condition": {
    "type": "io",
    "param": 3,
    "operator": "=",
    "value": 1
  }
}
```

**stop if register `b22` is written**

```javascript
{
  "offset": null,
  "condition": {
    "type": "register",
    "param": "b22",
    "operator": "change",
    "value": null
  }
}
```

### Debug
Data-structure used by the `DEBUG`-Broadcast.

```javascript
{
  "type": "",
  "subtype": "",
  "addr": 0,
  "val": 0 // number or string
}
```

| type     | subtype    | addr                          | val    |
| -------- | ---------- | ----------------------------- | ------ |
| register | `b` or `w` | register-number (`0` to `31`) | number |
| string   | `null`     | offset in ROM                 | string |
