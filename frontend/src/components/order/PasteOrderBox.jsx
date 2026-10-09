import { useState } from 'react';
import { ClipboardPaste, Wand2 } from 'lucide-react';

/**
 * Textarea where the user pastes one order's raw text, plus a "Parse" button.
 * On parse it calls `onParsed(parsedDraft)`; the parent fills the form.
 */
export default function PasteOrderBox({ onParsed }) {
  const [text, setText] = useState('');

  const handleParse = () => {
    if (!text.trim()) return;
    onParsed(text);
    setText('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <ClipboardPaste className="w-4 h-4 text-base-content/60" />
        Paste order text
      </div>
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={'নাম: ...\nফোন: ...\nঠিকানা: ...\n১২৩০/-'}
        rows={5}
        className="textarea textarea-bordered w-full text-sm rounded-xl resize-y"
      />
      <button
        type="button"
        onClick={handleParse}
        disabled={!text.trim()}
        className="btn btn-outline btn-primary btn-sm w-full gap-2 rounded-xl disabled:opacity-50"
      >
        <Wand2 className="w-4 h-4" /> Parse into form
      </button>
    </div>
  );
}
