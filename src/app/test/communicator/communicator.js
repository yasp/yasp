(function() {
  var comm = null;
  module("communicator", {
    setup: function() {
      comm = new yasp.Communicator('communicator/test_backend.js');
    },
    teardown: function() {
      comm.terminate();
      comm = null;
    }
  });
  asyncTest("ensure sending message works", function() {
    comm.sendMessage('test', { }, function(data) {
      equal(data.payload, 42, "ensure data not corrupted");
      start();
    });
  });
  asyncTest("ensure sending broadcasts works", function() {
    comm.subscribe("AWESOME_event", function(data) {
      equal(data.payload, 42, "ensure data not corrupted");
      start();
    });
    comm.sendMessage('broadcast', { });
  });
})();