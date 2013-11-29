if (typeof yasp == 'undefined') yasp = { };

yasp.communicatorTester = function (cases, file) {
  var comm = null;
  var filename = file.substr(file.lastIndexOf("/") + 1);

  module("communicator: " + filename, {
    setup: function () {
      comm = new yasp.Communicator(file);
    },
    teardown: function () {
      comm = null;
    }
  });

  /*

   {
     title: "",
     action: "",
     payload: { },
     expectedPayload: { },
     expectedError: { }
   }

   */
  function generateTest(params) {
    asyncTest(params.title,
      function () {
        comm.sendMessage(params.action, params.payload,
          function (resp) {
            deepEqual(resp.error, params.expectedError, "error");
            deepEqual(resp.payload, params.expectedPayload, "payload");
            start();
          }
        )
      }
    );
  }

  for (var i = 0; i < cases.length; i++) {
    cases[i].title = "communicator[" + filename + "][" + cases[i].action + "]: " + cases[i].title;
    generateTest(cases[i])
  }

};