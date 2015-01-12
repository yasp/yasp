# Hardware

yasp supports arbitrary external hardware components with an arbitrary number of pins.
Each hardware consists of two components: the internal logic and the rendering. Currently
there is only a DOM mode, but this separation makes it possible to support other
frontends in the future.
Both component have full access to their super-classes functions. Please consult
the class documentation for more information on them.

Hardware is connected to the emulator via a [breadboard](./breadboard.md).

## backend ("hardware")

```javascript
yasp.Hardware.makeHardware({
  name: '',
  pins: [ /* JSON serialized pins, see /doc/hardware/iobank.md */  ],
  receiveStateChange: function (pin) {
    // Called if the state of one of the hardware pins
    // in 'in'-mode has changed. This normally happens
    // when the pin is changed by the emulator or some
    // other hardware it is connected to.
  },
  uiEvent: function (name, data) {
    // Called by the frontend to notify the logic of
    // changes in the userinterface.
    // This is for example used to set a pin, once a
    // button as been pressed.
  },
  getState: function () {
    // Called by the frontend to render this hardware.
    // The returned object should contain all information
    // necessary to do this. For example, if a button is
    // currently pressed or not, or if an LED is on.

    return { };
  }
});
```

## frontend ("hardware renderer")

```javascript
yasp.HardwareRenderer.makeRenderer({
  create: function () {
    // called once to initialize the frontend.
    // Create the main DOM element here and append it to
    // `this.container`. You should also store it in
    // `this.element` for later access in render().
  },
  render: function (state) {
    // state parameter: see backend.getState()

    // Called when the hardware should be (re-)rendered
    // Access `this.element` here again and modify it to
    // match to updated state.
  }
});
```

## Boilerplate
```javascript
if (typeof yasp == 'undefined') yasp = { };
if (yasp.HardwareType === undefined) yasp.HardwareType = { };

(function () {
  yasp.HardwareType['NAME'] = {
    'backend': null,
    'frontend': {}
  };

  yasp.HardwareType['NAME']['backend'] = yasp.Hardware.makeHardware({
    name: 'NAME',
    pins: [ { nr: 1, type: 'gpio', mode: 'IN OR OUT' } ],
    receiveStateChange: function (pin) {
    },
    uiEvent: function (name, turn) {
    },
    getState: function () {
      return {
      };
    }
  });

  yasp.HardwareType['NAME']['frontend']['dom'] = yasp.HardwareRenderer.makeRenderer({
    create: function () {
      this.element = $('<div>');
      this.element.appendTo(this.container);
    },
    render: function (state) {
    }
  });
})();
```
