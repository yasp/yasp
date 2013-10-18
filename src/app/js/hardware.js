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

          var width = this.element.width();
          var height = this.element.height();
          // fix HTML5 behaviour
          this.element.attr({
            "width": width,
            "height": height
          });
          
          this.upAnim = this.type.animUpdate.bind(this); // reduce amount of objects created
        }
        
        
        if (!this.rendering) {
          if (!!this.interval) clearInterval(this.interval);
          if (!this.rendering) {
            this.onCount = 0;
            this.offCount = 0;
          }
          
          this.rendering = true;
          this.interval = setInterval(this.upAnim, 0);
        }
      },
      animUpdate: function() {
        var states = yasp.HardwareType.LED.States;
        
        if (this.rendering) {
          if (this.state == states.ON) {
            this.onCount++;
          } else if (this.state == states.OFF) {
            this.offCount++;
          }
          
          if (this.onCount + this.offCount > 75) {
            this.type.animRender.bind(this)();
            this.onCount /= 1.35; // this is needed, to reduce flickering
            this.offCount /= 1.35;
          }
        }
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

        ctx.globalAlpha = this.offCount/(this.onCount + this.offCount);
        ctx.beginPath();
        ctx.arc(width/2, height/2, radius-1, 0, 2 * Math.PI, false);
        ctx.fillStyle =  this.params.offColor;
        ctx.fill();

        // draw main color
        ctx.globalAlpha = this.onCount/(this.onCount + this.offCount);
        ctx.beginPath();
        ctx.arc(width/2, height/2, radius-1, 0, 2 * Math.PI, false);
        ctx.fillStyle =  this.params.onColor;
        ctx.fill();
        
        ctx.globalAlpha = 1;
        
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
     * The state Object is a value from 0-359 describing the currenct angle
     */
    POTI: {
      render: function() {
        if (!this.element) {
          this.element = $('<canvas></canvas>');
          this.element.css({
            'width': '100%',
            'height': '100%'
          });
          
          var handler;
          this.element.mousemove(handler = (function(evt) {
            if (evt.which == 1) {
              var parentOffset = this.element.parent().offset();
              var x = evt.pageX - parentOffset.left;
              var y = evt.pageY - parentOffset.top;
              
              var origx = this.element.width()/2;
              var origy = this.element.height()/2;
              
              var angle = Math.atan2((origy - y), (origx - x));
              angle = Math.floor(angle*(180/Math.PI)+180)
              
              this.receiveStateChange(angle);
            }
          }).bind(this));
          this.element.mousedown(handler);
          
          this.element.appendTo(this.container);
        }
        var width = this.element.width();
        var height = this.element.height();
        // fix HTML5 behaviour
        this.element.attr({
          "width": width,
          "height": height
        });

        var width = this.element.width();
        var height = this.element.height();

        var maxRadius = Math.min(width, height)/2;

        var outerRadius = maxRadius-10;
        var innerRadius = maxRadius-20;
        var numTeeth = maxRadius/2;
        var color = "rgb(190,190,190)";
        var rad = this.state*(Math.PI/180);

        var obj = this.element.get(0);
        var ctx = obj.getContext('2d');

        ctx.save();
        var numPoints = numTeeth * 2;
        // draw gear teeth
        ctx.beginPath();
        ctx.lineJoin = 'bevel';
        for(var n = 0; n < numPoints; n++) {

          var radius = null;

          if(n % 2 == 0) {
            radius = outerRadius;
          }
          else {
            radius = innerRadius;
          }

          var theta = rad;
          theta += ((Math.PI * 2) / numPoints) * (n + 1);

          var x = (radius * Math.cos(theta)) + width/2;
          var y = (radius * Math.sin(theta)) + height/2;

          if(n == 0) {
            ctx.moveTo(x, y);
          }
          else {
            ctx.lineTo(x, y);
          }
        }

        ctx.closePath();
        ctx.lineWidth = 5;
        ctx.strokeStyle = color;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(width/2, height/2, innerRadius+2, 0, 2 * Math.PI, false);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(width/2, height/2);
        ctx.lineTo(width/2+Math.cos(rad)*radius, height/2+Math.sin(rad)*radius);
        ctx.strokeStyle = 'rgb(100,100,100)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
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