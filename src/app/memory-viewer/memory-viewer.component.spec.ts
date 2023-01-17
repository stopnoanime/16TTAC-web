import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MemoryViewerComponent } from './memory-viewer.component';

describe('MemoryViewerComponent', () => {
  let component: MemoryViewerComponent;
  let fixture: ComponentFixture<MemoryViewerComponent>;
  let nativeEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MemoryViewerComponent],
      imports: [
        MatFormFieldModule,
        ReactiveFormsModule,
        MatInputModule,
        BrowserAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MemoryViewerComponent);
    component = fixture.componentInstance;
    nativeEl = fixture.nativeElement;

    const uint16Array = new Uint16Array(256);
    uint16Array.forEach((_, i) => (uint16Array[i] = i));
    component.uint16Array = uint16Array;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show array values', () => {
    expect(nativeEl.textContent).toContain('0x0000  0000  0001  0002  0003');
  });

  it('should change start address on input', () => {
    const addressInput = nativeEl.querySelector('input')!;

    addressInput.value = '32';
    addressInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const addressLabel = nativeEl.querySelector('span')!;
    expect(addressLabel.textContent).toContain('0x0020');
  });

  it('should change start address on scroll', () => {
    const displayDiv = nativeEl.querySelector('.font-mono > div:last-child')!;

    displayDiv.dispatchEvent(
      new WheelEvent('wheel', {
        deltaY: 10,
      })
    );
    fixture.detectChanges();

    const addressLabel = nativeEl.querySelector('span')!;
    expect(addressLabel.textContent).toContain('0x0004');
  });
});
