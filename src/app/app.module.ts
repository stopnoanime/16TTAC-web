import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

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

@NgModule({
  declarations: [AppComponent, MemoryViewerComponent, CodeEditorComponent, TerminalComponent],
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
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
