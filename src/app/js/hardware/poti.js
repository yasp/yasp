if (typeof yasp == 'undefined') yasp = { };
if (yasp.HardwareType === undefined) yasp.HardwareType = { };

(function () {
  /**
   * A potentiometer
   * The state Object is a value from 0-255 describing the current angle
   */
  yasp.HardwareType["POTI"] = {
    render: function() {
      if (!this.element) {
        this.element = $('<canvas></canvas>');
        this.element.css({
          'width': '100%',
          'height': '100%'
        });

        var handler;
        var isDown = false;
        this.element.mousedown(function () {
          isDown = true;
        });
        this.element.mouseup(function () {
          isDown = false;
        });
        this.element.mouseleave(function () {
          isDown = false;
        });
        this.element.mousemove(handler = (function(evt) {
          if (isDown) {
            var parentOffset = this.element.parent().offset();
            var x = evt.pageX - parentOffset.left;
            var y = evt.pageY - parentOffset.top;

            var origx = this.element.width()/2;
            var origy = this.element.height()/2;

            var angle = Math.atan2((origy - y), (origx - x));
            angle = Math.floor(angle*(180/Math.PI)+180)
            angle = (angle/359)*255;

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

      var maxRadius = Math.min(width, height) / 2;

      var outerRadius = Math.max(maxRadius - 3, 5);
      var innerRadius = Math.max(outerRadius - 10, 10);
      var numTeeth = Math.floor((2*maxRadius*Math.PI)/12);
      var color = "rgb(190,190,190)";
      var rad = (this.state/255)*359*(Math.PI/180);

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
      ctx.lineWidth = 7;
      ctx.strokeStyle = color;
      ctx.stroke();

      // fill inner circle
      ctx.beginPath();
      ctx.arc(width/2, height/2, innerRadius+2, 0, 2 * Math.PI, false);
      ctx.fillStyle = color;
      ctx.fill();

      // draw indicator line
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
  };
})();