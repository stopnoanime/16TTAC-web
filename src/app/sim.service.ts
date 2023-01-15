import { Compiler, Parser, Sim } from '16ttac-sim';
import { Injectable } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { asapScheduler, asyncScheduler } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SimService {
  public timeout: number = 1000;
  public fullSpeed: boolean = false;

  public get output() {
    return this._outputBuffer;
  }

  public set input(s: string) {
    this._inputBuffer += s;
  }

  public get running() {
    return this._running;
  }

  public get simProp(): simPropType {
    return {
      acc: this.sim.acc,
      adr: this.sim.adr,
      pc: this.sim.pc,
      carry: this.sim.carry,
      zero: this.sim.zero,
      memory: this.sim.memory,
      stack: this.sim.stack,
      stackPointer: this.sim.stackPointer,
    };
  }

  private _outputBuffer: string = '';
  private _inputBuffer: string = '';
  private _running = false;
  private simRunningSubscription!: Subscription;

  private parser = new Parser();
  private compiler = new Compiler();
  private sim = new Sim({
    outputRawCallback: (n) => (this._outputBuffer += String.fromCharCode(n)),
    haltCallback: () => {
      this._running = false;
      this._outputBuffer += '\nHalting.';
    },
    inputAvailableCallback: () => this._inputBuffer.length > 0,
    inputRawCallback: () => {
      const char = this._inputBuffer.charCodeAt(0);
      this._inputBuffer = this._inputBuffer.substring(1);
      return char;
    },
  });

  constructor() {}

  public compile(sourceCode: string) {
    this.reset();

    try {
      const parserOutput = this.parser.parse(sourceCode);
      this.sim.initializeMemory(this.compiler.compile(parserOutput));
      return parserOutput;
    } catch (e: any) {
      this._outputBuffer = e.message;
      return null;
    }
  }

  public reset() {
    this.sim.reset();
    this._outputBuffer = '';
    this._inputBuffer = '';
    this._running = false;
  }

  public singleStep() {
    this.sim.singleStep();
  }

  public startStop() {
    if (this._running) {
      this._running = false;
      this.simRunningSubscription.unsubscribe();
    } else {
      this._running = true;
      this.runLoop();
    }
  }

  private runLoop() {
    for (let i = 0; i < (this.fullSpeed ? 1_000_000 : 1); i++) {
      if (!this._running) return;
      this.singleStep();
    }

    this.simRunningSubscription = asyncScheduler.schedule(
      () => this.runLoop(),
      this.fullSpeed ? undefined : this.timeout
    );
  }
}

export type simPropType = {
  acc: number;
  adr: number;
  pc: number;
  carry: boolean;
  zero: boolean;
  memory: Uint16Array;
  stack: Uint16Array;
  stackPointer: number;
};
