import { Component, Input } from '@angular/core';
import { simPropType } from '../sim.service';
import { toHex } from '../toHex';

@Component({
  selector: 'app-cpu-status',
  templateUrl: './cpu-status.component.html',
})
export class CpuStatusComponent {
  toHex = toHex;

  @Input() simProp!: simPropType;
}
