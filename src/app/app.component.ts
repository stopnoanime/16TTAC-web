import { parserOutput, exampleProgram } from '16ttac-sim';
import { Component, OnInit } from '@angular/core';
import { SimService } from './sim.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(public sim: SimService) {}

  memoryViewerHoveredAddress?: number;
  sourceCodeHoveredAddress?: number;
}
