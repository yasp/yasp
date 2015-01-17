if (typeof yasp == 'undefined') yasp = { };

(function () {

  /**
   * Displays the hardware in the debugger.
   * Additional documentation can be found in the {@link https://github.com/yasp/yasp/blob/master/doc/breadboards.md|GitHub repository}.
   * @param container {object} the DOM-element to place the hardware in
   * @param communicator {Communicator} EmulatorCommunicator
   * @param type {object} the breadboard-type to generate
   * @constructor
   */
  yasp.BreadBoard = function (container, communicator, type) {
    this.container = $(container);
    this.communicator = communicator;
    this.type = type;
    this.destroyed = false;
  };

  /** Generates this breadboard: wire emulator to hardware, generate html
   */
  yasp.BreadBoard.prototype.build = function () {
    this.container.empty();

    this.ioChangedCb = (function (data) {
      var payload = data.payload;

      for (var i = 0; i < this.type.hardware.length; i++) {
        var hwCfg = this.type.hardware[i];
        var hw = this.hardware[i];

        for (var j = 0; j < hwCfg.pins.length; j++) {
          var pinCfg = hwCfg.pins[j];

          if(pinCfg.emulator === payload.pin) {
            hw.backend.receiveStateChange(pinCfg.hardware, payload.state, payload.tick);
            break;
          }
        }
      }
    }).bind(this);

    this.communicator.subscribe('IO_CHANGED', this.ioChangedCb);

    var $innerContainer = $('<div>');
    $innerContainer.css('position', 'relative');
    $innerContainer.css('height', '100%');
    $innerContainer.css('display', 'inline-block');
    this.container.append($innerContainer);

    this.buildImage($innerContainer, this.type.image);

    this.hardware = [];
    for (var i = 0; i < this.type.hardware.length; i++) {
      this.buildPiece($innerContainer, this.type.hardware[i], this.type.image);
    }

    this.render();
  };

  /** Generates a image and adds it to the DOM
   * @param $container {object} jQuery-Object of the container to place the image in
   * @param image {object} the image to generate
   * @private
   */
  yasp.BreadBoard.prototype.buildImage = function ($container, image) {
    var $image = $('<img>');
    $image.attr('src', image.url);
    $image.css('height', "100%");

    var that = this;
    var ratio = image.width / image.height;

    // since browsers are not able to scale this <img> correctly..
    function fixSize () {
      $image.css('width', $image.height() * ratio + "px");
      that.render();
    }

    $(window).resize(fixSize);
    $image.load(fixSize);

    $container.append($image);
  };

  /** Generates a given piece of hardware, adds it to the DOM and attaches event-handlers
   * @param $container jQuery-Object of the container to place the hardware in
   * @param definition this pieces definition from the breadboard-type
   * @private
   */
  yasp.BreadBoard.prototype.buildPiece = function ($container, definition, image) {
    var appear = definition.appearance;

    if(appear.zindex === undefined) {
      appear.zindex = 2;
    }

    var $wrapper = $('<div style="position: absolute; box-sizing: content-box !important;">');
    $wrapper.css('z-index', appear.zindex);
    $wrapper.css('top', (appear.top / image.height) * 100 + "%");
    $wrapper.css('left', (appear.left / image.width) * 100 + "%");

    var tooltipTitle = "";

    if(definition.pins.length) {
      tooltipTitle = "Pin: " + definition.pins[0].emulator;
    } else {
      tooltipTitle = "Pins:<br>";
      for (var i = 0; i < definition.pins.length; i++) {
        var pin = definition.pins[i];
        tooltipTitle += pin.hardware + "\u2794" + pin.emulator;

        if(i != definition.pins.length - 1) {
          tooltipTitle += "<br>";
        }
      }
    }

    $wrapper.attr('title', tooltipTitle);

    var tooltipOptions = definition.tooltip || {};
    tooltipOptions.html = true;
    $wrapper.tooltip(tooltipOptions);

    if(appear.height)
      $wrapper.css('height', (appear.height / image.height) * 100 + "%");
    if(appear.width)
      $wrapper.css('width', (appear.width / image.width) * 100 + "%");

    var hardware = yasp.HardwareType[definition.type];

    var backend = hardware.backend();

    backend.setStateChangedEvent((function (pin) {
      var emulatorPin = -1;

      for (var i = 0; i < definition.pins.length; i++) {
        var cfgPin = definition.pins[i];

        if(cfgPin.hardware === pin.nr) {
          emulatorPin = cfgPin.emulator;
          break;
        }
      }

      if(emulatorPin === -1) {
        return;
      }

      this.communicator.sendMessage("SET_STATE", {
        io: [ { pin: emulatorPin, state: pin.state } ]
      });
    }).bind(this));

    var frontend = hardware.frontend[definition.renderer](backend, $wrapper, definition.params);
    frontend.create();

    this.hardware.push(frontend);
    $container.append($wrapper);
  };

  /** redraws all hardware elements
   */
  yasp.BreadBoard.prototype.render = function () {
    if(this.destroyed === true) {
      return;
    }

    for (var i = 0; i < this.hardware.length; i++) {
      try {
        this.hardware[i].render();
      } catch (ex) {
        console.log("Could not render breadboard-hardware: " + i);
        console.log(ex);
      }
    }

    window.requestAnimFrame(this.render.bind(this));
  };

  /** removes all the hardware from the DOM and removes the event-handlers from the emulator
   */
  yasp.BreadBoard.prototype.destroy = function () {
    this.container.empty();
    this.communicator.unsubscribe('IO_CHANGED', this.ioChangedCb);
  };
})();