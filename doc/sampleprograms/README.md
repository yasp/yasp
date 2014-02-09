# Sample programs
These are sample programs which were used to test yasp during the development. They have all been documented and formatted nicely.

## 01
Light a different LED depending on a potentiometers state.

Used commands:
* CMP
* ADC, LOW, HIGH
* DEBUG
* JNZ, JMP

## 02
Dimm an LED using PWM (Pulse width modulation). The light level of the LED is controllable via two buttons.

Used commands:
* MOV, INC, DEC
* HIGH, LOW, PIN
* DELAY
* JNZ, JZ, JMP

## 03
Dimm an LED using PWM (Pulse width modulation). The light level of the LED can be changed via an potentiometer.

Used commands:
* MOV, INV
* ADC, HIGH, LOW
* DELAY
* JMP

## 04
A very basic program to test various register commands.

Used commands:
* MOV, INC, ADD
* DEBUG
* JMP

## 05
The green LED blinks and the other LEDs are controlled via button-interrupts.

Used commands:
* LOW, TOGGLE
* PAUSE
* JMP
* ENABLE, RETI

Used directives:
* ORG, DA

## 06
Light a LED if the button is not pressed.

Used commands:
* HIGH, LOW, PIN
* JZ, JMP

## 07
Increment or decrement the register w0 by pressing the buttons. This is done using interrupts.

Used commands:
* MOV, INC, DEC
* TOGGLE
* DEBUG
* DELAY
* JMP
* ENABLE, RETI

Used directives:
* ORG, DA

## 08
Toggle the red LED every 0.5 seconds.

Used commands:
* HIGH, LOW
* DELAY
* JMP

## 09
Simulate a traffic light using the 3 LEDs (red, green, yellow).

Used commands:
* MOV
* DELAY
* HIGH, LOW
* JMP

## 10
Test various bit-commands.

Used commands:
* MOV, OR, RL, RR, DEC
* JNZ, JMP

## 11
Output a counter via the debugger by overwriting parts of a string.

Used commands:
* MOV, ADD, LA, CMP, INC
* PRINT
* WRROM
* JZ, JMP

Used directives:
* STRING

## 12
Copy a string in the ROM to an other location. This is done using subroutines and the WRROM and RDROM commands.

Used commnands:
* MOV, LA, INC, CMP
* CALL, RET
* BREAK
* WRROM, RDROM
* JZ, JMP

Used directives:
* ORG
* STRING
