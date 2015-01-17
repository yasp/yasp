if (typeof yasp == 'undefined') yasp = { };
if (yasp.HardwareType === undefined) yasp.HardwareType = { };

(function () {
  yasp.HardwareType['LED'] = {
    'backend': null,
    'frontend': {}
  };

  yasp.HardwareType['LED']['backend'] = yasp.Hardware.makeHardware({
    name: 'LED',
    pins: [ { nr: 1, type: 'gpio', mode: 'in', pwm: true } ],
    init: function () {
      this.pwmState = 0;

      this.iobank.pins[1].STATE_CHANGED = (function (pin, tick) {
        this.pwmState = pin.state;
      }).bind(this);
    },
    receiveStateChange: function (pin, tick) {
    },
    uiEvent: function (name, data) {
    },
    getState: function () {
      return {
        light: this.pwmState
      };
    }
  });

  yasp.HardwareType['LED']['frontend']['dom'] = yasp.HardwareRenderer.makeRenderer({
    create: function () {
      this.element = $('<canvas>');
      this.element.css({
        'width': '100%',
        'height': '100%'
      });

      this.element.appendTo(this.container);
    },
    render: function (state) {
      var width = this.element.width();
      var height = this.element.height();

      // fix HTML behaviour
      this.element.attr({
        'width': width,
        'height': height
      });

      var obj = this.element.get(0);
      var ctx = obj.getContext('2d');

      var radius = Math.max(Math.min(width, height)/2, 5);
      var alpha = Math.min(1, Math.max(0, state.light)); // only values between 1 and 0

      ctx.clearRect(0, 0, width, height);

      var isSmall = (width < 20);

      // draw outer circle
      if(!isSmall) {
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'rgba(10,10,10,0.9)';
        ctx.fill();
      }

      ctx.globalAlpha = 1 - alpha;
      ctx.beginPath();
      ctx.arc(width/2, height/2, radius-1, 0, 2 * Math.PI, false);
      ctx.fillStyle =  this.params.offColor;
      ctx.fill();

      // draw main color
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(width/2, height/2, radius-1, 0, 2 * Math.PI, false);
      ctx.fillStyle =  this.params.onColor;
      ctx.fill();

      ctx.globalAlpha = 1;

      if(!isSmall) {
        // draw inner circle
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, radius - 4, 0, 2 * Math.PI, false);
        ctx.strokeStyle = 'rgba(20,20,2,0.5)';
        ctx.stroke();

        // draw white dot
        ctx.beginPath();
        ctx.arc(width / 2 + 3, height / 2 + 3, radius / 6, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fill();
      }
    }
  });
})();