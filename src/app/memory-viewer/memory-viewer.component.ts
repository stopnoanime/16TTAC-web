import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { toHex } from '../toHex';

@Component({
  selector: 'app-memory-viewer',
  templateUrl: './memory-viewer.component.html',
  styleUrls: ['./memory-viewer.component.scss'],
})
export class MemoryViewerComponent implements OnInit, OnDestroy {
  toHex = toHex;
  math = Math;

  @Input() uint16Array?: Uint16Array;
  @Input() blockSize: number = 256;
  @Input() wordsPerRow: number = 4;
  @Input() maxAddress: number = 65_536;

  @Input() highlightBlue?: number;
  @Input() highlightGreen?: number;
  @Input() highlightPurple?: number;

  @Output() hoveredAddressChange = new EventEmitter<number>();

  @Input() label: string = 'Memory viewer';

  rowOffset = 0;
  addressForm = new FormControl(0);
  addressFormSubscription?: Subscription;

  constructor() {}

  ngOnInit(): void {
    this.addressFormSubscription = this.addressForm.valueChanges.subscribe(
      (val) => {
        if (val === null) return;

        this.addressForm.setValue(Math.min(this.maxAddress, Math.max(0, val)), {
          emitEvent: false,
        });
        this.rowOffset = Math.min(
          (this.maxAddress - this.blockSize) / this.wordsPerRow,
          Math.floor(this.addressForm.value! / this.wordsPerRow)
        );
      }
    );
  }

  ngOnDestroy() {
    this.addressFormSubscription?.unsubscribe();
  }

  getAddress(row: number, col: number) {
    return (row + this.rowOffset) * this.wordsPerRow + col;
  }

  onWheel(event: WheelEvent) {
    event.preventDefault();
    this.updateRowOffset(this.rowOffset + (event.deltaY > 0 ? 1 : -1));
  }

  private startRowOffset: number = 0;
  pan(event: any) {
    if (event.type == 'panstart') this.startRowOffset = this.rowOffset;
    this.updateRowOffset(this.startRowOffset - Math.round(event.deltaY / 20));
  }

  private updateRowOffset(newRowOffset: number) {
    this.rowOffset = Math.min(
      (this.maxAddress - this.blockSize) / this.wordsPerRow,
      Math.max(0, newRowOffset)
    );
    this.addressForm.setValue(this.rowOffset * this.wordsPerRow, {
      emitEvent: false,
    });
  }
}
