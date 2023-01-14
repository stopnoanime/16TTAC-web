import { Compiler, Parser, Sim } from '16ttac-sim';
import { Injectable } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { asapScheduler, asyncScheduler } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SimService {
  public outputBuffer: string = '';
  public simTimeout: number = 1000;
  public fullSpeed: boolean = false;
  public get simRunning() {
    return this._simRunning;
  }

  public get acc() {
    return this.sim.acc;
  }
  public get adr() {
    return this.sim.adr;
  }
  public get pc() {
    return this.sim.pc;
  }
  public get carry() {
    return this.sim.carry;
  }
  public get zero() {
    return this.sim.zero;
  }

  public get memory() {
    return this.sim.memory;
  }

  public get stack() {
    return this.sim.stack;
  }
  public get stackPointer() {
    return this.sim.stackPointer;
  }

  public parser = new Parser();
  private compiler = new Compiler();
  private sim = new Sim({
    outputRawCallback: (n) => {
      this.outputBuffer += String.fromCharCode(n);
    },
    haltCallback: () => {
      this._simRunning = false;
      this.outputBuffer += '\nHalting.';
    },
  });

  private _simRunning = false;
  private simRunningSubscription!: Subscription;

  constructor() {}

  public compile(sourceCode: string) {
    this.reset();
    const parserOutput = this.parser.parse(sourceCode);

    this.sim.initializeMemory(this.compiler.compile(parserOutput));

    return parserOutput;
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
    for (let i = 0; i < (this.fullSpeed ? 1_000_000 : 1); i++) {
      if (!this._simRunning) return;
      this.singleStep();
    }

    this.simRunningSubscription = asyncScheduler.schedule(
      () => this.runLoop(),
      this.fullSpeed ? undefined : this.simTimeout
    );
  }
}
