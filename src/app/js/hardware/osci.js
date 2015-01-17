if (typeof yasp == 'undefined') yasp = { };
if (yasp.HardwareType === undefined) yasp.HardwareType = { };

(function () {
  yasp.HardwareType['OSCI'] = {
    'backend': null,
    'frontend': {}
  };

  yasp.HardwareType['OSCI']['backend'] = yasp.Hardware.makeHardware({
    name: 'OSCI',
    pins: [
      { nr: 3, type: 'gpio', mode: 'in' },
      { nr: 4, type: 'gpio', mode: 'in' },
      { nr: 5, type: 'gpio', mode: 'in' }
    ],
    init: function () {
      this.voffset = 0;
      this.runningState = {
        tracers: {
        }
      };
    },
    receiveStateChange: function (pin, tick) {
      if(!this.runningState.tracers[pin.nr]) {
        this.runningState.tracers[pin.nr] = {
          values: []
        }
      }

      var trac = this.runningState.tracers[pin.nr];

      var y = tick - this.voffset;

      if(y < 0) {
        return;
      }

      var start = [y, pin.state];
      var end = [y, pin.state];

      if(trac.values.length > 0) {
        var last = trac.values[trac.values.length - 1];

        if (last[1] !== start[1]) {
          last[0] = start[0];
        }
      }

      trac.values.push(start);
      trac.values.push(end);

      if(y * scaling >= verticalGuides - 1) {
        this.voffset = tick;

        for(var nr in this.runningState.tracers) {
          var tr = this.runningState.tracers[nr];
          tr.values.length = 0;
        }
      }
    },
    uiEvent: function (name, turn) {
    },
    getState: function () {
      var state = {
        tracers: []
      };

      var max = 0;

      for(var nr in this.runningState.tracers) {
        var tracer = this.runningState.tracers[nr];

        max = Math.max(max, tracer.values[tracer.values.length - 1][0]);

        state.tracers.push({
          label: "MASTER\nPin: " + nr,
          trace: tracer.values
        });
      }

      for (var i = 0; i < state.tracers.length; i++) {
        var trace = state.tracers[i].trace;
        trace[trace.length - 1][0] = max;
      }

      return state;
    }
  });

  var guideMarginVerticalTop = 20;
  var guideMarginVerticalBottom = 20;

  var guideMarginHorizontalLeft = 55;
  var guideMarginHorizontalRight = 20;

  var fontMarginLeft = 5;
  var fontMarginRight = 7;

  var guideSpacing = 30;

  var verticalGuides = 20;
  var horzontalGuides = 10;

  var scaling = 0.1;

  yasp.HardwareType['OSCI']['frontend']['dom'] = yasp.HardwareRenderer.makeRenderer({
    create: function () {
      this.o_width = guideSpacing * (verticalGuides - 1)
      + guideMarginHorizontalLeft
      + guideMarginHorizontalRight;

      this.o_height = guideSpacing * (horzontalGuides - 1)
      + guideMarginVerticalTop
      + guideMarginVerticalBottom;

      this.element = $('<canvas height="' + this.o_height + '" width="' + this.o_width + '">');
      this.element.css({
        'width': '100%',
        'height': '100%'
      });

      this.element.appendTo(this.container);
    },
    render: function (state) {
      var that = this;
      var ctx = that.element[0].getContext("2d");

      function drawGuideline(s, d) {
        ctx.save();
        ctx.strokeStyle = '#AAA';
        ctx.beginPath();

        ctx.lineWidth = 2;
        ctx.setLineDash([2,3]);

        var offset = guideSpacing * s;

        if(d === 'h') {
          offset += guideMarginVerticalTop;
          ctx.moveTo(guideMarginHorizontalLeft - 1, offset);
          ctx.lineTo(that.o_width - guideMarginHorizontalRight + 1, offset);
        } else {
          offset += guideMarginHorizontalLeft;
          ctx.moveTo(offset, guideMarginVerticalTop - 1);
          ctx.lineTo(offset, that.o_height - guideMarginVerticalBottom + 1);
        }

        ctx.stroke();
        ctx.restore();
      }

      function drawTracer(desc, h, c, points) {
        ctx.save();
        ctx.strokeStyle = c;
        ctx.fillStyle = c;

        var voffset = h * guideSpacing + guideMarginVerticalTop;
        var hoffset = guideMarginHorizontalLeft;

        var fontsize = 10;
        var fontOffset = voffset + fontsize;
        ctx.font = fontsize + "px monospace";

        var lines = desc.split('\n');

        for(var i = 0; i < lines.length; i++) {
          ctx.fillText(lines[i], fontMarginLeft, fontOffset + fontsize * i, hoffset - fontMarginLeft - fontMarginRight);
        }

        ctx.lineWidth = 3;
        ctx.beginPath();

        for(var i = 0; i < points.length; i++) {
          var x = hoffset + (points[i][0] * guideSpacing * scaling);
          var y = voffset + ((points[i][1] - 1) * guideSpacing * -1);

          ctx.lineTo(x, y);
          ctx.moveTo(x, y);
        }

        ctx.stroke();
        ctx.restore();
      }

      function generateDuty(offset, f, len) {
        var tracerArr = [];

        /*
         0/1____f/1
         |    |
         |    |____... .. .
         0/0  f/0
         */

        for(var i = offset; i < offset + len; i += 1) {
          tracerArr = tracerArr.concat([
            [0 + i, 0],
            [0 + i, 1],
            [f + i, 1],
            [f + i, 0]
          ]);
        }

        return tracerArr;
      }

      function drawBackground() {
        ctx.fillRect(0, 0, that.o_width, that.o_height);

        for(var i = 0; i < verticalGuides; i++) {
          drawGuideline(i, 'v');
        }

        for(var i = 0; i < horzontalGuides; i++) {
          drawGuideline(i, 'h');
        }
      }

      var dd = 0;

      dd = Math.max((dd + 0.05) % 1, 0.1);

      drawBackground();

      var colors = [
        '#0F0',
        '#E0F',
        '#F00',
        '#0FF'
      ];

      for (var i = 0; i < state.tracers.length; i++) {
        var tracer = state.tracers[i];
        var color = colors[i % colors.length];

        drawTracer(tracer.label, i * 2, color, tracer.trace);
      }
    }
  });
})();
