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
  };

  /** Generates this breadboard: wire emulator to hardware, generate html
   */
  yasp.BreadBoard.prototype.build = function () {
    this.container.empty();

    this.ioChangedCb = (function (data) {
      var payload = data.payload;

      for (var i = 0; i < this.type.hardware.length; i++) {
        if(this.type.hardware[i].pin === payload.pin && this.type.hardware[i].type === "LED")
          this.hardware[i].receiveStateChange(payload.state);
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
    $(window).resize(function () {
      $image.css('width', $image.height() * ratio + "px");
      that.render();
    });

    $container.append($image);
  };

  /** Generates a given piece of hardware, adds it to the DOM and attaches event-handlers
   * @param $container jQuery-Object of the container to place the hardware in
   * @param definition this pieces definition from the breadboard-type
   * @private
   */
  yasp.BreadBoard.prototype.buildPiece = function ($container, definition, image) {
    var appear = definition.appearance;

    if(appear.zindex === undefined)
      appear.zindex = 2;

    var $wrapper = $('<div style="position: absolute; box-sizing: content-box !important;">');
    $wrapper.css('z-index', appear.zindex);
    $wrapper.css('top', (appear.top / image.height) * 100 + "%");
    $wrapper.css('left', (appear.left / image.width) * 100 + "%");
    $wrapper.attr('title', "Pin: " + definition.pin);
    $wrapper.tooltip(definition.tooltip || {});
    if(appear.height)
      $wrapper.css('height', (appear.height / image.height) * 100 + "%");
    if(appear.width)
      $wrapper.css('width', (appear.width / image.width) * 100 + "%");

    var hardware = new yasp.Hardware({
      cb: (function(hw) {
        if(definition.type === "POTI" || definition.type === "PUSHBUTTON") {
          this.communicator.sendMessage("SET_STATE", {
            io: [
              {
                pin: definition.pin,
                state: hw.state
              }
            ]
          });
        }
      }).bind(this),
      container: $wrapper,
      type: yasp.HardwareType[definition.type],
      params: definition.params
    });

    this.hardware.push(hardware);
    $container.append($wrapper);
  };

  /** redraws all hardware elements
   */
  yasp.BreadBoard.prototype.render = function () {
    for (var i = 0; i < this.hardware.length; i++) {
      this.hardware[i].render();
    }
  };

  /** removes all the hardware from the DOM and removes the event-handlers from the emulator
   */
  yasp.BreadBoard.prototype.destroy = function () {
    this.container.empty();
    this.communicator.unsubscribe('IO_CHANGED', this.ioChangedCb);
  };
})();