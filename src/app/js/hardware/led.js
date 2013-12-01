if (typeof yasp == 'undefined') yasp = { };
if (yasp.HardwareType === undefined) yasp.HardwareType = { };

(function () {
  /**
   * A LED
   * Params: { onColor: 0xFFF, offColor: 0xFFF }
   */
  yasp.HardwareType["LED"] = {
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
  };
})();