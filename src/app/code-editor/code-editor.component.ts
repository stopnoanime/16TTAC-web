import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { AceComponent, AceConfigInterface } from 'ngx-ace-wrapper';
import { parserOutput } from '16ttac-sim';
import { CodeService } from '../code.service';
import OneSixTtacMode, { OneSixTtacWorker } from './OneSixTtacMode';
import * as ace from 'brace';
import 'brace/theme/tomorrow_night';
import 'brace/ext/language_tools';

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss'],
})
export class CodeEditorComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() sourceCode: string = '';
  @Output() sourceCodeChange = new EventEmitter<string>();

  @Input() disabled: boolean = false;

  @Input() compiled?: boolean;
  @Input() parserOutput?: parserOutput;
  @Input() highlightBlue?: number;
  @Input() highlightGreen?: number;
  @Input() highlightPurple?: number;

  @Output() hoveredAddressChange = new EventEmitter<number>();

  private breakpoints: breakpointsType = {};
  @Output() breakpointsChange = new EventEmitter<breakpointsType>();

  private currentlyShownMarkers: number[] = [];

  config: AceConfigInterface = {
    mode: '16ttac',
    theme: 'tomorrow_night',
    showPrintMargin: false,
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    tabSize: 2,
    useWorker: true,
  };

  @ViewChild(AceComponent) aceComponent?: AceComponent;
  editor!: ace.Editor;

  constructor(private codeService: CodeService) {}

  ngOnInit(): void {
    (ace as any).define('ace/mode/16ttac-worker', {
      WorkerModule: OneSixTtacWorker,
    });
    (ace as any).define('ace/mode/16ttac', { Mode: OneSixTtacMode });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.clearMarkers();
    this.hoveredAddressChange.emit(undefined);

    if (!this.compiled) return;

    //Compiled went from false to true
    if (changes['compiled']) this.recalculateBreakpoints();

    this.addMarker('accHighlightBlue', this.highlightBlue);
    this.addMarker('accHighlightGreen', this.highlightGreen);
    this.addMarker('accHighlightPurple', this.highlightPurple);
  }

  ngAfterViewInit(): void {
    this.editor = this.aceComponent?.directiveRef?.ace() as ace.Editor;
    this.editor.on('guttermousedown', (e) => this.toggleBreakpoint(e));
  }

  onValueChange(): void {
    this.sourceCodeChange.emit(this.sourceCode);
  }

  outputHoveredAddress(x: number, y: number) {
    if (!this.compiled) return;

    const r = this.editor.renderer;
    const canvasPos = r.scroller.getBoundingClientRect();

    const column = Math.round(
      (x + (r as any).scrollLeft - canvasPos.left - (r as any).$padding) /
        r.characterWidth
    );
    const row = Math.floor(
      (y + (r as any).scrollTop - canvasPos.top) / r.lineHeight
    );

    const foundAddress = this.codeService.getAddressForSourceCodeIndex(
      this.editor.session.doc.positionToIndex(
        this.editor.session.screenToDocumentPosition(row, column),
        0
      ),
      this.parserOutput
    );

    this.hoveredAddressChange.emit(foundAddress ?? undefined);
  }

  private addMarker(name: string, address?: number) {
    const range = this.getSourceCodeRangeForAddress(address);
    if (!range) return;

    this.currentlyShownMarkers.push(
      this.editor.session.addMarker(range, name, 'text', false)
    );
  }

  private clearMarkers() {
    this.currentlyShownMarkers.forEach((id) =>
      this.editor.session.removeMarker(id)
    );
    this.currentlyShownMarkers = [];
  }

  private getSourceCodeRangeForAddress(address?: number): ace.Range | null {
    if (address == undefined) return null;

    const indexRange = this.codeService.getSourceCodeIndexRangeForAddress(
      address,
      this.parserOutput
    );

    if (!indexRange) return null;

    const startPosition = this.editor.session.doc.indexToPosition(
      indexRange[0],
      0
    );
    const endPosition = this.editor.session.doc.indexToPosition(
      indexRange[1],
      0
    );

    const Range = ace.acequire('ace/range').Range;

    return new Range(
      startPosition.row,
      startPosition.column,
      endPosition.row,
      endPosition.column
    );
  }

  private toggleBreakpoint(e: any) {
    const row = e.getDocumentPosition().row;
    const editorBreakpoints = this.editor.session.getBreakpoints();

    if (!editorBreakpoints[row]) {
      this.editor.session.setBreakpoint(row, 'ace_breakpoint');
      this.breakpoints[row] = this.getBreakpointRangeForRow(row);
    } else {
      this.editor.session.clearBreakpoint(row);
      delete this.breakpoints[row];
    }

    this.breakpointsChange.emit(this.breakpoints);

    e.stop();
  }

  private recalculateBreakpoints() {
    for (const key in this.breakpoints) {
      this.breakpoints[key] = this.getBreakpointRangeForRow(Number(key));
    }
    this.breakpointsChange.emit(this.breakpoints);
  }

  private getBreakpointRangeForRow(row: number): [number, number] {
    return [
      this.editor.session.doc.positionToIndex({ column: 0, row: row }, 0),
      this.editor.session.doc.positionToIndex({ column: 0, row: row + 1 }, 0) -
        1,
    ];
  }
}

export type breakpointsType = { [row: number]: [number, number] };
