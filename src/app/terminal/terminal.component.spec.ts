import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { Terminal } from 'xterm';

import { TerminalComponent } from './terminal.component';

class mockTerminal extends Terminal {
  onDataCb!: (s: string) => any;
  // @ts-ignore
  onData(cb: any) {
    this.onDataCb = cb;
  }

  // @ts-ignore
  write = jasmine.createSpy('write');

  // @ts-ignore
  reset = jasmine.createSpy('reset');
}

describe('TerminalComponent', () => {
  let component: TerminalComponent;
  let fixture: ComponentFixture<TerminalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TerminalComponent],
    }).compileComponents();

    // @ts-ignore
    Terminal = mockTerminal;

    fixture = TestBed.createComponent(TerminalComponent);
    component = fixture.componentInstance;
    component.outputEvent = new Subject();
    component.clearEvent = new Subject();

    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(fixture.debugElement.query(By.css('.xterm'))).toBeTruthy();
  });

  it('should output data', () => {
    component.outputEvent?.next('test string');

    expect(component.terminal.write).toHaveBeenCalledOnceWith('test string');
  });

  it('should clear terminal', () => {
    component.clearEvent?.next();

    expect(component.terminal.reset).toHaveBeenCalledOnceWith();
  });

  it('should output terminal input', (done) => {
    component.input.subscribe((s) => {
      expect(s).toBe('x');
      done();
    });

    (component.terminal as any as mockTerminal).onDataCb('x');
  });
});
