if (typeof yasp == 'undefined') yasp = { };

(function() {
  var debug = false;

  /**
   * Responsible for communicating with webworkers.
   * Additional documentation can be found in the {@link https://github.com/yasp/yasp/blob/master/doc/communicator.md|GitHub repository}.
   * @param path {String} is the path to the specified file
   * @constructor
   */
  yasp.Communicator = function(path) {
    if (!window.Worker) throw "Worker Unsupported";
    
    this.worker = new Worker(path);
    this.listener = { };
    this.id = 0;
    this.openMessages = { };

    var lastSlash = path.lastIndexOf("/") + 1;
    var filename = path.substring(lastSlash);

    var handleMessage = (function(data) {
      if(data.batched === true) {
        for (var i = 0; i < data.msgs.length; i++) {
          var msg = data.msgs[i];
          handleMessage(msg);
        }
        return;
      }

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
        if(debug) console.log("[" + filename + "] Communicator Log: "+data.payload);
      } else {
        // broadcast
        var events = this.listener[data.action];
        if (!!events) { // check if any subscriber
          for (var i = 0; i < events.length; i++) {
            events[i](data);
          }
        }
      }
    }).bind(this);

    this.worker.addEventListener("message", function (event) {
      handleMessage(event.data);
    }, false);
  };

  /**
   * Sends a message to the Worker
   * @param action {String}
   * @param payload {object}
   * @param cb {function}
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
   * @param event {string}
   * @param cb {function}
   */
  yasp.Communicator.prototype.subscribe = function(event, cb) {
    event = event.toUpperCase();
    if (!this.listener[event]) this.listener[event] = [ ];
    this.listener[event].push(cb);
  };

  /**
   * Quits listening to Broadcast events
   * @param event {string}
   * @param cb {function}
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
   * @constructor
   */
  yasp.CommunicatorBackend = function(self, listener) {
    console = {
      log: function() {
        if(debug) {
          var msg = "";

          for (var i = 0; i < arguments.length; i++) {
            var arg = arguments[i];

            if(typeof arg === 'object') {
              msg += JSON.stringify(arg);
            } else {
              msg += arg;
            }

            msg += " ";
          }

          self.postMessage({
            action: "internal_log",
            payload: msg
          });
        }
      }
    };

    function sendBroadcasts () {
      if(broadcastMsgsLen > 0) {
        console.log("!!!", broadcastMsgs);
        var msgs = broadcastMsgs.slice(0, broadcastMsgsLen);

        console.log("!!!", msgs);

        self.postMessage({
          batched: true,
          msgs: msgs
        });

        broadcastMsgsLen = 0;
      }
    }

    setInterval(sendBroadcasts, 50);

    function getBroadcastMsg(action, error, payload) {
      var obj;

      if(broadcastMsgsLen > broadcastMsgs.length && false) {
        obj = broadcastMsgs[broadcastMsgsLen];
      } else {
        obj = {
          batched: false,
          action: "",
          id: null,
          error: 0,
          payload: null
        };

        broadcastMsgs[broadcastMsgsLen] = obj;
      }

      obj.action = action;
      obj.error = error;
      obj.payload = payload;

      broadcastMsgsLen++;
    }

    var broadcastMsgs = [];
    var broadcastMsgsLen = 0;

    listener = listener.bind(this);

    /**
     * Sends a broadcast to all registered listeners
     * @param action {String}
     * @param result {object}
     * @see Communicator#subscribe
     * @see Communicator#unsubscribe
     */
    this.broadcast = function(action, result) {
      console.log("Send broadcast: ", action, " result ", result);
      getBroadcastMsg(action, result.error, result.payload);
    };
    
    self.addEventListener('message', function(e) {
      var data = e.data;

      console.log("Receive message: ", data.action, " payload ", data.payload);

      var ready = function(result) {
        console.log("Send response: ", data.action, " result ", result);
        self.postMessage({
          batched: false,
          action: data.action,
          id: data.id,
          error: result.error,
          payload: result.payload
        });
      };

      listener(data, ready);
    });

    self.addEventListener('error', function(e) {
      self.postMessage({
        batched: false,
        action: 'internal_error',
        payload: {
          code: 0,
          msg: "Worker error " + e.message + " in line " + e.lineno + " in file " + e.filename + "\n"
        }
      });
    });
  }
})();