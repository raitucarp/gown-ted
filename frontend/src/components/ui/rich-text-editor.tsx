import React from "react";
import { Box, HStack, IconButton, BoxProps, StackProps } from "@chakra-ui/react";
import { Editor, EditorContent } from "@tiptap/react";
import { PanelScrollArea } from "./panel-scroll-area";
import {
  LuBold,
  LuItalic,
  LuUnderline,
  LuStrikethrough,
  LuCode,
  LuHeading1,
  LuHeading2,
  LuHeading3,
  LuList,
  LuListOrdered,
  LuQuote,
  LuUndo,
  LuRedo,
  LuRemoveFormatting,
} from "react-icons/lu";

interface RichTextEditorContextType {
  editor: Editor | null;
}

const RichTextEditorContext = React.createContext<RichTextEditorContextType>({
  editor: null,
});

export const useRichTextEditorContext = () => React.useContext(RichTextEditorContext);

export interface RichTextEditorProps extends BoxProps {
  editor: Editor | null;
  children: React.ReactNode;
}

export const RichTextEditorRoot = React.forwardRef<HTMLDivElement, RichTextEditorProps>(
  function RichTextEditorRoot({ editor, children, ...rest }, ref) {
    return (
      <RichTextEditorContext.Provider value={{ editor }}>
        <Box
          ref={ref}
          display="flex"
          flexDirection="column"
          height="100%"
          overflow="hidden"
          {...rest}
        >
          {children}
        </Box>
      </RichTextEditorContext.Provider>
    );
  }
);

export const RichTextEditorToolbar = React.forwardRef<HTMLDivElement, StackProps>(
  function RichTextEditorToolbar({ children, ...rest }, ref) {
    return (
      <HStack
        ref={ref}
        px="3"
        py="1.5"
        gap="1"
        flexWrap="wrap"
        borderBottomWidth="1px"
        borderColor="gray.800"
        bg="gray.950"
        zIndex="2"
        {...rest}
      >
        {children}
      </HStack>
    );
  }
);

export const RichTextEditorControlGroup = React.forwardRef<HTMLDivElement, StackProps>(
  function RichTextEditorControlGroup({ children, ...rest }, ref) {
    return (
      <HStack ref={ref} gap="0.5" pr="1.5" borderRightWidth="1px" borderColor="gray.800" {...rest}>
        {children}
      </HStack>
    );
  }
);

export const RichTextEditorContent = React.forwardRef<
  HTMLDivElement,
  Omit<React.ComponentProps<typeof EditorContent>, "editor">
>(function RichTextEditorContent(props, ref) {
  const { editor } = useRichTextEditorContext();
  if (!editor) return null;
  return (
    <PanelScrollArea p="5" flex="1">
      <Box
        ref={ref}
        css={{
          "& .tiptap": {
            outline: "none",
            minHeight: "100%",
            lineHeight: "1.7",
            fontSize: "1.05rem",
            color: "#E2E8F0",
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            "& > * + *": {
              marginTop: "0.85em",
            },
            "& h1": {
              fontSize: "2rem",
              fontWeight: "700",
              color: "#63B3ED",
              letterSpacing: "-0.02em",
              marginBottom: "0.5em",
            },
            "& h2": {
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#90CDF4",
              marginTop: "1.2em",
              marginBottom: "0.4em",
            },
            "& h3": {
              fontSize: "1.25rem",
              fontWeight: "600",
              color: "#BEE3F8",
              marginTop: "1em",
              marginBottom: "0.3em",
            },
            "& p": {
              margin: "0 0 0.8em 0",
            },
            "& blockquote": {
              borderLeft: "3px solid #4FD1C5",
              paddingLeft: "1rem",
              color: "#CBD5E0",
              fontStyle: "italic",
              my: "1em",
            },
            "& ul, & ol": {
              paddingLeft: "1.5rem",
              margin: "0 0 0.8em 0",
            },
            "& li": {
              marginBottom: "0.25em",
            },
            "& code": {
              bg: "rgba(255, 255, 255, 0.08)",
              px: "0.4em",
              py: "0.2em",
              borderRadius: "4px",
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: "0.9em",
              color: "#90CDF4",
            },
            "& pre": {
              bg: "gray.900",
              p: "1rem",
              borderRadius: "8px",
              borderWidth: "1px",
              borderColor: "gray.800",
              my: "1em",
              "& code": {
                bg: "transparent",
                p: 0,
                color: "#E2E8F0",
              },
            },
          },
        }}
      >
        <EditorContent editor={editor} {...props} />
      </Box>
    </PanelScrollArea>
  );
});

export const ControlButton: React.FC<{
  isActive?: boolean;
  onClick: () => void;
  title: string;
  icon: React.ReactNode;
}> = ({ isActive, onClick, title, icon }) => {
  return (
    <IconButton
      size="xs"
      variant={isActive ? "solid" : "ghost"}
      colorPalette={isActive ? "blue" : "gray"}
      color={isActive ? "white" : "gray.300"}
      _hover={{ bg: isActive ? "blue.500" : "gray.800", color: "white" }}
      onClick={onClick}
      title={title}
      aria-label={title}
    >
      {icon}
    </IconButton>
  );
};

export const RichTextEditorToolbarControls: React.FC = () => {
  const { editor } = useRichTextEditorContext();
  if (!editor) return null;

  return (
    <RichTextEditorToolbar>
      <RichTextEditorControlGroup>
        <ControlButton
          isActive={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold (Ctrl+B)"
          icon={<LuBold size={15} />}
        />
        <ControlButton
          isActive={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic (Ctrl+I)"
          icon={<LuItalic size={15} />}
        />
        <ControlButton
          isActive={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline (Ctrl+U)"
          icon={<LuUnderline size={15} />}
        />
        <ControlButton
          isActive={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
          icon={<LuStrikethrough size={15} />}
        />
        <ControlButton
          isActive={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Inline Code"
          icon={<LuCode size={15} />}
        />
      </RichTextEditorControlGroup>

      <RichTextEditorControlGroup>
        <ControlButton
          isActive={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Heading 1"
          icon={<LuHeading1 size={15} />}
        />
        <ControlButton
          isActive={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
          icon={<LuHeading2 size={15} />}
        />
        <ControlButton
          isActive={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading 3"
          icon={<LuHeading3 size={15} />}
        />
      </RichTextEditorControlGroup>

      <RichTextEditorControlGroup>
        <ControlButton
          isActive={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
          icon={<LuList size={15} />}
        />
        <ControlButton
          isActive={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered List"
          icon={<LuListOrdered size={15} />}
        />
        <ControlButton
          isActive={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Blockquote"
          icon={<LuQuote size={15} />}
        />
      </RichTextEditorControlGroup>

      <RichTextEditorControlGroup>
        <ControlButton
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          title="Clear Formatting"
          icon={<LuRemoveFormatting size={15} />}
        />
      </RichTextEditorControlGroup>

      <RichTextEditorControlGroup borderRightWidth="0">
        <ControlButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo (Ctrl+Z)"
          icon={<LuUndo size={15} />}
        />
        <ControlButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo (Ctrl+Y)"
          icon={<LuRedo size={15} />}
        />
      </RichTextEditorControlGroup>
    </RichTextEditorToolbar>
  );
};

export const RichTextEditor = {
  Root: RichTextEditorRoot,
  Toolbar: RichTextEditorToolbar,
  ControlGroup: RichTextEditorControlGroup,
  Content: RichTextEditorContent,
  ToolbarControls: RichTextEditorToolbarControls,
};
