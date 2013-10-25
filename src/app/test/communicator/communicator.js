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
    comm.sendMessage('test', {
      testPayload: 42
    }, function(data) {
      equal(data.payload.testPayload, 42, "ensure data not corrupted");
      start();
    })
  });
})();