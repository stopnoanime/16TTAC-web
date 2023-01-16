import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Subject } from 'rxjs';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss'],
})
export class TerminalComponent implements AfterViewInit {
  @Input() outputEvent?: Subject<string>;
  @Input() clearEvent?: Subject<void>;
  @Output() input = new EventEmitter<string>();

  @ViewChild('terminal') terminalRef?: ElementRef;

  terminal = new Terminal({
    convertEol: true,
    cursorBlink: true,
    rows: 17,
    theme: {
      background: '#15181f',
    },
  });
  fitAddon = new FitAddon();

  ngAfterViewInit(): void {
    this.terminal.loadAddon(this.fitAddon);
    this.terminal.open(this.terminalRef?.nativeElement);

    this.terminal.onData((s) => {
      this.input.emit(s);
    });

    const resizeObserver = new ResizeObserver((entries) => {
      this.fitAddon.fit();
    });

    resizeObserver.observe(this.terminalRef?.nativeElement);

    this.outputEvent?.subscribe((s) => this.terminal.write(s));
    this.clearEvent?.subscribe((_) => this.terminal.reset());
  }
}
