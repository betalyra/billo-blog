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
// Styles
export const Styles = z.object({
    bold: z.boolean().optional(),
    italic: z.boolean().optional(),
    underline: z.boolean().optional(),
    strikethrough: z.boolean().optional(),
    textColor: z.string().optional(),
    backgroundColor: z.string().default("default").optional(),
});
// Styled Text
export const StyledText = z.object({
    type: z.literal("text"),
    text: z.string(),
    styles: Styles,
});
// Link
export const Link = z.object({
    type: z.literal("link"),
    content: z.array(StyledText),
    href: z.string(),
});
// Inline Content
export const InlineContent = z.union([StyledText, Link]);
export const TableRow = z.object({
    cells: z.array(z.array(InlineContent)),
});
// Table Content (assumed to be an array of arrays of InlineContent)
export const TableContent = z.object({
    type: z.literal("tableContent"),
    rows: z.array(TableRow),
});
export const ChecklistProps = DefaultProps.extend({
    checked: z.boolean().default(false).optional(),
});
export const HeadingProps = DefaultProps.extend({
    level: z.number().optional(),
});
export const FileProps = DefaultProps.extend({
    url: z.string().default("").optional(),
    name: z.string().default("").optional(),
    caption: z.string().default("").optional(),
});
export const ImageProps = DefaultProps.extend({
    url: z.string().default("").optional(),
    name: z.string().default("").optional(),
    caption: z.string().default("").optional(),
    width: z.number().default(512).optional(),
    showPreview: z.boolean().default(true).optional(),
    previewWidth: z.number().int().default(512).optional(),
});
export const AudioProps = DefaultProps.extend({
    url: z.string().default("").optional(),
    name: z.string().default("").optional(),
    caption: z.string().default("").optional(),
    showPreview: z.boolean().default(true).optional(),
});
export const VideoProps = DefaultProps.extend({
    url: z.string().default("").optional(),
    name: z.string().default("").optional(),
    caption: z.string().default("").optional(),
    showPreview: z.boolean().default(true).optional(),
    previewWidth: z.number().int().default(512).optional(),
});
export const Block = z.lazy(() => z.union([
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
], {}));
//# sourceMappingURL=blocknote.js.map