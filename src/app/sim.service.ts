import { Compiler, Parser, Sim } from '16ttac-sim';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SimService {

  public outputBuffer: string = '';

  private parser = new Parser();
  private compiler = new Compiler();
  private sim = new Sim({
    outputRawCallback: (n) => this.outputBuffer += String.fromCharCode(n),
    haltCallback: () => this._simRunning = false,
  });

  private _simRunning = false
  public get simRunning() {
    return this._simRunning
  }

  constructor() { }

  public compile(sourceCode: string) {
    this.reset()
    this.sim.initializeMemory(this.compiler.compile(this.parser.parse(sourceCode)))
  }

  public reset() {
    this.sim.reset();
    this.outputBuffer = '';
  }

  public singleStep() {
    this.sim.singleStep();
  }

  public startStop() {
    if(this._simRunning) {
      this._simRunning = false;
    } else {
      this._simRunning = true;
      this.runLoop();
    }
  }

  private runLoop() {
    if (!this._simRunning) return;
    this.singleStep();

    setTimeout(() => this.runLoop(), 1000);
  }
}
