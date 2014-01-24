# Communicator
Operations that take long such as assembling or do not even have an end like emulating are executed inside webworkers.
On the browser-level webworkers have a simple string-messaging-api which is extended by yasps `Communicator`-class.

## Specific communicator-implementations
* Assembler, see [`assembler.md`](./assembler/assembler.md)
* Emulator, see [`emulator.md`](./emulator/emulator.md)

## Messages
**Internal** format of  comminucator-messages. The only values exposed via the API are `error`, `payload` and `action`.
`id` is used only internally to coordinate the callbacks.

### Normal messages
```javascript
{
  "action": "",
  "id": 0,
  "error": 0,
  "payload": {}
}
```

### Broadcasts
Broadcasts are the same as the normal messages, but their `id` will always be `null`.

## API

### Workers POV
```javascript
if (typeof yasp == 'undefined') yasp = { };
importScripts(/* relative urls to scripts.. */);

var communicator = new yasp.CommunicatorBackend(self, function(data, ready) {
  // callback is called if a message is received
  switch (data.action) {
    case 'NAME':
      // reply to the message, will cause the callback on the main-thread to be called
      ready({
        payload: {},
        error: null
      });
      break;
    default:
      // complain if an unknown action was sent
      ready(yasp.Communicator.UNKNOWN_ACTION);
      break;
  }
});

// send a broadcast
communicator.broadcast('TEST', {
  payload: {
    reason: reason
  },
  error: null
});
```

### Main-Threads POV
```javascript
var communicator = new yasp.Communicator("./url/to/file.js");

communicator.sendMessage("MSG_NAME", {
  // params of message, see documentation of the specific communicator-impl you're working with
}, function(data) {
  var error = data.error;
  var payload = data.payload;
});

function broadHandler (data) {
  var error = data.error;
  var payload = data.payload;
}

// subscribe to an broadcast-message
communicator.subscribe("BROAD_NAME", broadHandler);

// unsubscribe again
communicator.subscribe("BROAD_NAME", broadHandler);

// kill webworker
communicator.terminate();
```