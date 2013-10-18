// Assembler mode
(function() {
  var TokenName4TokenType = { };
  TokenName4TokenType[yasp.TokenType.COMMAND] = "keyword";
  TokenName4TokenType[yasp.TokenType.LABEL] = "def";
  TokenName4TokenType[yasp.TokenType.NUMBER] = "number";
  TokenName4TokenType[yasp.TokenType.NEGATIVE_NUMBER] = "error";
  TokenName4TokenType[yasp.TokenType.BYTE_REGISTER] = "variable";
  TokenName4TokenType[yasp.TokenType.WORD_REGISTER] = "variable";
  TokenName4TokenType[yasp.TokenType.DIRECTIVE] = "keyword";
  TokenName4TokenType[yasp.TokenType.UNKNOWN_REGISTER] = "error";
  TokenName4TokenType[yasp.TokenType.UNKNOWN] = "error";
  TokenName4TokenType[yasp.TokenType.DELIMITER] = "qualifier";
  
  CodeMirror.defineMode("assembler", function() {
    return {
      token: function(stream) {
        // check if comment
        if (stream.peek() == ';') {
          stream.skipToEnd();
          return "comment";
        } else {
          var lexer = new yasp.Lexer();
          var line = stream.string, pos = stream.pos;
          var tokens = lexer.pass({ }, line);
          
          // bad code is bad
          for (var i = 0; i < tokens.length; i++) {
            var t = tokens[i];
            if (t.char-1 == pos) {
              for (var j = 0; j < t.text.length; j++) {
                stream.next();
              }
              return TokenName4TokenType[t.getType()];
            }
          }
          stream.next();
          return "";
        }
      }
    };
  });
  
  CodeMirror.defineMIME("text/assembler", "assembler");
})();