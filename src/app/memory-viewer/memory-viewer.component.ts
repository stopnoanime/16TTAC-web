import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-memory-viewer',
  templateUrl: './memory-viewer.component.html',
})
export class MemoryViewerComponent implements OnInit {
  @Input() uint16Array!: Uint16Array;
  @Input() blockSize: number = 256;
  @Input() wordsPerRow: number = 4;
  @Input() maxAddress: number = 65_536;

  @Input() label: string = 'Memory viewer';

  rowOffset = 0;
  addressForm = new FormControl(0);

  constructor() {}

  ngOnInit(): void {
    this.addressForm.valueChanges.subscribe((val) => {
      if (!val) return;

      this.addressForm.setValue(Math.min(this.maxAddress, Math.max(0, val)), {
        emitEvent: false,
      });
      this.rowOffset = Math.min(
        (this.maxAddress - this.blockSize) / this.wordsPerRow,
        Math.floor(this.addressForm.value! / this.wordsPerRow)
      );
    });
  }

  toHex(value: number) {
    return value.toString(16).toUpperCase().padStart(4, '0');
  }

  onWheel(event: WheelEvent) {
    if (event.deltaY > 0) this.rowOffset += 1;
    if (event.deltaY < 0) this.rowOffset -= 1;

    this.rowOffset = Math.min(
      (this.maxAddress - this.blockSize) / this.wordsPerRow,
      Math.max(0, this.rowOffset)
    );
    this.addressForm.setValue(this.rowOffset * this.wordsPerRow);
  }
}
