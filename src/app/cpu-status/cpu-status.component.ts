import { Component, Input } from '@angular/core';
import { simPropType } from '../sim.service';
import { toHex } from '../toHex';

@Component({
  selector: 'app-cpu-status',
  templateUrl: './cpu-status.component.html',
})
export class CpuStatusComponent {
  toHex = toHex;

  public get ledRGB(): string {
    const v = this.simProp.led;
    return `rgb(${(v & 4) * 255} ${(v & 2) * 255} ${(v & 1) * 255})`;
  }

  @Input() simProp!: simPropType;
}
