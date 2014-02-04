if (typeof yasp == 'undefined') yasp = { };

importScripts('../../app/js/communicator.js');

new yasp.CommunicatorBackend(self, function(data, ready) {
  switch (data.action) {
    case "TEST":
      // some fancy calculation
      ready({
        payload: 42,
        error: null
      });
      break;
    case "BROADCAST":
      this.broadcast("AWESOME_EVENT", {
        payload: 42,
        error: null
      });
      break;
    default:
      ready(yasp.Communicator.UNKNOWN_ACTION);
  }
});