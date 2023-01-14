import { Instructions, Parser, ParserError } from '16ttac-sim';
import * as ace from 'brace';

export class OneSixTtacHighlightRules extends ace.acequire(
  'ace/mode/text_highlight_rules'
).TextHighlightRules {
  private instructions = new Instructions();

  $rules = {
    start: [
      // Comment
      {
        token: 'comment',
        regex: /\/\/.*$/,
      },

      // hex number
      {
        token: 'constant.numeric',
        regex: /0x[0-9a-fA-F]+/,
      },

      // number
      {
        token: 'constant.numeric',
        regex: /-?\d+/,
      },

      // character
      {
        token: 'string.single ',
        regex: /'\\.'|'.'/,
      },

      // string
      {
        token: 'string',
        regex: /"/,
        next: 'multilineString',
      },

      // label
      {
        token: 'entity.name.function',
        regex: /\b[a-z][\w_-]*:/,
      },

      // variable declaration
      {
        token: 'keyword',
        regex: /\bword\b/,
      },

      // source
      {
        token: 'keyword',
        regex: new RegExp(
          `(${this.instructions.sources
            .map((d) => `${d}\\b`)
            .join('|')})(?=\\s*=>)`
        ),
      },

      // =>
      {
        token: 'keyword.operator',
        regex: /=>/,
        next: 'destination',
      },
    ],

    destination: [
      {
        token: 'keyword',
        regex: new RegExp(
          `${this.instructions.destinations.map((d) => `${d}\\b`).join('|')}`
        ),
        next: 'flags',
      },
    ],

    flags: [
      {
        token: 'support.constant',
        regex: /(\s+c)?(\s+z)?/,
        next: 'start',
      },
    ],

    multilineString: [
      {
        token: 'string',
        regex: /\\"/, //Alow for escaped quote
      },
      {
        token: 'string',
        regex: /"/,
        next: 'start',
      },
      { defaultToken: 'string' },
    ],
  };
}

export default class OneSixTtacMode extends ace.acequire('ace/mode/text').Mode {
  HighlightRules = OneSixTtacHighlightRules;
  lineCommentStart = '//';

  private instructions = new Instructions();

  getCompletions(
    state: string,
    session: ace.IEditSession,
    pos: ace.Position,
    prefix: string
  ) {
    return [
      ...this.instructions.sources.map((w) => ({
        value: w,
        meta: 'source',
      })),

      ...this.instructions.destinations.map((w) => ({
        value: w,
        meta: 'destination',
      })),

      {
        value: 'word',
        meta: 'type',
      },
    ];
  }
}

export function validateSyntax(
  code: string,
  editor: ace.Editor,
  parser: Parser
) {
  editor.session.clearAnnotations();

  try {
    parser.parse(code);
  } catch (e) {
    if (e instanceof ParserError) {
      const pos = editor.session.doc.indexToPosition(e.sourcePosition, 0);

      editor.session.setAnnotations([
        {
          row: pos.row,
          column: pos.column,
          text: e.message,
          type: 'error',
        },
      ]);
    }
  }
}
