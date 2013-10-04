if (typeof yasp == 'undefined') yasp = { };

(function() {
  /**
   * HardwareType of a Hardware (used to display data correctly)
   * @type {{PUSHBUTTON: {render: Function}, LED: {render: Function}, POTI: {render: Function}}}
   */
  yasp.HardwareType = {
    /**
     * A simple PushButton.
     * Params: { }
     */
    PUSHBUTTON: {
      render: function() {
        var elem = this.element
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
   *   state: The state of this Hardware (yasp.HardwareState.XXX.states.YYY
   *   cb: Callback that is executed when the state changes
   *   container: Where should the HTML Element be put in
   *   type: What type is this Hardware (yasp.HardwareType.XXX)
   *   params: Additional parameters that are needed for the Hardware (for example: color for LED)
   * }
   * @constructor
   */
  yasp.Hardware = function(params) {
    this.state = params.state;
    this.cb = params.cb;
    this.container = params.container;
    this.type = params.type;
    this.params = params.params;

    this.element = null; // the jQuery element (is created in .render())
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
    
    this.type.render.call(this);
  };
  
})();