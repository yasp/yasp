# yasp-Assembler
yasp uses a custom assembler which was created a decade ago by a teacher of our school, [HTL Spengergasse](http://www.spengergasse.at/).
It has been designed to help students understand computers better and is therefore really simple and easy to learn.

## Basic Syntax
```
label:
        COMMAND parameter1, parameter2
        COMMAND parameter1
        ; comment
```

## Processor Features
* 32 byte registers: `b0` - `b31`
* 32 word registers: `w0` - `w31`
  * the content of the first 16 word-registers is equal to the byte-registers
* a number of IO-Pins, see [IO](#io)
* [Hardware-Interrupts](#interrupts)
* Carry and Zero-Flag
* [16-byte stack](#stack)
* [Simple subroutines](#subroutines)
* [PWM-Simulation](#pwm) (=> soft blinking LEDs)

## Commands
**This is only a list of the most important commands or instructions.**

Use the help-feature of the IDE to get a full list of commands and their parameters and descriptions.

### Basic Commands
All of these commands take two parameters:
* `register`, `register`
* `register`, `literal`

The result of the operation will be written into the frist parameter, the register.
* `MOV`
* `ADD` / `SUB`
* `DIV` / `MUL`
* `OR`, `XOR`, `AND`

```
MOV b0, 2
MOV b1, 3

ADD b0, b1 ; b0 is 5dec

MOV b3, 1

AND b3, b0 ; b3 is 4dec
; b0:     5dec = 00000101b
; b3:     1dec = 00000001b
; result: 1dec = 00000001b
```

## Sleep
`DELAY` can be used to wait for a certain time. Both literal and word-registers can be used as the parameter. `60000` equals ~900 milliseconds.

## Debugging
There are a few commands which can help you on debugging.
* `DEBUG` sends the value of a register to the debugger
* `PRINT` sends a string to the debugger

```
MOV b0, 42

DEBUG b0  ; send the value of b0 (42) to the debugger
PRINT str ; print a string on the debugger

str:
        STRING "hello tutorial!"
```

## Jumping
There instructions are used to control the program-flow.
* `JMP label`
* `JC label` / `JNC label` jump if the carry flag is (not) set
* `JZ label` / `JNZ label` jump if the zero flag is (not) set

```
main:
        INC b0   ; increment b0
        DEBUG b0
        JMP main
```

## Comparisons
You can use the `CMP`-Command to compare two values. If the values equal the zero-flag will be set, if the 2nd value is bigger than the first value, the carry flag will be set. Using `CMP` and `JC` one can build simple loops:

```
       MOV b0, 5   ; max loop count
       MOV b1, 0   ; counter
       
loop:
       PRINT str1
       INC b1      ; increment the couter
       CMP b0, b1  ; compare couter and max
       JZ endLoop  ; jump if they equal
       JMP loop    ; otherwise continue looping

endLoop:
       PRINT str2

trap:
       JMP trap ; loop infinitly


str1:
        STRING "loooping"
str2:
        STRING "done loooping"
```

## IO
There are a number of commands which can be used to control hardware connected to the emulator.
* `HIGH` / `LOW` turn a pin on or off
* `TOGGLE` invert a output pin
* `PIN` read binary value from pin
* `ADC0` / `ADC1` / `ADC2` read analogue value of the ADC-Pins

Toggling LEDs:
```
main:
        TOGGLE 3    ; switch LED on output-pin 3
        DELAY 30000 ; wait for ~450ms
        JMP main
```

Reading pushbutton:
```
main:
        PIN 1 ; read value from pushbutton
        ; PIN will set the zero-flag to 1 if the pins state is zero, so:
        ;  pin is on  => z = 0 => JNZ jumps
        ;  pin is off => z = 1 => JZ  jumps
        JNZ on
        JMP main

on:
        TOGGLE 3  ; toggle an LED each time a button is pressed
        JMP main
```

## Stack
There is a 16-byte-stack which can be accessed by the fairly standard `PUSH` and `POP`-instructions.

```
MOV b0, 0x20
MOV b1, 0x40
MOV b2, 0x60
; w0 = 0x2040
; w1 = 0x6000
; initial sp = -1


; b1 = 0x40
PUSH b1
; Stack = 0x40
; sp    = 0

; b1 = 0x20
PUSH b0
; Stack = 0x40 0x20
; sp    = 1

; b1 = 0x6000
PUSH w1
; Stack = 0x40 0x20 0x00 0x60
; sp    = 3

POP w0
; Stack = 0x40 0x20
; sp    = 1
; w0    = 0x6000
```

## Subroutines
Subroutinenesting is also supported using the stack.

```
main
        PRINT str1
        CALL subRout
        PRINT str2
        
        JMP main

subRout:
        PRINT str3
        RETURN

str1:
        STRING "main1"
str2:
        STRING "main2"
str3:
        STRING "sub"
```

## PWM
yasp supports the emulation of PWM-Outputs. This can be archived by switching an output-pin on and off rapidly. More information about the internal process can be found in the [Emulator Documentation](/emulator/emulator.md#pwm).

This code causes the LED to be dimmed:
```
pwm:
        HIGH 3
        PAUSE 3000
        LOW 3
        PAUSE 2000
        JMP pwm
```

## Interrupts
The emulator supports hardware-interrupts. To make them work you need two things:
* `ENABLE` enables interrupts based on the given bitmask
* `RETI` jumps out of an interrupt
* Interrupt-table
  * starts at `0x100`
  * `0x100` => jump-adress for pin 0
  * `0x102` => jump-adress for pin 1
  * `0x104` => jump-adress for pin 2
  * ...

```
; Interrupt-Mask:
; 7 6 5 4 3 2 1 0
; 0 0 0 0 0 1 1 0b = 3dec

ENABLE 3

main:
      TOGGLE 5
      JMP main

isr1:
      TOGGLE 3
      RETI

isr2:
      TOGGLE 4
      RETI


ORG 0x100 ; set the current position in the bitcode to 0x100
DW 0      ; skip pin 0
DA isr1   ; interrupt service routine for pin 1
DA isr2   ; interrupt service routine for pin 2
```

## Assembler-Directives
* `DW` write a literal word into the bitcode
* `DB` write a literal byte into the bitcode
* `DA` write a literal label-adress into the bitcode
* `ORG` set the current position in the bitcode
* `STRING` write a zero-terminated string into the bitcode
* `DEFINE` defines a assemble-time constant which will be replaced before the actual assembling process 
