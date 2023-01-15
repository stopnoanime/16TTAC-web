import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss'],
})
export class TerminalComponent implements AfterViewInit, OnChanges {

  @Input() output?: string;
  @Output() input = new EventEmitter<string>();
  
  @ViewChild('terminal') terminalRef?: ElementRef;

  terminal = new Terminal({
    convertEol: true,
    cursorBlink: true,
  })
  fitAddon = new FitAddon();

  ngOnChanges(changes: SimpleChanges): void {
    this.terminal.reset();
    this.terminal.write(this.output || '')
  }

  ngAfterViewInit(): void {
    this.terminal.loadAddon(this.fitAddon)
    this.terminal.open(this.terminalRef?.nativeElement);
    this.fitAddon.fit();

    this.terminal.onData(s => {
      this.input.emit(s)
    })
  }
}
