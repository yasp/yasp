if (typeof yasp == 'undefined') yasp = { };
importScripts('../communicator.js', '../commands.js', '../utils.js', 'passes/analyser.js', 'passes/generator.js', 'passes/lexer.js', 'passes/parser.js', 'assembler.js');

var assembler = new yasp.Assembler();

new yasp.CommunicaterBackend(self, function(data, ready, broadcast) {
  switch (data.action) {
    case "ASSEMBLE":
      console.log("ASSEMBLE "+data.payload.code);
      var result = assembler.assemble({
        code: data.payload.code,
        jobs: data.payload.jobs
      });
      
      var payload = null;
      var error = null;
      if (!!result.success) {
        payload = result;
      } else {
        error = result;
      }
      delete result.success; // this is not necessary
      ready({
        payload: payload,
        error: error
      });
      break;
    default:
      ready(yasp.Communicator.UNKNOWN_ACTION);
  }
});