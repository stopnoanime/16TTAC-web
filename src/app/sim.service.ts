import { Compiler, Parser, parserOutput, Sim } from '16ttac-sim';
import { Injectable } from '@angular/core';
import { Subject, Subscription, timer } from 'rxjs';
import { asapScheduler, asyncScheduler } from 'rxjs';
import { CodeService } from './code.service';

@Injectable({
  providedIn: 'root',
})
export class SimService {
  public timeout: number = 1000;
  public fullSpeed: boolean = false;
  public breakpoints: { [key: number]: [number, number] } = {};

  public outputEvent = new Subject<string>();
  public clearEvent = new Subject<void>();

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

  private _inputBuffer: string = '';
  private _running = false;
  private simRunningSubscription!: Subscription;

  private parser = new Parser();
  private parserOutput!: parserOutput;
  private compiler = new Compiler();
  private sim = new Sim({
    outputRawCallback: (n) => this.outputEvent.next(String.fromCharCode(n)),
    haltCallback: () => {
      this._running = false;
      this.outputEvent.next('\nHalting.');
    },
    inputAvailableCallback: () => this._inputBuffer.length > 0,
    inputRawCallback: () => {
      const char = this._inputBuffer.charCodeAt(0);
      this._inputBuffer = this._inputBuffer.substring(1);
      return char;
    },
  });

  constructor(private codeService: CodeService) {}

  public compile(sourceCode: string) {
    this.reset();

    try {
      this.parserOutput = this.parser.parse(sourceCode);
      this.sim.initializeMemory(this.compiler.compile(this.parserOutput));
      return this.parserOutput;
    } catch (e: any) {
      this.outputEvent.next(e.message);
      return null;
    }
  }

  public reset() {
    this.sim.reset();
    this.clearEvent.next();
    this._inputBuffer = '';
    this._running = false;
  }

  public singleStep() {
    this.sim.singleStep();
    this.checkBreakpoints();
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
    for (let i = 0; i < (this.fullSpeed ? 100_000 : 1); i++) {
      if (!this._running) return;
      this.singleStep();
    }

    this.simRunningSubscription = asyncScheduler.schedule(
      () => this.runLoop(),
      this.fullSpeed ? undefined : this.timeout
    );
  }

  private checkBreakpoints() {
    if (Object.keys(this.breakpoints).length === 0) return;

    const addressSourceRange =
      this.codeService.getSourceCodeIndexRangeForAddress(
        this.simProp.pc,
        this.parserOutput
      );
    if (!addressSourceRange) return;

    for (const key in this.breakpoints) {
      if (
        this.breakpoints[key][0] <= addressSourceRange[1] &&
        addressSourceRange[0] <= this.breakpoints[key][1]
      ) {
        this._running = false;
        this.outputEvent.next(
          `\nBreakpoint at line ${Number(key) + 1} and address ${
            this.simProp.pc
          }.`
        );
        return;
      }
    }
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
