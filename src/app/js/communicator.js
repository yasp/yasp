if (typeof yasp == 'undefined') yasp = { };

(function() {
  yasp.EmulatorCommunicator = new yasp.Communicator("emulator/emulator.js");
  yasp.AssemblerCommunicator = new yasp.Communicator("assembler/assembler.js");
  
  /**
   * Responsible for communicating
   * @param path is the path to the specified file
   * @constructor
   */
  yasp.Communicator = function(path) {
    if (!Worker) throw "Worker Unsupported";
    
    this.worker = new Worker(path);
    this.listener = { };
    this.id = 0;
    this.openMessages = { };
    
    this.worker.addEventListener("message", (function(event) {
      var data = event.data;
      if (typeof data.id != 'undefined') {
        if (!this.openMessages[data.id]) {
          throw "Message with ID "+data.id+" does not exist.";
        } else {
          // call
          this.openMessages[data.id].callback();
          // delete
          delete this.openMessages[data.id];
        }
      } else {
        // broadcast
        var events = this.listener[event.action];
        for (var i = 0; i < events.length; i++) {
          events[i]();
        }
      }
    }).bind(this), false);
  };

  /**
   * Sends a message to the Worker
   * @param action
   * @param payload
   * @param cb
   */
  yasp.Communicator.prototype.sendMessage = function(action, payload, cb) {
    this.worker.postMessage({
      action: action,
      id: ++this.id,
      payload: payload
    });
    
    this.openMessages[this.id] = {
      callback: cb,
      action: action,
      originalPayload: payload
    };
  };

  /**
   * Starts listening to broadcast events
   * @param event
   * @param cb
   */
  yasp.Communicator.prototype.subscribe = function(event, cb) {
    if (!this.listener[event]) this.listener[event] = [ ];
    this.listener[event].push(cb);
  };

  /**
   * Quits listening to Broadcast events
   * @param event
   * @param cb
   */
  yasp.Communicator.prototype.unsubscribe = function(event, cb) {
    if (!!this.listener[event]) {
      var data = this.listener[event];
      for (var i = 0; i < data.length; i++) {
        if (data[i] == cb) {
          data.splice(i, 1);
          break;
        }
      }
    }
  };

  /**
   * Terminates the worker and shuts down communication
   */
  yasp.Communicator.prototype.terminate = function() {
    this.worker.terminate();
  }
})();