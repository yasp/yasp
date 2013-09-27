if (typeof yasp == 'undefined') yasp = { };

(function() {
    /**
     * @class Assembler is responsible for generating the bytecode from the assembler
     */
    yasp.Assembler = function() {
        this.jobs = [ ];

        // results
        this.map = null;
        this.symbols = null;
        this.result = null;

        this.passes = [
            new yasp.Lexer(),
            new yasp.Checker(),
            new yasp.Analyser(),
            new yasp.PreProcessor(),
            new yasp.Parser(),
            new yasp.Generator()
        ];
    };

    /**
     * @function Assembles the files
     */
    yasp.Assembler.prototype.assemble = function(params) {
        this.jobs = params.jobs;

        var tmpResult = params.code;
        for (var i = 0; i < this.passes.length; i++) {
            tmpResult = this.passes[i].pass(this, tmpResult);
        }
        this.result = tmpResult;
        return this.result;
    };

    /**
     * @function Rises a syntax error
     */
    yasp.Assembler.prototype.riseSyntaxError = function(msg, line, char) {
        // TODO make this better
        console.log("Syntax error: " + msg + " in line " + line + " at character " + char);
    }
})();