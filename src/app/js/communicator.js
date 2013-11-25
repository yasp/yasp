if (typeof yasp == 'undefined') yasp = { };

(function() {
  /**
   * Responsible for communicating
   * @param path is the path to the specified file
   * @constructor
   */
  yasp.Communicator = function(path) {
    if (!window.Worker) throw "Worker Unsupported";
    
    this.worker = new Worker(path);
    this.listener = { };
    this.id = 0;
    this.openMessages = { };
    
    this.worker.addEventListener("message", (function(event) {
      var data = event.data;
      if (!!data.id) {
        if (!this.openMessages[data.id]) {
          throw "Message with ID "+data.id+" does not exist.";
        } else {
          // call
          if (!!this.openMessages[data.id].callback) this.openMessages[data.id].callback(data);
          // delete
          delete this.openMessages[data.id];
        }
      } else if (data.action == 'internal_error') {
        throw "Error ("+data.payload.code+") "+data.payload.msg;
      } else if (data.action == 'internal_log') {
        console.log("Communicator Log: "+data.payload);
      } else {
        // broadcast
        var events = this.listener[data.action];
        for (var i = 0; i < events.length; i++) {
          events[i](data);
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
    var id = ++this.id;
    this.worker.postMessage({
      action: action.toUpperCase(),
      id: id,
      payload: payload
    });
    
    this.openMessages[id] = {
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
    event = event.toUpperCase();
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
  
  yasp.Communicator.UNKNOWN_ACTION = {
    payload: null,
    error: {
      code: 0,
      msg: "Unknown action"
    }
  }

  /**
   * Responsible in the Web Worker for communicating with the client
   * @param self The self variable which is set in the web worker environment
   * @param listener The listener has to call "ready" if the results are available
   */
  yasp.CommunicatorBackend = function(self, listener) {
    console = {
      log: function(msg) {
        self.postMessage({
          action: "internal_log",
          payload: msg
        });
      }
    };
    
    listener = listener.bind(this);
    
    this.broadcast = function(action, result) {
      self.postMessage({
        action: action,
        id: null,
        error: result.error,
        payload: result.payload
      });
    };
    
    self.addEventListener('message', function(e) {
      e = e.data;
      console.log("Receive message: "+ e.action+" payload "+ JSON.stringify(e.payload));
      var ready = function(result) {
        self.postMessage({
          action: e.action,
          id: e.id,
          error: result.error,
          payload: result.payload
        });
      };
      listener(e, ready);
    });
    self.addEventListener('error', function(e) {
      self.postMessage({
        action: 'internal_error',
        payload: {
          code: 0,
          msg: "Worker error " + e.message + " in line " + e.lineno + " in file " + e.filename + "\n"
        }
      });
    });
  }
})();