import { Injectable, NgModule } from '@angular/core';
import {
  BrowserModule,
  HammerGestureConfig,
  HAMMER_GESTURE_CONFIG,
} from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MemoryViewerComponent } from './memory-viewer/memory-viewer.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AceModule } from 'ngx-ace-wrapper';
import { CodeEditorComponent } from './code-editor/code-editor.component';
import { TerminalComponent } from './terminal/terminal.component';
import { CpuStatusComponent } from './cpu-status/cpu-status.component';
import { ControlMenuComponent } from './control-menu/control-menu.component';
import { HammerModule } from '@angular/platform-browser';
import { DIRECTION_VERTICAL } from 'hammerjs';

@Injectable()
export class CustomHammerConfig extends HammerGestureConfig {
  override overrides = {
    pan: {
      direction: DIRECTION_VERTICAL,
    },
  };
}

@NgModule({
  declarations: [
    AppComponent,
    MemoryViewerComponent,
    CodeEditorComponent,
    TerminalComponent,
    CpuStatusComponent,
    ControlMenuComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatSliderModule,
    MatCheckboxModule,
    AceModule,
    HammerModule,
  ],
  providers: [{ provide: HAMMER_GESTURE_CONFIG, useClass: CustomHammerConfig }],
  bootstrap: [AppComponent],
})
export class AppModule {}
