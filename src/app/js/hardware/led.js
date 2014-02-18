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
      }

      var width = this.element.width();
      var height = this.element.height();

      // fix HTML5 behaviour
      this.element.attr({
        "width": width,
        "height": height
      });
      
      var obj = this.element.get(0);
      var ctx = obj.getContext('2d');
      
      yasp.HardwareType["LED"].renderLED(this.params, ctx, this.state, width, height);
    },
    initialState: function() {
      return 0;
    }
  };

  yasp.HardwareType["LED"].renderLED = function(params, ctx, alpha, width, height) {
    var radius = Math.max(Math.min(width, height)/2, 5);
    var alpha = Math.min(1, Math.max(0, alpha)); // only values between 1 and 0
    
    ctx.clearRect(0,0,width, height); // clear it, baby

    // draw outer circle
    ctx.beginPath();
    ctx.arc(width/2, height/2, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'rgba(10,10,10,0.9)';
    ctx.fill();

    ctx.globalAlpha = 1 - alpha;
    ctx.beginPath();
    ctx.arc(width/2, height/2, radius-1, 0, 2 * Math.PI, false);
    ctx.fillStyle =  params.offColor;
    ctx.fill();

    // draw main color
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(width/2, height/2, radius-1, 0, 2 * Math.PI, false);
    ctx.fillStyle =  params.onColor;
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
  };
})();