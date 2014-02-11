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
  TokenName4TokenType[yasp.TokenType.STRING] = "string2";
  
  CodeMirror.defineMode("assembler", function(config, parserConfig) {
    var indentUnit = config.indentUnit || config.tabSize || 2
    
    return {
      // electricChars: ' ', buggy
      startState: function() {
        return {
          labels: [ ]
        };
      },
      token: function(stream, state) {
        // check if comment
        if (stream.peek() == ';') {
          stream.skipToEnd();
          return "comment";
        } else {
          var line = stream.string, pos = stream.pos;
          var tokens = !!state.tokens ? state.tokens : new yasp.Lexer().pass({ }, line);
          
          // bad code is bad
          for (var i = 0; i < tokens.length; i++) {
            var t = tokens[i];
            if (t.char-1 == pos) {
              for (var j = 0; j < t.text.length; j++) {
                stream.next();
              }
              var type = t.getType();
              if (type == yasp.TokenType.LABEL) {
                state.labels.push(t.name); // used to force CodeMirror to redraw if changed
                // does this label really exist?
                if (!yasp.Editor.symbols.labels[t.text.toUpperCase()]) {
                  return TokenName4TokenType[yasp.TokenType.UNKNOWN];
                }
              }
              
              return TokenName4TokenType[type];
            }
          }
          stream.next();
          return "";
        }
      },
      indent: function(state, textAfter) {
        var tokens = !!state.tokens ? state.tokens : new yasp.Lexer().pass({ }, textAfter);
        
        if (tokens.length == 1) return indentUnit; // lexer always appends \n
        var t = tokens[0];
        if (t.text.toUpperCase() == "END") return 0;
        
        switch (t.getType()) {
          case yasp.TokenType.LABEL:
            if (tokens.length > 2 && tokens[1].text == ':') {
              return 0;
            } else {
              return indentUnit;
            }
          default:
            return indentUnit;
        }
      }
    };
  });
  
  CodeMirror.defineMIME("text/assembler", "assembler");
})();