if (typeof yasp == 'undefined') yasp = { };
if (yasp.HardwareType === undefined) yasp.HardwareType = { };

(function () {
  /**
   * A simple PushButton.
   * Params: { color: 0xFFF }
   */
  yasp.HardwareType["PUSHBUTTON"] = {
    render: function() {
      var states = yasp.HardwareType.PUSHBUTTON.States;
      if (!this.element) {
        this.element = $('<div></div>');

        var locked = false;

        this.element.mousedown((function(e) {
          if(e.shiftKey) {
            locked = true;
          }
          this.receiveStateChange(states.PUSH);
        }).bind(this));
        this.element.mouseup((function(e) {
          if(e.shiftKey) {
            return;
          }
          this.receiveStateChange(states.NO_PUSH);
        }).bind(this));
        this.element.mouseleave((function() {
          if(locked) {
            return;
          }
          this.receiveStateChange(states.NO_PUSH);
        }).bind(this));

        this.element.css({
          'width': '100%',
          'height': '100%'
        });

        this.element.appendTo(this.container);
      }

      var darkCol = 'rgb(50,50,50)';
      var lightCol = 'rgb(200,200,200)';

      this.element.css({
        'background-color': (this.state == states.PUSH) ? this.params.pushcolor : this.params.color,
        'border-left': '3px solid ' + (this.state == states.PUSH ? darkCol :  lightCol),
        'border-top': '3px solid ' + (this.state == states.PUSH ? darkCol :  lightCol),
        'border-right': '3px solid ' + (this.state == states.PUSH ? lightCol :  darkCol),
        'border-bottom': '3px solid ' + (this.state == states.PUSH ? lightCol :  darkCol)
      });
    },
    initialState: function() {
      return yasp.HardwareType.PUSHBUTTON.States.NO_PUSH;
    },
    States: {
      PUSH: 1,
      NO_PUSH: 0
    }
  };
})();