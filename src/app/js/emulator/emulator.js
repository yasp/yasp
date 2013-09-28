if (typeof yasp == 'undefined') yasp = { };

(function() {
  /**
   * Emulator is responsible for running the bytecode from the assembler
   * @constructor
   */
  yasp.Emulator = function() {
    this.rom = new Uint8Array(512);
    this.ram = new Uint8Array(512);

    this.pc = 0;
    this.running = false;
  };

  /**
   * @function Loads the given bitcode into the ROM
   * @param bitcode bitcode to load
   * @param start address to start loading into
   * @returns {Number|Boolean}
   */
  yasp.Emulator.prototype.load = function(bitcode, start) {
    if(start < 0 || start >= this.rom.length)
      return 0;
    if(!(bitcode instanceof Uint8Array))
      return 2;
    if(start + bitcode.length >= this.rom.length)
      return 1;

    this.rom.set(bitcode, start);
    return true;
  };

  /**
   * @function Continues the execution
   * @param count number of instructions to execute or null
   * @returns {Number|Boolean}
   */
  yasp.Emulator.prototype.continue = function (count) {
    if(count == null) {
      this.running = true;
    }
    else if(!isNaN(+count)) {
      if(count < 0)
        return 0;
      this.running = +count;
    }
    else {
      return 2;
    }

    return true;
  };

  /**
   * @function Stops the execution
   * @returns {Number|Boolean}
   */
  yasp.Emulator.prototype.break = function () {
    if(this.running == false) {
      return 0;
    }

    this.running = false;

    return true;
  };

})();
