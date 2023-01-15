import { parserOutput } from '16ttac-sim';
import { Component, OnInit } from '@angular/core';
import { SimService } from './sim.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(public sim: SimService) {}

  wasCompiled = false;
  memoryViewerHoveredAddress?: number;
  sourceCodeHoveredAddress?: number;
  parserOutput!: parserOutput;

  sourceCode = `
  word string[10] = "61293"

  string => PUSH
  string_to_number => CALL
  
  number_out => CALL
  NULL => HALT
  
  //Function that outputs a provided number
  //The number should be on the top of stack before calling it
  number_out:
    POP => ADR
    POP => ACC
    ADR => PUSH
    ACC => ADR

    0 => PUSH

    number_out_loop:
      10 => MOD
      0 => CARRY
      '0' => PLUS
      ACC => PUSH

      ADR => ACC
      10 => DIV
      ACC => ADR
        
      number_out_write => PC z
    number_out_loop => PC

    number_out_write:
      POP => ACC
      POP => PC z
      ACC => OUT
    number_out_write => PC
  
  //Function that converts provided string to number
  //String address should be on the top of stack before calling it
  string_to_number:
    POP => ACC
    POP => ADR
    ACC => PUSH

    0 => PUSH

    string_to_number_loop:
      MEM => ACC

      string_to_number_end => PC z

      POP => ACC
      10 => MUL
      MEM => PLUS
      0 => CARRY
      '0' => MINUS
      ACC => PUSH

      ADR => ACC
      1 => PLUS
      ACC => ADR
        
    string_to_number_loop => PC

    string_to_number_end:
      POP => ACC
      POP => ADR
      ACC => PUSH
      ADR => PC
  `;

  ngOnInit() {}

  compile() {
    const parserOutput = this.sim.compile(this.sourceCode);
    if (parserOutput === null) return; //Could not compile

    this.parserOutput = parserOutput;
    this.wasCompiled = true;
  }
}
