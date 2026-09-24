import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extensions';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  Link2Off,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ToolbarButtonProps = {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

function ToolbarButton({ label, active, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded text-slate-600 transition-colors hover:bg-slate-200',
        active && 'bg-slate-900 text-white hover:bg-slate-800',
      )}
    >
      {children}
    </button>
  );
}

function setLink(editor: Editor) {
  const previous = editor.getAttributes('link').href as string | undefined;
  const input = window.prompt('Endereço do link (https://...)', previous ?? 'https://');
  if (input === null) return;
  const url = input.trim();
  if (!url || url === 'https://') {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    return;
  }
  const href = /^(https?:|mailto:|tel:)/i.test(url) ? url : `https://${url}`;
  editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
}

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export function RichTextEditor({ value, onChange, placeholder = 'Escreva o texto...' }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        horizontalRule: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    shouldRerenderOnTransaction: true,
    onUpdate: ({ editor: current }) => onChange(current.isEmpty ? '' : current.getHTML()),
  });

  if (!editor) return null;

  return (
    <div className="blog-editor overflow-hidden rounded-md border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-primary/40">
      <div className="flex flex-wrap gap-0.5 border-b border-slate-200 bg-slate-50 p-1">
        <ToolbarButton label="Negrito" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Itálico" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Sublinhado" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <Underline className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Riscado" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <span className="mx-1 w-px self-stretch bg-slate-200" />
        <ToolbarButton label="Título grande" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Título pequeno" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <span className="mx-1 w-px self-stretch bg-slate-200" />
        <ToolbarButton label="Lista com marcadores" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Lista numerada" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Citação" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <span className="mx-1 w-px self-stretch bg-slate-200" />
        <ToolbarButton label="Inserir link" active={editor.isActive('link')} onClick={() => setLink(editor)}>
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
        {editor.isActive('link') && (
          <ToolbarButton label="Remover link" onClick={() => editor.chain().focus().extendMarkRange('link').unsetLink().run()}>
            <Link2Off className="h-4 w-4" />
          </ToolbarButton>
        )}
      </div>
      <EditorContent editor={editor} className="blog-rich !text-base" />
    </div>
  );
}
