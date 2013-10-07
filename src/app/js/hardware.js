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
        var states = yasp.HardwareType.PUSHBUTTON.States;
        if (!this.element) {
          this.element = $('<div></div>');

          this.element.mousedown((function() {
            this.receiveStateChange(states.PUSH);
          }).bind(this));
          this.element.mouseup((function() {
            this.receiveStateChange(states.NO_PUSH);
          }).bind(this));
          this.element.mouseleave((function() {
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
    },
    /**
     * A LED
     * Params: { onColor: 0xFFF, offColor: 0xFFF }
     */
    LED: {
      render: function() {
        if (!this.element) {
          this.element = $('<canvas></canvas>');
          this.element.css({
            'width': '100%',
            'height': '100%'
          });
          
          this.element.appendTo(this.container);
        }
        var width = this.element.width();
        var height = this.element.height();
        // fix HTML5 behaviour
        this.element.attr({
          "width": width,
          "height": height
        });
        
        

        if (!this.lighter && this.state == yasp.HardwareType.LED.States.OFF) {
          this.dim = 5;
          this.lighter = null;
        } else if (!this.dim && this.state == yasp.HardwareType.LED.States.ON) {
          this.dim = null;
          this.lighter = 5;
        } else {
          this.dim = null;
          this.lighter = null;
        }
        
        // requestAnimFrame(this.type.animRender.bind(this));
        this.type.animRender.call(this);
      },
      animRender: function() {
        var states = yasp.HardwareType.LED.States;
        
        var width = this.element.width();
        var height = this.element.height();
        
        var radius = Math.min(width, height)/2;

        var obj = this.element.get(0);
        var ctx = obj.getContext('2d');
        
        ctx.clearRect(0,0,width, height); // clear it, baby
        
        // draw outer circle
        ctx.beginPath();
        ctx.arc(width/2, height/2, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'rgba(10,10,10,0.9)';
        ctx.fill();

        // draw main color
        ctx.beginPath();
        ctx.arc(width/2, height/2, radius-1, 0, 2 * Math.PI, false);
        ctx.fillStyle = this.state == states.ON ? this.params.onColor : this.params.offColor; // TODO: PWM
        ctx.fill();
        
        // draw dim color
        if (!!this.dim) {
          ctx.globalAlpha = this.dim/5;
          ctx.beginPath();
          ctx.arc(width/2, height/2, radius-1, 0, 2 * Math.PI, false);
          ctx.fillStyle = this.params.onColor; // TODO: PWM
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        // draw lighter color
        if (!!this.lighter) {
          ctx.globalAlpha = this.lighter/5;
          ctx.beginPath();
          ctx.arc(width/2, height/2, radius-1, 0, 2 * Math.PI, false);
          ctx.fillStyle = this.params.offColor; // TODO: PWM
          ctx.fill();
          ctx.globalAlpha = 1;
        }
        
        // draw inner circle
        ctx.beginPath();
        ctx.arc(width/2, height/2, radius-4, 0, 2 * Math.PI, false);
        ctx.strokeStyle = 'rgba(20,20,2,0.5)';
        ctx.stroke();

        // draw white dot
        ctx.beginPath();
        ctx.arc(width/2 + 3, height/2 + 3, radius/6, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fill();
        
        if (!!this.dim) {
          this.dim-=.5;
          requestAnimFrame(this.type.animRender.bind(this));
        }
        if (!!this.lighter) {
          this.lighter-=.5;
          requestAnimFrame(this.type.animRender.bind(this));
        }
      },
      initialState: function() {
        return yasp.HardwareType.LED.States.OFF;
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
        
      },
      initialState: function() {
        return 0;
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