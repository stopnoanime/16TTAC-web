import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss'],
})
export class TerminalComponent implements AfterViewInit, OnDestroy {
  @Input() outputEvent?: Subject<string>;
  @Input() clearEvent?: Subject<void>;
  @Output() input = new EventEmitter<string>();

  @Input() backgroundColor: string = '#1D1F21';
  @Input() foregroundColor: string = '#C5C8C6';

  @Input() rows: number = 12;

  @ViewChild('terminal') terminalRef?: ElementRef;

  terminal!: Terminal;
  fitAddon!: FitAddon;
  outputEventSubscription?: Subscription;
  clearEventSubscription?: Subscription;

  ngAfterViewInit(): void {
    this.terminal = new Terminal({
      convertEol: true,
      cursorBlink: true,
      rows: this.rows,
      cols: 20,
      theme: {
        background: this.backgroundColor,
        foreground: this.foregroundColor,
        cursorAccent: this.backgroundColor,
        cursor: this.foregroundColor,
      },
    });

    this.fitAddon = new FitAddon();

    this.terminal.loadAddon(this.fitAddon);
    this.terminal.open(this.terminalRef?.nativeElement);

    this.terminal.onData((s) => {
      this.input.emit(s);
    });

    const resizeObserver = new ResizeObserver(() => this.fit());
    resizeObserver.observe(this.terminalRef?.nativeElement);

    this.outputEventSubscription = this.outputEvent?.subscribe((s) =>
      this.terminal.write(s)
    );
    this.clearEventSubscription = this.clearEvent?.subscribe((_) =>
      this.terminal.reset()
    );
  }

  ngOnDestroy(): void {
    this.outputEventSubscription?.unsubscribe();
    this.clearEventSubscription?.unsubscribe();
  }

  fit() {
    this.fitAddon.fit();

    //We want to resize horizontally, but keep the number of rows
    this.terminal.resize(this.terminal.cols, this.rows);
  }
}
