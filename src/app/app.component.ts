import { parserOutput, exampleProgram } from '16ttac-sim';
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

  sourceCode = exampleProgram;

  ngOnInit() {}

  compile() {
    const parserOutput = this.sim.compile(this.sourceCode);
    if (parserOutput === null) return; //Could not compile

    this.parserOutput = parserOutput;
    this.wasCompiled = true;
  }
}
