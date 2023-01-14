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
import 'brace/theme/chrome';
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

  config: AceConfigInterface = {
    mode: '16ttac',
    theme: 'chrome',
    showPrintMargin: false,
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    tabSize: 2,
    useWorker: true,
  };

  @ViewChild(AceComponent) componentRef?: AceComponent;
  editor!: ace.Editor;

  constructor(private codeService: CodeService) {}

  ngOnInit(): void {
    (ace as any).define('ace/mode/16ttac-worker', {
      WorkerModule: OneSixTtacWorker,
    });
    (ace as any).define('ace/mode/16ttac', { Mode: OneSixTtacMode });
  }

  private currentlyShownMarkers: number[] = [];
  ngOnChanges(changes: SimpleChanges): void {
    this.currentlyShownMarkers.forEach((id) =>
      this.editor.session.removeMarker(id)
    );
    this.currentlyShownMarkers = [];

    this.hoveredAddressChange.emit(undefined);

    if (!this.compiled) return;

    this.addMarker('accHighlightBlue', this.highlightBlue);
    this.addMarker('accHighlightGreen', this.highlightGreen);
    this.addMarker('accHighlightPurple', this.highlightPurple);
  }

  ngAfterViewInit(): void {
    this.editor = this.componentRef?.directiveRef?.ace() as ace.Editor;
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

    const documentPosition = this.editor.session.screenToDocumentPosition(
      row,
      column
    );
    const positionIndex = this.editor.session.doc.positionToIndex(
      documentPosition,
      0
    );

    const foundAddress = this.codeService.getAddressForSourceCodeIndex(
      positionIndex,
      this.parserOutput
    );
    this.hoveredAddressChange.emit(foundAddress ?? undefined);
  }

  private addMarker(name: string, address?: number) {
    const range = this.getSourceCodeRangeForAddress(address);
    if (range)
      this.currentlyShownMarkers.push(
        this.editor.session.addMarker(range, name, 'text', false)
      );
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
}
