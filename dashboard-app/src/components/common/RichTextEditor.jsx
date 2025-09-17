import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/extension-bubble-menu';
import { FloatingMenu } from '@tiptap/extension-floating-menu';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Highlight } from '@tiptap/extension-highlight';
import { TextAlign } from '@tiptap/extension-text-align';
import { Link } from '@tiptap/extension-link';
import {
  FaBold, FaItalic, FaStrikethrough, FaListUl, FaListOl, FaQuoteLeft,
  FaAlignLeft, FaAlignCenter, FaAlignRight, FaLink, FaUnlink, FaPaintBrush, FaUndo, FaRedo
} from 'react-icons/fa';

const Toolbar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-gray-100 border-b border-gray-300 rounded-t-md">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''}><FaBold /></button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''}><FaItalic /></button>
      <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'is-active' : ''}><FaStrikethrough /></button>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'is-active' : ''}><FaListUl /></button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'is-active' : ''}><FaListOl /></button>
      <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'is-active' : ''}><FaQuoteLeft /></button>
      <div className="h-6 border-l border-gray-300 mx-2"></div>
      <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}><FaAlignLeft /></button>
      <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}><FaAlignCenter /></button>
      <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}><FaAlignRight /></button>
      <div className="h-6 border-l border-gray-300 mx-2"></div>
      <button onClick={setLink} className={editor.isActive('link') ? 'is-active' : ''}><FaLink /></button>
      <button onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive('link')}><FaUnlink /></button>
      <div className="h-6 border-l border-gray-300 mx-2"></div>
      <input
        type="color"
        onInput={event => editor.chain().focus().setColor(event.target.value).run()}
        value={editor.getAttributes('textStyle').color || '#000000'}
        className="w-6 h-6"
      />
      <input
        type="color"
        onInput={event => editor.chain().focus().toggleHighlight({ color: event.target.value }).run()}
        value={editor.getAttributes('highlight').color || '#ffffff'}
        className="w-6 h-6 ml-1"
      />
       <button onClick={() => editor.chain().focus().unsetAllMarks().run()}><FaPaintBrush /></button>
       <div className="h-6 border-l border-gray-300 mx-2"></div>
       <button onClick={() => editor.chain().focus().undo().run()}><FaUndo /></button>
       <button onClick={() => editor.chain().focus().redo().run()}><FaRedo /></button>
    </div>
  );
};

const RichTextEditor = ({ content, onUpdate }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl m-5 focus:outline-none',
      },
    },
  });

  return (
    <div className="border border-gray-300 rounded-md">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
