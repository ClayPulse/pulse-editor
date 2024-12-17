import { InlineSuggestionAgent } from "@/lib/agent/inline-suggestion-agent";
import {
  Decoration,
  DecorationSet,
  EditorState,
  EditorView,
  Facet,
  keymap,
  Prec,
  StateEffect,
  StateField,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@uiw/react-codemirror";
import toast from "react-hot-toast";

/* A config facet for various inline suggestion settings */
const codeInlineSuggestionConfig = Facet.define<
  {
    delay?: number;
    agent?: InlineSuggestionAgent;
  },
  {
    delay?: number;
    agent?: InlineSuggestionAgent;
  }
>({
  combine(configs) {
    return {
      delay: configs.find((config) => config.delay)?.delay,
      agent: configs.find((config) => config.agent)
        ?.agent as InlineSuggestionAgent,
    };
  },
});

/* A custom Effect to mark single to change StateField below */
const addSuggestionEffect = StateEffect.define<{
  suggestion?: string;
}>();

/* A custom Effect to remove suggestion */
const removeSuggestionEffect = StateEffect.define();

/* A custom Effect to slice suggestion */
const sliceSuggestionEffect = StateEffect.define<string>();

/* 
  A state to hold value of currently suggestion.
  The value changes if selection changes and if 
  the recent added text is not a prefix of the 
  suggestion.
 */
const codeInlineSuggestionField = StateField.define<{ suggestion?: string }>({
  create(state: EditorState) {
    return { suggestion: undefined };
  },
  update(value: { suggestion?: string }, transaction) {
    // If there is a suggestion effect, update the value.
    for (const effect of transaction.effects) {
      if (effect.is(addSuggestionEffect)) {
        value = {
          suggestion: effect.value.suggestion,
        };
        return value;
      } else if (effect.is(removeSuggestionEffect)) {
        value = { suggestion: undefined };
        return value;
      } else if (effect.is(sliceSuggestionEffect)) {
        const prefix = effect.value;
        console.log("Slicing suggestion with prefix", prefix);
        if (value.suggestion?.startsWith(prefix)) {
          value = { suggestion: value.suggestion.slice(prefix.length) };
          return value;
        }
      }
    }

    // No suitable effect found, return the current value.
    return value;
  },
});

/* An inline suggestion widget. */
class CodeInlineSuggestionWidget extends WidgetType {
  suggestion: string;

  constructor(suggestion: string) {
    super();
    this.suggestion = suggestion;
  }

  toDOM(view: EditorView): HTMLElement {
    const inlineSpan = document.createElement("span");
    inlineSpan.className = "inline-suggestion";
    inlineSpan.textContent = this.suggestion;
    inlineSpan.style.opacity = "0.5";
    return inlineSpan;
  }
}

/* A plugin to observe document and make new suggestions. */
const getSuggestionPlugin = ViewPlugin.fromClass(
  class {
    abortController: AbortController | null;

    constructor(view: EditorView) {
      this.abortController = null;
    }

    update(update: ViewUpdate) {
      // If selection changes but no text added, remove the suggestion.
      if (update.selectionSet && !update.docChanged) {
        this.removeSuggestion(update.view);
        return;
      }

      // Only update if the document and selection changes.
      if (!update.selectionSet || !update.docChanged) {
        return;
      }

      // Check if the current suggestion is a prefix of the inserted text.
      const currentSuggestionState = update.state.field(
        codeInlineSuggestionField,
      );
      const currentSuggestion = currentSuggestionState.suggestion;

      const changes = update.changes;
      let isSliced = false;
      changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
        if (currentSuggestion?.startsWith(inserted.toString())) {
          this.sliceSuggestion(update.view, inserted.toString());
          isSliced = true;
        }
      });
      if (isSliced) {
        return;
      }

      // Get document and selection from the update,
      // then create new suggestion.
      const { doc, selection } = update.state;

      // Anchor is the where the selection starts;
      // head is where the selection ends.
      const anchor = selection.main.anchor;
      const head = selection.main.head;

      // Get the cursor end, which is the right most position of the selection.
      const cursorEnd = Math.max(anchor, head);
      const cursorLine = doc.lineAt(cursorEnd);
      const cursorX = cursorEnd - cursorLine.from + 1;
      const cursorY = cursorLine.number;

      const { delay, agent } = update.view.state.facet(
        codeInlineSuggestionConfig,
      );

      if (!agent) {
        toast.error("LLM not configured for code completion.", {
          id: "llm-not-configured",
        });
        return;
      }

      this.getSuggestion(agent, doc.toString(), cursorX, cursorY, 1, delay)
        .then((suggestion) => {
          // Dispatch effect to update the StateField
          const snippet = suggestion.snippets[0];
          // Find the intersection of doc and snippet, then trim the snippet.
          const trimmedSnippet = this.trimSnippet(doc.toString(), snippet);
          this.dispatchSuggestion(update.view, trimmedSnippet);
        })
        .catch((err) => {
          if (err.name === "AbortError") {
            return;
          }
          throw err;
        });
    }

    private async getSuggestion(
      agent: InlineSuggestionAgent,
      content: string,
      cursorX: number,
      cursorY: number,
      numberOfSuggestions: number,
      delay?: number,
    ) {
      // If there is an ongoing request, abort it.
      if (this.abortController) {
        this.abortController.abort();
      }

      if (delay) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      // Check again after delay if there is an ongoing request, abort it.
      if (this.abortController) {
        this.abortController.abort();
      }

      this.abortController = new AbortController();
      const result = await agent.generateInlineSuggestion(
        content,
        cursorX,
        cursorY,
        numberOfSuggestions,
        this.abortController.signal,
      );
      this.abortController = null;
      console.log("Suggestion fetched", result);

      return result;
    }

    private dispatchSuggestion(view: EditorView, suggestion: string) {
      // Use requestAnimationFrame to dispatch the effect in the next frame.
      // This is to avoid the effect being dispatched in the same frame as the update.
      requestAnimationFrame(() => {
        view.dispatch({
          effects: addSuggestionEffect.of({
            suggestion: suggestion,
          }),
        });
      });
    }

    private removeSuggestion(view: EditorView) {
      // Use requestAnimationFrame to dispatch the effect in the next frame.
      // This is to avoid the effect being dispatched in the same frame as the update.
      requestAnimationFrame(() => {
        view.dispatch({
          effects: removeSuggestionEffect.of(null),
        });
      });
    }

    private sliceSuggestion(view: EditorView, prefix: string) {
      // Use requestAnimationFrame to dispatch the effect in the next frame.
      // This is to avoid the effect being dispatched in the same frame as the update.
      requestAnimationFrame(() => {
        view.dispatch({
          effects: sliceSuggestionEffect.of(prefix),
        });
      });
    }

    private trimSnippet(doc: string, snippet: string) {
      // Move the snippet one character at a time to the left and check if it is an affix of the doc.
      let trimmedStart = 0;
      for (let i = 0; i < snippet.length; i++) {
        const snippetPrefix = snippet.slice(0, i);
        if (doc.endsWith(snippetPrefix)) {
          trimmedStart = i;
        }
      }

      return snippet.slice(trimmedStart);
    }
  },
);

