import { z } from "zod";

// Default Props
export const DefaultProps = z.object({
  backgroundColor: z.string().default("default").optional(),
  textColor: z.string().default("default").optional(),
  textAlignment: z
    .enum(["left", "center", "right", "justify"])
    .default("left")
    .optional(),
});

export type DefaultProps = z.infer<typeof DefaultProps>;

// Styles
export const Styles = z.object({
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  underline: z.boolean().optional(),
  strikethrough: z.boolean().optional(),
  textColor: z.string().optional(),
  backgroundColor: z.string().default("default").optional(),
});

export type Styles = z.infer<typeof Styles>;
// Styled Text
export const StyledText = z.object({
  type: z.literal("text"),
  text: z.string(),
  styles: Styles,
});
export type StyledText = z.infer<typeof StyledText>;

// Link
export const Link = z.object({
  type: z.literal("link"),
  content: z.array(StyledText),
  href: z.string(),
});

export type Link = z.infer<typeof Link>;

// Inline Content
export const InlineContent = z.union([StyledText, Link]);
export type InlineContent = z.infer<typeof InlineContent>;

export const TableRow = z.object({
  cells: z.array(z.array(InlineContent)),
});
export type TableRow = z.infer<typeof TableRow>;
// Table Content (assumed to be an array of arrays of InlineContent)
export const TableContent = z.object({
  type: z.literal("tableContent"),
  rows: z.array(TableRow),
});
export type TableContent = z.infer<typeof TableContent>;

export const ChecklistProps = DefaultProps.extend({
  checked: z.boolean().default(false).optional(),
});
export type ChecklistProps = z.infer<typeof ChecklistProps>;
export const HeadingProps = DefaultProps.extend({
  level: z.number().optional(),
});
export type HeadingProps = z.infer<typeof HeadingProps>;

export const FileProps = DefaultProps.extend({
  url: z.string().default("").optional(),
  name: z.string().default("").optional(),
  caption: z.string().default("").optional(),
});
export type FileProps = z.infer<typeof FileProps>;

export const ImageProps = DefaultProps.extend({
  url: z.string().default("").optional(),
  name: z.string().default("").optional(),
  caption: z.string().default("").optional(),
  width: z.number().default(512).optional(),
  showPreview: z.boolean().default(true).optional(),
  previewWidth: z.number().int().default(512).optional(),
});
export type ImageProps = z.infer<typeof ImageProps>;

export const AudioProps = DefaultProps.extend({
  url: z.string().default("").optional(),
  name: z.string().default("").optional(),
  caption: z.string().default("").optional(),
  showPreview: z.boolean().default(true).optional(),
});
export type AudioProps = z.infer<typeof AudioProps>;

export const VideoProps = DefaultProps.extend({
  url: z.string().default("").optional(),
  name: z.string().default("").optional(),
  caption: z.string().default("").optional(),
  showPreview: z.boolean().default(true).optional(),
  previewWidth: z.number().int().default(512).optional(),
});
export type VideoProps = z.infer<typeof VideoProps>;
export type Block =
  | {
      type: "paragraph";
      id: string;
      props: DefaultProps;
      content: InlineContent[];
      children: Block[];
    }
  | {
      type: "heading";
      id: string;
      props: HeadingProps;
      content: InlineContent[];
      children: Block[];
    }
  | {
      type: "bulletListItem";
      id: string;
      props: DefaultProps;
      content: InlineContent[];
      children: Block[];
    }
  | {
      type: "numberedListItem";
      id: string;
      props: DefaultProps;
      content: InlineContent[];
      children: Block[];
    }
  | {
      type: "checkListItem";
      id: string;
      props: ChecklistProps;
      content: InlineContent[];
      children: Block[];
    }
  | {
      type: "file";
      id: string;
      props: FileProps;
      content: undefined;
      children: Block[];
    }
  | {
      type: "image";
      id: string;
      props: ImageProps;
      content: undefined;
      children: Block[];
    }
  | {
      type: "video";
      id: string;
      props: VideoProps;
      content: undefined;
      children: Block[];
    }
  | {
      type: "audio";
      id: string;
      props: AudioProps;
      content: undefined;
      children: Block[];
    }
  | {
      type: "table";
      id: string;
      props: DefaultProps;
      content: TableContent;
      children: Block[];
    };

export const Block: z.ZodType<Block> = z.lazy(() =>
  z.union(
    [
      z.object({
        id: z.string().uuid(),
        type: z.literal("paragraph"),
        props: DefaultProps,
        content: z.array(InlineContent),
        children: z.array(Block),
      }),
      z.object({
        id: z.string().uuid(),
        type: z.literal("heading"),
        props: HeadingProps,
        content: z.array(InlineContent),
        children: z.array(Block),
      }),
      z.object({
        id: z.string().uuid(),
        type: z.literal("bulletListItem"),
        props: DefaultProps,
        content: z.array(InlineContent),
        children: z.array(Block),
      }),
      z.object({
        id: z.string().uuid(),
        type: z.literal("numberedListItem"),
        props: DefaultProps,
        content: z.array(InlineContent),
        children: z.array(Block),
      }),
      z.object({
        id: z.string().uuid(),
        type: z.literal("checkListItem"),
        props: ChecklistProps,
        content: z.array(InlineContent),
        children: z.array(Block),
      }),
      z.object({
        id: z.string().uuid(),
        type: z.literal("file"),
        props: FileProps,
        content: z.undefined(),
        children: z.array(Block),
      }),
      z.object({
        id: z.string().uuid(),
        type: z.literal("image"),
        props: ImageProps,
        content: z.undefined(),
        children: z.array(Block),
      }),
      z.object({
        id: z.string().uuid(),
        type: z.literal("video"),
        props: ImageProps,
        content: z.undefined(),
        children: z.array(Block),
      }),
      z.object({
        id: z.string().uuid(),
        type: z.literal("audio"),
        props: AudioProps,
        content: z.undefined(),
        children: z.array(Block),
      }),
      z.object({
        id: z.string().uuid(),
        type: z.literal("table"),
        props: DefaultProps,
        content: TableContent,
        children: z.array(Block),
      }),
    ],
    {}
  )
);
