import { TestBed } from '@angular/core/testing';
import { last, take } from 'rxjs';

import { SimService } from './sim.service';

describe('SimService', () => {
  let service: SimService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SimService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should compile', () => {
    service.sourceCode = 'NULL => NULL';
    service.compile();

    expect(service.compiled).toBeTrue();
    expect(service.parserOutput).toBeTruthy();
  });

  it('should reset compiled state on source code change', () => {
    service.compile();
    expect(service.compiled).toBeTrue();

    service.sourceCode = 'change';
    expect(service.compiled).toBeFalse();
  });

  it('should output error on bad input', () => {
    service.outputEvent.subscribe((text) => {
      expect(text).toContain('Expected');
    });

    service.sourceCode = 'abc';
    service.compile();
  });

  it('should output confirmation on compile', () => {
    service.outputEvent.subscribe((text) => {
      expect(text).toContain('Compiled successfully');
    });

    service.sourceCode = 'NULL => NULL';
    service.compile();
  });

  it('should single step', () => {
    service.sourceCode = '123 => PUSH';
    service.compile();
    service.singleStep();

    expect(service.simProp.stackPointer).toBe(1);
    expect(service.simProp.stack[0]).toBe(123);
  });

  it('should output halt message on halt', () => {
    service.outputEvent.pipe(take(2), last()).subscribe((text) => {
      expect(text).toContain('Halting');
    });

    service.sourceCode = 'NULL => HALT';
    service.compile();
    service.singleStep();
  });

  it('should reset', () => {
    service.singleStep();
    service.singleStep();
    service.reset();

    expect(service.simProp.pc).toBe(0);
  });

  it('should start', () => {
    jasmine.clock().install();

    service.timeout = 100;
    service.sourceCode = '123 => PUSH 1234 => PUSH 12345 => PUSH';
    service.compile();
    service.startStop();

    jasmine.clock().tick(200);

    expect(service.simProp.stackPointer).toBe(3);
    expect([...service.simProp.stack.slice(0, 3)]).toEqual([123, 1234, 12345]);

    jasmine.clock().uninstall();
  });

  it('should start at full speed', () => {
    service.sourceCode = '123 => PUSH 1234 => PUSH 12345 => PUSH NULL => HALT';
    service.compile();
    service.fullSpeed = true;
    service.startStop();

    expect(service.simProp.stackPointer).toBe(3);
    expect([...service.simProp.stack.slice(0, 3)]).toEqual([123, 1234, 12345]);
  });

  it('should output data', () => {
    service.outputEvent.pipe(take(2), last()).subscribe((text) => {
      expect(text).toBe('a');
    });

    service.sourceCode = `'a' => OUT`;
    service.compile();
    service.singleStep();
  });

  it('should read input data', () => {
    service.sourceCode = `IN => ACC`;
    service.compile();
    service.input = 'x';
    service.singleStep();

    expect(service.simProp.acc).toBe('x'.charCodeAt(0));
  });

  it('should stop on breakpoint', () => {
    service.sourceCode = `
    NULL => NULL
    NULL => NULL
    NULL => HALT
    `;
    service.compile();
    service.fullSpeed = true;
    service.breakpoints = {
      1: [22, 34],
    };
    service.startStop();

    expect(service.simProp.pc).toBe(1);
  });
});
