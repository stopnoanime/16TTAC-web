import { Compiler, Parser, Sim } from '16ttac-sim';
import { Injectable } from '@angular/core';
import { Subscription, timer } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SimService {
  public outputBuffer: string = '';

  private parser = new Parser();
  private compiler = new Compiler();
  private sim = new Sim({
    outputRawCallback: (n) => (this.outputBuffer += String.fromCharCode(n)),
    haltCallback: () => (this._simRunning = false),
  });

  private _simRunning = false;
  public get simRunning() {
    return this._simRunning;
  }
  private simRunningSubscription!: Subscription;

  constructor() {}

  public compile(sourceCode: string) {
    this.reset();
    this.sim.initializeMemory(
      this.compiler.compile(this.parser.parse(sourceCode))
    );
  }

  public reset() {
    this.sim.reset();
    this.outputBuffer = '';
    this._simRunning = false;
  }

  public singleStep() {
    this.sim.singleStep();
  }

  public startStop() {
    if (this._simRunning) {
      this._simRunning = false;
      this.simRunningSubscription.unsubscribe();
    } else {
      this._simRunning = true;
      this.runLoop();
    }
  }

  private runLoop() {
    if (!this._simRunning) return;
    this.singleStep();

    this.simRunningSubscription = timer(1000).subscribe(() => this.runLoop());
  }
}
