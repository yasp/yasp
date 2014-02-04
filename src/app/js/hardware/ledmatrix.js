if (typeof yasp == 'undefined') yasp = { };
if (yasp.HardwareType === undefined) yasp.HardwareType = { };

(function () {
  /**
   * A LED
   * Params: { onColor: 0xFFF, offColor: 0xFFF }
   */
  yasp.HardwareType["LEDMatrix"] = {
    render: function() {
      if (!this.element) {
        this.element = $('<canvas></canvas>');
        this.element.css({
          'width': '100%',
          'height': '100%'
        });
        
        this.element.appendTo(this.container);
      }
      if (!this.params.leds) {
        var leds = [ ]
        this.params.led = leds;
        for (var x = 0;  x < this.params.width; x++) {
          leds[x] = [ ];
          for (var y = 0; y < this.params.height; y++) {
            leds[x][y] = 0;
          }
        }
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
      var cellwidth = this.element.width()/this.params.width;
      var cellheight = this.element.height()/this.params.height;
      
      for (var x = 0; x < this.params.width; x++) {
        for (var y = 0;  y < this.params.height; y++) {
          ctx.save();
          ctx.globalAlpha = 1;
          ctx.translate(x*cellwidth + 2, y*cellheight + 2);
          yasp.HardwareType["LED"].renderLED(this.params, ctx, this.state, cellwidth - 4, cellheight - 4);
          ctx.restore();
        }
      }
    },
    initialState: function() {
      return [ ];
    }
  };

  
})();