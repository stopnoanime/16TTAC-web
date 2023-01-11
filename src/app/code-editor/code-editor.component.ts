import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { AceComponent, AceConfigInterface } from 'ngx-ace-wrapper';
import { parserOutput } from '16ttac-sim';
import * as ace from 'brace';

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss'],
})
export class CodeEditorComponent implements OnChanges, AfterViewInit {
  @Input() sourceCode: string = '';
  @Output() sourceCodeChange = new EventEmitter<string>();

  @Input() disabled: boolean = false;

  @Input() compiled?: boolean;
  @Input() parserOutput?: parserOutput;
  @Input() highlightBlue?: number;
  @Input() highlightGreen?: number;
  @Input() highlightPurple?: number;

  config: AceConfigInterface = {
    mode: 'text',
    theme: 'github',
    showPrintMargin: false,
  };

  @ViewChild(AceComponent) componentRef?: AceComponent;
  editor!: ace.Editor;

  private currentlyShownMarkers: number[] = [];
  ngOnChanges(changes: SimpleChanges): void {
    this.currentlyShownMarkers.forEach((id) =>
      this.editor.session.removeMarker(id)
    );
    this.currentlyShownMarkers = [];

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

  private addMarker(name: string, address?: number) {
    const range = this.getSourceCodeRangeForAddress(address);
    if (range)
      this.currentlyShownMarkers.push(
        this.editor.session.addMarker(range, name, 'text', false)
      );
  }

  private getSourceCodeRangeForAddress(address?: number): ace.Range | null {
    if (address == undefined) return null;

    const indexRange = this.getSourceCodeIndexRangeForAddress(address);

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

  private getSourceCodeIndexRangeForAddress(
    address: number
  ): [number, number] | null {
    if (!this.parserOutput) return null;

    const found = [
      ...this.parserOutput.instructions,
      ...this.parserOutput.variables,
    ].find((v) => address >= v.address && address < v.address + v.size);

    if (!found) return null;

    return [found.sourceStart, found.sourceEnd];
  }
}
