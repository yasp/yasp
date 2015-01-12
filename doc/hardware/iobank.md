# IOBank and Pins

IOBanks are a collection of pin-objects. Together they handle the input and output of the emulator pins and hardware.
Creating an instance is fairly simple:

```javascript

var iobank = new yasp.IOBank();
iobank.addPin(new yasp.Pin(1, "gpio", "in", false, this));
// parameters:
// * pin number
// * type ('gpio' or 'adc')
// * mode ('in' or 'out')
// * pwm
// * tickSupplier
```

## JSON
Both the IOBank and the Pins can be serialized and deserialized to JSON.

```javascript
[
    {
        "nr: 1,
        "type": "gpio",
        "mode": "out",
        "pwm": false
    }
]
```

Please refer to the Pin constructor arguments for an explanation.

## Pins

### PWM
The pins are capable of simulating PWM, in terms of calculating a pins analogue output power when a pin is rapidly
switched on and off. This is done in the `updatePWM()` helper function and only if the `pwm` parameter of the Pin
constructor was `true`.
Note that this behaviour only used when the pins state changes more often than 10 times a second, otherwise the state
of the pin will always be `1` or `0`. PWM causes the state to be between `1` and `255`.

```
 Impulse
     +--+
     |  |
   --+  +------------------


 Pulse
     +--+  +--+  +--+  +--+  +--+
     |  |  |  |  |  |  |  |  |  |
   --+  +--+  +--+  +--+  +--+  +--

 Pulse width modulation
     t   t
      on  off
     <--><-->
     +---+  +---+  +---+  +---+  +-- ...
     |   |  |   |  |   |  |   |  |
   --+   +--+   +--+   +--+   +--+
     |<---->|<---->|<---->|<---->|
       t
        const

    t   +  t     = t
     on     off     const

 Calculation of the output power

     1234566789
     +---+  +---+  +---+  +---+  +-- ...
     |   |  |   |  |   |  |   |  |
   --+   +--+   +--+   +--+   +--+

    startOn1 = 1
    startOff = 5
    startOn2 = 7

    t    = startOff - startOn1 = 4
     on

    t    = startOff - startOn2 = 2
     off

             t
              on             4       2
    x =  --------------  =  ---  =  ---  = 66.66%
          t    +  t          6       3
           off     on
```

### tickSupplier
For PWM to work, the pin needs a way of telling how much time elapsed between the high and low flanks. This is achived
by the `tickSupplier`. Normally this is the emulator instance, but any object having a `getTicks()`-function can be
set here. The ticks must be a number and monotonically nondecreasing, so each time `setState()` is called from the
outside, `getTicks()` must return a higher and non-equal number than the last time.
