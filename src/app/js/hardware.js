if (typeof yasp == 'undefined') yasp = { };

(function() {
  /**
   * HardwareType of a Hardware (used to display data correctly)
   * @type {{PUSHBUTTON: {render: Function}, LED: {render: Function}, POTI: {render: Function}}}
   */
  yasp.HardwareType = {
    /**
     * A simple PushButton.
     * Params: { color: 0xFFF }
     */
    PUSHBUTTON: {
      render: function() {
        this.element = $('<div></div>');
        
        var darkCol = 'rgb(50,50,50)';
        var lightCol = 'rgb(200,200,200)';
        
        this.element.css({
          'width': '100%',
          'height': '100%',
          'background-color': (this.state == yasp.HardwareType.PUSHBUTTON.States.PUSH) ? this.params.pushcolor : this.params.color,
          'border-left': '3px solid ' + (this.state == yasp.HardwareType.PUSHBUTTON.States.PUSH ? darkCol :  lightCol),
          'border-top': '3px solid ' + (this.state == yasp.HardwareType.PUSHBUTTON.States.PUSH ? darkCol :  lightCol),
          'border-right': '3px solid ' + (this.state == yasp.HardwareType.PUSHBUTTON.States.PUSH ? lightCol :  darkCol),
          'border-bottom': '3px solid ' + (this.state == yasp.HardwareType.PUSHBUTTON.States.PUSH ? lightCol :  darkCol)
        });
        
        this.element.mousedown((function() {
          this.receiveStateChange(yasp.HardwareType.PUSHBUTTON.States.PUSH);
        }).bind(this));
        this.element.mouseup((function() {
          this.receiveStateChange(yasp.HardwareType.PUSHBUTTON.States.NO_PUSH);
        }).bind(this));
        this.element.mouseleave((function() {
          this.receiveStateChange(yasp.HardwareType.PUSHBUTTON.States.NO_PUSH);
        }).bind(this));
        
        this.element.appendTo(this.container);
      },
      initialState: function() {
        return yasp.HardwareType.PUSHBUTTON.States.NO_PUSH;
      },
      States: {
        PUSH: 1,
        NO_PUSH: 0
      }
    },
    /**
     * A LED
     * Params: { color: 0xFFF }
     */
    LED: {
      render: function() {
        
      },
      States: {
        ON: 1,
        OFF: 0
      }
    },
    /**
     * A potentiometer
     */
    POTI: {
      render: function() {
        
      }
    }
  };

  /**
   * An IO device
   * @param params Consists of:
   * {
   *   state: The state of this Hardware (yasp.HardwareType.XXX.states.YYY
   *   cb: Callback that is executed when the state changes
   *   container: Where should the HTML Element be put in
   *   type: What type is this Hardware (yasp.HardwareType.XXX)
   *   params: Additional parameters that are needed for the Hardware (for example: color for LED)
   * }
   * @constructor
   */
  yasp.Hardware = function(params) {
    this.cb = params.cb;
    this.container = params.container;
    this.type = params.type;
    this.params = params.params;
    this.state = null;

    this.element = null; // the jQuery element (is created in .render())
    
    this.receiveStateChange(!!params.state ? params.state : this.type.initialState.call(this));
  };
  
  yasp.Hardware.prototype.receiveStateChange = function(state) {
    if (this.state != state) {
      this.state = state;
      this.render();
      
      if (!!this.cb) this.cb(this);
    }
  };
  
  yasp.Hardware.prototype.render = function() {
    if (!!this.element) this.element.remove();
    if (!!this.container) this.type.render.call(this);
  };
  
})();