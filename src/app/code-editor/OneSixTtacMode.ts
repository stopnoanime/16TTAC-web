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

  createWorker(session: ace.IEditSession) {
    const WorkerClient = ace.acequire(
      'ace/worker/worker_client'
    ).UIWorkerClient;
    const worker = new WorkerClient(
      ['ace'],
      'ace/mode/16ttac-worker',
      'WorkerModule'
    );
    worker.attachToDocument(session.getDocument());

    worker.on('lint', function (results: any) {
      session.setAnnotations(results.data);
    });

    worker.on('terminate', function () {
      session.clearAnnotations();
    });

    return worker;
  }
}

export class Mirror {
  sender: any;
  doc: ace.Document;
  deferredUpdate: any;
  $timeout = 500;

  constructor(sender: any) {
    const Range = ace.acequire('ace/range').Range;
    const Document = ace.acequire('ace/document').Document;
    const lang = ace.acequire('ace/lib/lang');

    this.sender = sender;
    var doc = (this.doc = new Document(''));
    var deferredUpdate = (this.deferredUpdate = lang.delayedCall(
      this.onUpdate.bind(this)
    ));

    sender.on('change', (e: any) => {
      var data = e.data;
      if (data[0].start) {
        doc.applyDeltas(data);
      } else {
        for (var i = 0; i < data.length; i += 2) {
          if (Array.isArray(data[i + 1])) {
            var d: any = {
              action: 'insert',
              start: data[i],
              lines: data[i + 1],
            };
          } else {
            var d: any = { action: 'remove', start: data[i], end: data[i + 1] };
          }
          doc.applyDelta(d, true);
        }
      }
      if (this.$timeout) return deferredUpdate.schedule(this.$timeout);
      this.onUpdate();
    });
  }

  setTimeout(timeout: number) {
    this.$timeout = timeout;
  }

  setValue(value: string) {
    this.doc.setValue(value);
    this.deferredUpdate.schedule(this.$timeout);
  }

  getValue(callbackId: number) {
    this.sender.callback(this.doc.getValue(), callbackId);
  }

  onUpdate() {}

  isPending() {
    return this.deferredUpdate.isPending();
  }
}

export class OneSixTtacWorker extends Mirror {
  private parser = new Parser();

  constructor(sender: any) {
    super(sender);
  }

  override onUpdate() {
    try {
      this.parser.parse(this.doc.getValue());
    } catch (e) {
      if (e instanceof ParserError) {
        const pos = this.doc.indexToPosition(e.sourcePosition, 0);

        this.sender.emit('lint', [
          {
            row: pos.row,
            column: pos.column,
            text: e.message,
            type: 'error',
          },
        ]);
        return;
      }
    }

    //No errors
    this.sender.emit('lint', []);
  }
}
