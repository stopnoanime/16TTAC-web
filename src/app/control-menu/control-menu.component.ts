import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-control-menu',
  templateUrl: './control-menu.component.html',
})
export class ControlMenuComponent {
  @Input() wasCompiled: boolean = false;
  @Input() running: boolean = false;

  @Output() compile = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();
  @Output() singleStep = new EventEmitter<void>();
  @Output() startStop = new EventEmitter<void>();

  @Output() fullSpeedChange = new EventEmitter<boolean>();
  @Output() timeoutChange = new EventEmitter<number>();

  formatSliderLabel(value: number): string {
    return `${value}Hz`;
  }
}
