import { Component, OnInit } from '@angular/core';
import { SimService } from './sim.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(public sim: SimService) {}

  wasCompiled = false;
  sourceCode = `'a' => OUT 'v' => OUT 'c' => OUT`;

  ngOnInit() {}

  formatSliderLabel(value: number): string {
    return `${value}Hz`;
  }

  sliderChange(freq: number) {
    this.sim.simTimeout = 1000 / freq;
  }
}
