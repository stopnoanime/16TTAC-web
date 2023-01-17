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

  it('should output error on bad input', () => {
    service.outputEvent.subscribe((text) => {
      expect(text).toContain('Expected');
    });
    service.compile('abc');
  });

  it('should output confirmation on compile', () => {
    service.outputEvent.subscribe((text) => {
      expect(text).toContain('Compiled successfully');
    });
    service.compile('NULL => NULL');
  });

  it('should single step', () => {
    service.compile('123 => PUSH');
    service.singleStep();

    expect(service.simProp.stackPointer).toBe(1);
    expect(service.simProp.stack[0]).toBe(123);
  });

  it('should output halt message on halt', () => {
    service.outputEvent.pipe(take(2), last()).subscribe((text) => {
      expect(text).toContain('Halting');
    });

    service.compile('NULL => HALT');
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
    service.compile('123 => PUSH 1234 => PUSH 12345 => PUSH');
    service.startStop();

    jasmine.clock().tick(200);

    expect(service.simProp.stackPointer).toBe(3);
    expect([...service.simProp.stack.slice(0, 3)]).toEqual([123, 1234, 12345]);

    jasmine.clock().uninstall();
  });

  it('should start at full speed', () => {
    service.compile('123 => PUSH 1234 => PUSH 12345 => PUSH NULL => HALT');
    service.fullSpeed = true;
    service.startStop();

    expect(service.simProp.stackPointer).toBe(3);
    expect([...service.simProp.stack.slice(0, 3)]).toEqual([123, 1234, 12345]);
  });

  it('should output data', () => {
    service.outputEvent.pipe(take(2), last()).subscribe((text) => {
      expect(text).toBe('a');
    });

    service.compile(`'a' => OUT`);
    service.singleStep();
  });

  it('should read input data', () => {
    service.compile(`IN => ACC`);
    service.input = 'x';
    service.singleStep();

    expect(service.simProp.acc).toBe('x'.charCodeAt(0));
  });

  it('should stop on breakpoint', () => {
    service.compile(`
    NULL => NULL
    NULL => NULL
    NULL => HALT
    `);
    service.fullSpeed = true;
    service.breakpoints = {
      1: [22, 34],
    };
    service.startStop();

    expect(service.simProp.pc).toBe(1);
  });
});
