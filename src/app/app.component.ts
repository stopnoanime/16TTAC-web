import { Compiler, Parser, Sim } from '16ttac-sim';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  outputBuffer = ''

  parser = new Parser();
  compiler = new Compiler();

  sim = new Sim({
    outputRawCallback: (n) => this.outputBuffer += String.fromCharCode(n)
  });

  sourceCode = `'a' => OUT 'v' => OUT 'c' => OUT`

  compile() {
    this.sim.initializeMemory(this.compiler.compile(this.parser.parse(this.sourceCode)))
  }
  
  ngOnInit() {
  }


}
