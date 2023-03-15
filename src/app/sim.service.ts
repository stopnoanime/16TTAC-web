import {
  Compiler,
  exampleProgram,
  Parser,
  parserOutput,
  Sim,
} from '16ttac-sim';
import { Injectable } from '@angular/core';
import { asyncScheduler, Subject, Subscription } from 'rxjs';
import { breakpointsType } from './code-editor/code-editor.component';
import { CodeService } from './code.service';

@Injectable({
  providedIn: 'root',
})
export class SimService {
  public timeout: number = 1000;
  public fullSpeed: boolean = false;
  public breakpoints: breakpointsType = {};

  public outputEvent = new Subject<string>();
  public clearEvent = new Subject<void>();

  public set input(s: string) {
    this._inputBuffer += s;
  }

  public set sourceCode(s: string) {
    this._sourceCode = s;
    this._compiled = false;
  }

  public get sourceCode() {
    return this._sourceCode;
  }

  public get running() {
    return this._running;
  }

  public get compiled() {
    return this._compiled;
  }

  public get parserOutput() {
    return this._parserOutput;
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
  private _compiled = false;
  private _sourceCode: string = exampleProgram;
  private _parserOutput!: parserOutput;
  private simRunningSubscription!: Subscription;

  private parser = new Parser();
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

  /**
   * Compile code stored in `sourceCode`
   */
  public compile() {
    this.reset();

    try {
      this._parserOutput = this.parser.parse(this._sourceCode);
      this.sim.initializeMemory(this.compiler.compile(this.parserOutput));
      this.outputEvent.next('Compiled successfully.\n');
      this._compiled = true;
    } catch (e: any) {
      this.outputEvent.next(e.message);
      this._compiled = false;
    }
  }

  /**
   * Reset the CPU and Terminal
   */
  public reset() {
    this.sim.reset();
    this.clearEvent.next();
    this._inputBuffer = '';
    this._running = false;
  }

  /**
   * Single step the CPU
   */
  public singleStep() {
    this.sim.singleStep();
    this.checkBreakpoints();
  }

  /**
   * Start or stop the CPU
   */
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
