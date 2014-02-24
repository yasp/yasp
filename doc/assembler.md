# Assembler
The assembler of yasp is very simple and straightforward. It is case insensitive and implemented in a multi pass architecture.

There are two different types of statements in the syntax:

## Instruction
An instruction is a command string followed by zero, one or two commands (the assembler itself would support even more!).

There are two distinction between instructions in the assembler itself, but are not visible to the end-user:
* Directives
* Commands

*Directives* are compile-time instructions to the assembler which are not directly converted into bitcode. Following directives currently exist:
* `DW` write a literal word into the bitcode (length: 2 bytes)
* `DB` write a literal byte into the bitcode (length: 1 byte)
* `DA` write a literal label-adress into the bitcode (length: 2 bytes)
* `ORG` set the current position in the bitcode (see [Interrupts](#interrupts))
* `STRING` write a zero-terminated string into the bitcode (see [Debugging](#debugging))
* `DEFINE` defines a assemble-time constant which will be replaced before the actual assembling process 
* `END`: quits current assembling at the current position, any further code will be ignored

Note: The data directives (`DW`, `DB`, `DA`, `STRING`) are capable of writing multiple values to the bitcode, simply by seperation by a comma.

The directives are parsed in the function `yasp.Parser.prototype.parseDirective` in `assembler/parser.js`.

*Commands* are defined in the `instructions.js` file and are dynamically loaded. The commands are parsed in the function `yasp.Parser.prototype.parseCommand` in `assembler/parser.js`

For more information see [Instructions](#instructions).
### Example
```
MOV b0, b1
```

## Label
A label is a string followed by ":", indicating that it is a label. Labels are parsed in the function `yasp.Parser.prototype.parseLabel` in `assembler/parser.js`.

Important note about label names:
* Cannot have the same name as a register or similiar names (b1, or b1000)
* Cannot only contain alphanumeric characters, "_" and "-"
* Cannot have the same name as an instruction or directive
* Just numbers are also not allowed

### Example
```
myAwesomeLabel:
```

## Multi-Pass Architecture
The assembler is divided into 4 passes:
* Lexer
* Analyser
* Parser
* Generator

The assembler is managing all the passes and holding information necassary for the editor, debugger and assembler itself. Additionally if features some helper functions for iterating over the token array (`yasp.TokenIterator`) and other util functions (`yasp.Assembler.prototype.riseSyntaxError`).

The function `yasp.Assembler.prototype.assemble` is responsible for all the assembling. The function is returning the following data structure if assembling was successful:
```
{
  success: true,
  bitcode: new Uint8Array(),
  symbols: symbols,
  map: { }, // key: line number, value: instruction position
  ast: astArray
};
```

If compiling fails:
```
{
  success: false,
  errors: errors,
  symbols: symbols // only if it could be generated
  ast: astArray // only if it could be generated
};
```

error structure:
```
[ {
  type: errorType, // currently: minor and error, error causing the compilation to be stopped and minor to be continued
  name: "E_ERR",
  line: error_line,
  char: error_character,
  message: error_msg
}, ...]
```

symbol structure:
```
{
  labels: { }, // key: labelname, value: label token (containing the line and character)
  usedRegisters: { }, // key: register, value: number of times used
  defines: { }, // key: define name value: replace with
  instructions: { } // key: instruction name, value: number of times used
}
```

### Lexer
This pass divides the source code into small *atomic* pieces, it also removes all comments in the input file. The result of the Lexer is an array containing all the tokens.

For more information see `assembler/lexer.js`.

### Analyser
In this pass all label names and `DEFINE`s are identified. This has to be implemented so backwards definitions of labels are possible (`JMP lbl \n lbl:`), same reason applies to defines.

For more information see `assembler/analyser.js`.

### Parser
The parser is responsible for doing the following tasks:
* Generating the abstract syntax "tree" (in assembler the tree is more or less just an array)
* Generating the symbol table, used by the editor and debugger
* Check semantic and syntax

For more information see `assembler/parser.js`.

### Generator
The generator generates the bitcode out of the given AST, which can be executed by the emulator.

It is divided into the following sub-steps:
* Calculate bit-sizes: This one is used to get proper label addresses
* Generate bit-code: This one finally generates the bitcode.

Additionally it has following tasks:
* Generate bitcode
* Generate map (Used for converting line numbers to instruction positions)


The generator uses the `yasp.BitWriter`, which is used to write simple bit data (internally writes into a string and returns an Uint8Array).

For more information see `assembler/generator.js`.

## EBNF
To give a rough overview of the syntax here is an EBNF of the syntax.
```
byteregister ::= "b0" | "b1" | "b2" | "b3" | "b4" | "b5" | "b6" | "b7" | "b8" | "b9" | "b10" | "b11" | "b12" | "b13" | "b14" | "b15" | "b16" | "b17" | "b18" | "b19" | "b20" | "b21" | "b22" | "b23" | "b24" | "b25" | "b26" | "b27" | "b28" | "b29" | "b30" | "b31";

wordregister ::= "w0" | "w1" | "w2" | "w3" | "w4" | "w5" | "w6" | "w7" | "w8" | "w9" | "w10" | "w11" | "w12" | "w13" | "w14" | "w15" | "w16" | "w17" | "w18" | "w19" | "w20" | "w21" | "w22" | "w23" | "w24" | "w25" | "w26" | "w27" | "w28" | "w29" | "w30" | "w31";

simpleliteral ::= "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
literal ::= simpleliteral | ("0x" , simpleliteral);

symbol ::= "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t"  | "u" | "v" | "w" | "x" | "y" | "z"  | literal;

whitespaces ::= " " , {" "};

newline ::= "\n";

labelsymbol ::= symbol | "_" | "-";
label ::= labelsymbol , { labelsymbol };
labeldef ::= label , ":" , newline;


instruction ::= symbol , { symbol };
param ::= byteregister | wordregister | literal | label;
instructiondef ::= instruction , (newline | param | (param , whitespaces , "," , whitespaces , param);

stringdef ::= ("string" , whitespaces , "\"" , ALL_ASCII_CHARACTERS , "\"" , [whitespaces, "," , "\"" , ALL_ASCII_CHARACTERS , "\""]);
datadef ::= (("db" | "dw") , whitespaces , literal , [whitespaces, "," , literal]);
dadef ::= ("da" , whitespaces , literal , [whitespaces, "," , literal]);
orgdef ::= "org", whitespaces, literal;
enddef ::= "end";
definedef ::= "define", whitespaces, label, whitespaces, label;
directivedef ::= datadef | stringdef | dadef | orgdef | enddef | definedef;

statement ::= {" "} , (labeldef | instructiondef | directivedef) , {" "} , newline;

program ::= { statement };

```
