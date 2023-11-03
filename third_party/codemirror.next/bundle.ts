// Base script used with Rollup to bundle the necessary CodeMirror
// components.

import {
  defaultKeymap, history, historyKeymap,
} from '@codemirror/commands';
import { Compartment, EditorState } from '@codemirror/state';
import {
  drawSelection,
  EditorView,
  keymap, lineNumbers
} from '@codemirror/view';

declare global {
  interface Window {
    CodeMirror: {
      commands: {
        defaultKeymap: typeof defaultKeymap,
        history: typeof history,
        historyKeymap: typeof historyKeymap,
      },
      state: {
        Compartment: typeof Compartment,
        EditorState: typeof EditorState,
      },
      view: {
        drawSelection: typeof drawSelection,
        EditorView: typeof EditorView,
        keymap: typeof keymap,
        lineNumbers: typeof lineNumbers,
      }
    },
  }
}

window.CodeMirror = {
  commands: {
    defaultKeymap,
    history,
    historyKeymap,
  },
  state: {
    Compartment,
    EditorState,
  },
  view: {
    drawSelection,
    EditorView,
    keymap,
    lineNumbers,
  },
}

