import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { TerminalComponent } from './terminal.component';

describe('TerminalComponent', () => {
  let component: TerminalComponent;
  let fixture: ComponentFixture<TerminalComponent>;
  let nativeEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TerminalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TerminalComponent);
    component = fixture.componentInstance;
    nativeEl = fixture.nativeElement;
    component.outputEvent = new Subject();

    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should output data', (done) => {
    component.outputEvent?.next('test string');

    component.terminal.onWriteParsed(() => {
      expect(
        component.terminal.buffer.active.getLine(0)?.translateToString(true)
      ).toBe('test string');
      done();
    });
  });
});