/* 
  A plugin to inject inline suggestion widgets as decoration 
  when StateField changes.
  */
const decorationPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = Decoration.none;
    }

    update(update: ViewUpdate) {
      /* Update decoration when new text entered by user or cursor location changes */
      const suggestionField = update.state.field(codeInlineSuggestionField);
      const suggestion = suggestionField.suggestion;

      // If no suggestion, remove the decoration
      if (!suggestion) {
        this.decorations = Decoration.none;
        return;
      }

      // Get the current selection.
      // Anchor is the where the selection starts;
      // head is where the selection ends.
      const { selection } = update.state;
      const anchor = selection.main.anchor;
      const head = selection.main.head;

      // Get the cursor end, which is the right most position of the selection.
      const cursorEnd = Math.max(anchor, head);

      const suggestionWidget = new CodeInlineSuggestionWidget(suggestion);
      this.decorations = Decoration.set([
        Decoration.widget({
          widget: suggestionWidget,
          side: 1,
        }).range(cursorEnd, cursorEnd),
      ]);
    }
  },
  {
    decorations: (plugin) => plugin.decorations,
  },
);

/* Mobile swipe action plugin */
const mobileSwipeActionPlugin = ViewPlugin.fromClass(
  class {
    // Detect "swipe right" gesture to accept suggestion
    view: EditorView;
    startX: number;
    startY: number;

    constructor(view: EditorView) {
      this.view = view;
      this.startX = 0;
      this.startY = 0;

      view.dom.addEventListener("touchstart", this.onTouchStart.bind(this));
      view.dom.addEventListener("touchend", this.onTouchEnd.bind(this));
    }

    onTouchStart(e: TouchEvent) {
      const touch = e.touches[0];
      this.startX = touch.clientX;
      this.startY = touch.clientY;
    }

    onTouchEnd(e: TouchEvent) {
      const touch = e.changedTouches[0];
      const endX = touch.clientX;
      const endY = touch.clientY;

      const dx = endX - this.startX;
      const dy = endY - this.startY;

      if (dx > 0 && Math.abs(dx) > Math.abs(dy)) {
        acceptSuggestion(this.view);
      }
    }
  },
);

const acceptSuggestion = (view: EditorView) => {
  const suggestionField = view.state.field(codeInlineSuggestionField);
  const suggestion = suggestionField.suggestion;

  const { selection } = view.state;
  const anchor = selection.main.anchor;
  const head = selection.main.head;
  const cursorEnd = Math.max(anchor, head);

  if (suggestion) {
    // Insert the suggestion at the cursor end and
    // move the cursor to the end of the suggestion.
    view.dispatch({
      changes: {
        from: cursorEnd,
        to: cursorEnd,
        insert: suggestion,
      },
      selection: {
        anchor: cursorEnd + suggestion.length,
        head: cursorEnd + suggestion.length,
      },
    });
  }
  return true;
};

/* A key map which maps tab to suggestion accept */
const codeInlineSuggestionKeymap = Prec.highest(
  keymap.of([
    {
      key: "Tab",
      run: acceptSuggestion,
    },
  ]),
);

/* An extension to enable inline code suggestions */
export function codeInlineSuggestionExtension({
  delay,
  agent,
}: {
  delay: number;
  agent?: InlineSuggestionAgent;
}) {
  const config = codeInlineSuggestionConfig.of({ delay, agent });
  return [
    codeInlineSuggestionKeymap,
    config,
    codeInlineSuggestionField,
    decorationPlugin,
    getSuggestionPlugin,
    mobileSwipeActionPlugin,
  ];
}
