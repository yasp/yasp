if (typeof yasp == 'undefined') yasp = { };
if (yasp.HardwareType === undefined) yasp.HardwareType = { };

(function () {
  yasp.HardwareType['PUSHBUTTON'] = {
    'backend': null,
    'frontend': {}
  };

  yasp.HardwareType['PUSHBUTTON']['backend'] = yasp.Hardware.makeHardware({
    name: 'PUSHBUTTON',
    pins: [ { nr: 1, type: 'gpio', mode: 'out' } ],
    receiveStateChange: function (pin) {
    },
    uiEvent: function (name, pressed) {
      if(name === 'push') {
        this.getPin(1).setState(pressed ? 1 : 0, true);
      }
    },
    getState: function () {
      return {
        pushed: this.getPin(1).state
      };
    }
  });

  yasp.HardwareType['PUSHBUTTON']['frontend']['dom'] = yasp.HardwareRenderer.makeRenderer({
    create: function () {
      this.element = $('<div></div>');

      var locked = false;

      this.element.mousedown((function(e) {
        if(e.shiftKey) {
          locked = true;
        }
        this.backend.uiEvent('push', true);
      }).bind(this));
      this.element.mouseup((function(e) {
        if(e.shiftKey) {
          return;
        }
        this.backend.uiEvent('push', false);
      }).bind(this));
      this.element.mouseleave((function() {
        if(locked) {
          return;
        }
        this.backend.uiEvent('push', false);
      }).bind(this));

      this.element.css({
        'width': '100%',
        'height': '100%'
      });

      this.element.appendTo(this.container);
    },
    render: function (state) {
      var darkCol = 'rgb(50,50,50)';
      var lightCol = 'rgb(200,200,200)';

      this.element.css({
        'background-color': (state.pushed ? this.params.pushcolor : this.params.color),
        'border-width': '3px',
        'border-style': 'solid',
        'border-left-color': (state.pushed ? darkCol : lightCol),
        'border-top-color': (state.pushed ? darkCol : lightCol),
        'border-right-color': (state.pushed ? lightCol : darkCol),
        'border-bottom-color': (state.pushed ? lightCol : darkCol)
      });
    }
  });
})();