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
      this.runningState = {
        tracers: {
        }
      };

      this.retracePt = 0;

      var traceFunc = (function () {
        var now = Date.now();

        for(var nr in this.iobank.pins) {
          var pin = this.iobank.pins[nr];

          if(!this.runningState.tracers[nr]) {
            var values = new Array(points);

            for (var i = 0; i < values.length; i++) {
              values[i] = [
                i,
                null
              ];
            }

            this.runningState.tracers[nr] = {
              values: values,
              offset: now,
              mode: 'retrace'
            };
          }

          var trace = this.runningState.tracers[nr];

          var time = Date.now() - trace.offset;

          var set = false;

          trace.values[this.retracePt][1] = pin.state;
        }

        this.retracePt++;

        if(this.retracePt >= trace.values.length) {
          trace.offset = now;
          time = 0;
          trace.lastTime = -1;
          this.retracePt = 0;
        }

        requestAnimationFrame(traceFunc);
      }).bind(this);

      requestAnimationFrame(traceFunc);
    },
    receiveStateChange: function (pin, tick) {
    },
    uiEvent: function (name, turn) {
    },
    getState: function () {
      var state = {
        tracers: [],
        scanner: (this.retracePt / points) * (verticalGuides - 1)
      };

      for(var nr in this.runningState.tracers) {
        var tracer = this.runningState.tracers[nr];
        var o = {
          label: "MASTER\nPin: " + nr,
          trace: []
        };

        var lastY = null;

        for (var i = 0; i < tracer.values.length; i++) {
          var y = tracer.values[i][1];

          if(y === null) {
            break;
          }

          if(y !== lastY) {
            o.trace.push(tracer.values[i].slice());
            o.trace.push(tracer.values[i].slice());
          } else {
            o.trace[o.trace.length - 1][0] = tracer.values[i][0];
          }

          lastY = y;
        }

        for (var i = 0; i < o.trace.length; i++) {
          o.trace[i][0] = (o.trace[i][0] / points) * (verticalGuides - 1);
        }

        state.tracers.push(o);
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

  var width = guideSpacing * (verticalGuides - 1)
  + guideMarginHorizontalLeft
  + guideMarginHorizontalRight;

  var height = guideSpacing * (horzontalGuides - 1)
  + guideMarginVerticalTop
  + guideMarginVerticalBottom;

  var scaling = 0.5;

  var points = scaling * 600;

  yasp.HardwareType['OSCI']['frontend']['dom'] = yasp.HardwareRenderer.makeRenderer({
    create: function () {
      this.element = $('<canvas height="' + height + '" width="' + width + '">');
      this.element.css({
        'width': '100%',
        'height': '100%'
      });

      this.element.appendTo(this.container);
    },
    render: function (state) {
      var that = this;
      var ctx = that.element[0].getContext("2d");

      function drawGuidelines(d, n) {
        ctx.save();
        ctx.strokeStyle = '#AAA';
        ctx.beginPath();

        ctx.lineWidth = 2;
        ctx.setLineDash([2,3]);

        var offset = 0;

        if (d === 'h') {
          offset = guideMarginVerticalTop;
        } else {
          offset = guideMarginHorizontalLeft;
        }

        for(; offset < n * guideSpacing; offset += guideSpacing) {
          if (d === 'h') {
            ctx.moveTo(guideMarginHorizontalLeft - 1, offset);
            ctx.lineTo(width - guideMarginHorizontalRight + 1, offset);
          } else {
            ctx.moveTo(offset, guideMarginVerticalTop - 1);
            ctx.lineTo(offset, height - guideMarginVerticalBottom + 1);
          }
        }

        ctx.stroke();
        ctx.restore();
      }

      function drawScanner(s) {
        var voffset = s * guideSpacing + guideMarginHorizontalLeft;

        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'white';

        ctx.moveTo(voffset, guideMarginVerticalTop);
        ctx.lineTo(voffset, height - guideMarginVerticalBottom);

        ctx.stroke();
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

        var lastX = null;

        for(var i = 0; i < points.length; i++) {
          var x = hoffset + (points[i][0] * guideSpacing);
          var y = voffset + ((points[i][1] - 1) * guideSpacing * -1);

          if(lastX === null || lastX <= x) {
            ctx.lineTo(x, y);
          }

          ctx.moveTo(x, y);

          lastX = x;
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
        ctx.fillRect(0, 0, width, height);

        drawGuidelines('v', verticalGuides);
        drawGuidelines('h', horzontalGuides);
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

      drawScanner(state.scanner);
    }
  });
})();
