<p align="center">
  <img src="src/app/img/logo.png" />
</p>

yasp is a fully functional web-based assembler development environment, including a real assembler, emulator and debugger.
The assembler dialect is a custom which is held very simple so as to keep the learning curve as shallow as possible.
It also features some hardware-elements (LED, Potentiometer, Button, etc.). The main purpose of this project
is to create an environment in which students can learn the assembly language so that they understand computers better.
Furthermore it allows them to experiment without the fear of breaking something.

The original project team of yasp consists of Robert Fischer and Michael "luto" Lutonsky. For more information take
a look at the about-section in the IDEs menu.

## Online-Demo
A hosted version of yasp can be found on http://demo.yasp.me/.

## License
yasp is licensed under the GPLv3-License, for details see [`LICENSE.txt`](LICENSE.txt).

## Development

### Setup
To develop on yasp you'll need nodejs.
```
$ npm install -g grunt-cli   # install grunt (if needed)
$ git clone git@github.com:yasp/yasp.git
$ cd yasp
$ npm install      # download grunt-dependencies
$ grunt deps       # download web-dependecies
$ grunt commandsjs # build help and instructions
$ grunt http       # start development http-server
```

### Setup on Windows
1. get nodejs vom http://nodejs.org/
2. get msysgit http://code.google.com/p/msysgit/downloads/list?q=full+installer+official+git
4. open CMD and and follow the linux-setup

### Grunt-Tasks
* `deps` download all client dependencies
* `commandsjs` build help and commands.js, see [instructions.md](/doc/instructions.md)
* `watchcommands` watch-task for `commandsjs`
* `http` start a development http-server
* `doc` builds jsdoc to `/doc/jsdoc/`
* `watchdoc` watch-task for `doc`

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
* [`/src/test/index.html`](/src/test/index.html), unit-tests
* [`/src/test/hardware.html`](/src/test/hardware.html), hardware-demo
* [`/src/test/repl.html`](/src/test/repl.html), interactive assembler/emulator-interface
