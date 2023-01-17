# 16TTAC-web

![screenshot](/page-screenshot.png)

16TTAC-web is a web-based frontend and editor for [16TTAC-sim](https://github.com/stopnoanime/16TTAC-sim).
It allows for writing, compiling, and debugging code for the imaginary 16TTAC CPU.

## [Check it out here](https://stopnoanime.github.io/16TTAC-web/)

## Features
- syntax highlighting
- code autocompletion
- automatic syntax validation
- terminal for IO
- breakpoints
- CPU registers viewer
- memory and stack viewer
- highlighting current PC and ADR location in the memory viewer and code editor

## Usage guide
Documentation of the 16TTAC, including assembly syntax and instructions, can be found [here](https://github.com/stopnoanime/16TTAC-sim).

After writing the code, click the `Compile` button to compile the code. Then you can either single-step through the code with the `Single step` button, or run it using the `Start` button. If running code you can change the execution speed using the `CPU speed` slider. Check the `Full speed` checkbox to make the CPU run as fast as possible.

### Some general editor tips:
- Hovering on any compiled instruction highlights its address in the memory viewer, the opposite is also true.
- To set breakpoints click on the code editor gutter.
- You can scroll on the memory viewer to change the address offset.

## Technical info

This project is written in TypeScript using the Angular framework.
It uses [Ace Editor](https://github.com/ajaxorg/ace) as the code editor, and [Xterm.js](https://github.com/xtermjs/xterm.js) as the terminal. 
Unit tests are implemented with [Jasmine](https://github.com/jasmine/jasmine) and [Karma](https://github.com/karma-runner/karma).
E2E tests are implemented with [Cypress](https://github.com/cypress-io/cypress).

## Running the editor locally

```
$ git clone https://github.com/stopnoanime/16TTAC-web
$ cd 16TTAC-web
$ npm i
# npp start
```
