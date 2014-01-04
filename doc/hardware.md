# Hardware
All hardware elements in yasp share a common interface, which allows the breadboard to set and get their state but also
set parameters like their color. A hardware element should always fill up all space given in its wrapper-element.
Additionally it must not communicate with the emulator, but rely on the breadboard to do this. It should also never be
initialized by itself, but defined in a breadboard file.

For more information about breadboards take a look at [`breadboards.md`](breadboards.md).

Hardware-implementations can be found in the [`/src/app/js/hardware/`](/src/app/js/hardware/)-directory.

## Types
Currently implemented hardware types are:
* `LED`
* `PUSHBUTTON`
* `POTI`

They are documented in the [`/doc/hardware/`](/doc/hardware/)-directory.

## Boilerplate
```javascript
if (typeof yasp == 'undefined') yasp = { };
if (yasp.HardwareType === undefined) yasp.HardwareType = { };

(function () {
  /**
   * ... description ...
   * Params: { }
   */
  yasp.HardwareType["PUSHBUTTON"] = {
    render: function() {
      if (!this.element) {
        // the hardware must set the this.element property
        this.element = document.createElement('div');

        // change the state, probably because the user interacted with the UI
        this.receiveStateChange(1);
      }

      // render the hardware here..
    },
    initialState: function() {
      return 0;
    }
  };
})();
```
