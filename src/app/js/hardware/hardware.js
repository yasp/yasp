if (typeof yasp == 'undefined') yasp = { };

(function() {

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
    if (!!this.container) this.container.css({
      '-moz-user-select': 'none', // gotta love vendor prefixes
      '-khtml-user-select': 'none',
      '-webkit-user-select': 'none',
      '-o-user-select': 'none',
      '-ms-select': 'none',
      'user-select': 'none'
    });
    
    this.type = params.type;
    this.params = params.params;
    this.state = null;

    this.element = null; // the jQuery element (is created in .render())
    
    this.receiveStateChange(!!params.state ? params.state : this.type.initialState.call(this));
  };

  /**
   * Call this to notify the hardware that the change has changed
   * @param state
   */
  yasp.Hardware.prototype.receiveStateChange = function(state) {
    if (this.state != state) {
      this.state = state;
      this.render();
      
      if (!!this.cb) this.cb(this);
    }
  };

  /**
   * Is internally callen to draw this hardware into the DOM
   * It is not defined which method the hardware uses to draw: Some use Canvas, others manipulate the DOM directly.
   * Do not call this on your own - only receiveStateChange may use this.
   */
  yasp.Hardware.prototype.render = function() {
    if (!!this.container) this.type.render.call(this);
  };
  
})();