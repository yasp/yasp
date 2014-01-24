<p align="center">
  <img src="src/app/img/logo.png" />
</p>

yasp is a fully functional web-based assembler development environment, including a real assembler and debugger.
The assembler dialect is a custom which is held very simple so as to keep the learning curve as shallow as possible.
It also features some hardware-elements (LED, Potentiometer, Button, etc.). The main purpose of this project
is to create an environment in which students can learn the assembly language so that they understand computers better.
Furthermore it allows them to experiment without the fear of breaking something.

The original project team of yasp consists of Robert Fischer and Michael "luto" Lutonsky. For more information take
a look at the about-section in the IDEs menu.

## Online-Demo
* IDE: http://yasp.me/yasp/src/
* Test environment: http://yasp.me/yasp/src/app/test/repl.html

## License
yasp is licensed under the GPLv3-License, for details see [`LICENSE.txt`](LICENSE.txt).

## Development

### Setup
To develop on yasp you'll need npm and grunt.
```
$ git clone git@github.com:yasp/yasp.git
$ cd yasp
$ npm install      # download grunt-dependencies
$ grunt deps       # download web-dependecies
$ grunt commandsjs # build help and instructions
```

### Server
yasp can additionally upload code-files to an simple server which can be found in the [server repository](https://github.com/yasp/server).

### Documentation
The documentation lives in the [/doc/](/doc/)-directory. Additional documentation in the German language can be found on the [project homepage](http://yasp.me).

**If you think that something is lacking documentation please [create an issue](https://github.com/yasp/yasp/issues/new).**

### Hacking
* [`/src/app/`](/src/app/), IDE
* [`/src/app/instructions`](/src/app/instructions), all instruction files, see [instructions.md](/doc/instructions.md)
* [`/src/app/js/editor/breadboard/`](/src/app/js/editor/breadboard/), breadboards, see [breadboards.md](/doc/breadboards.md)
* [`/src/app/langs/`](/src/app/langs/), languages for l10n, see [l10n.md](/doc/l10n.md)
* [`/src/app/js/assembler`](/src/app/js/assembler), home of the assembler
* [`/src/app/js/emulator`](/src/app/js/emulator), home of the emulator, see [emulator.md](/doc/emulator/emulator.md)
* [`/src/app/js/hardware`](/src/app/js/hardware), home of the hardware, see [hardware.md](/doc/hardware.md)
* [`/src/app/test/index.html`](/src/app/test/index.html), unit-tests
* [`/src/app/test/hardware.html`](/src/app/test/hardware.html), hardware-demo
* [`/src/app/test/repl.html`](/src/app/test/repl.html), interactive assembler/emulator-interface
