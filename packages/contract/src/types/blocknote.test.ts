import { describe, test, expect, assert, it } from "vitest";
import { Block } from "./blocknote.js";
const blocks: any[] = [
  {
    id: "03b4cce4-1055-4122-97b3-abd798e68bdf",
    type: "paragraph",
    props: {
      textColor: "default",
      textAlignment: "left",
      backgroundColor: "default",
    },
    content: [
      {
        text: "Welcome to this demo!",
        type: "text",
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: "8d4a72d2-e01c-4d80-ade1-541dd8f8b134",
    type: "paragraph",
    props: {
      textColor: "default",
      textAlignment: "left",
      backgroundColor: "default",
    },
    content: [],
    children: [],
  },
  {
    id: "adcc8b9b-8db6-458a-98ee-2a6127289620",
    type: "paragraph",
    props: {
      textColor: "default",
      textAlignment: "left",
      backgroundColor: "default",
    },
    content: [
      {
        text: "Blocks:",
        type: "text",
        styles: {
          bold: true,
        },
      },
    ],
    children: [],
  },
  {
    id: "a64c0ec5-f6eb-4e91-9da0-0746012ce560",
    type: "paragraph",
    props: {
      textColor: "default",
      textAlignment: "left",
      backgroundColor: "default",
    },
    content: [
      {
        text: "Paragraph",
        type: "text",
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: "7c179f5a-28e0-454f-89c9-655ffc34e66b",
    type: "heading",
    props: {
      level: 1,
      textColor: "default",
      textAlignment: "left",
      backgroundColor: "default",
    },
    content: [
      {
        text: "Heading",
        type: "text",
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: "ef77baa2-5940-4868-94c9-bc70973f5b84",
    type: "bulletListItem",
    props: {
      textColor: "default",
      textAlignment: "left",
      backgroundColor: "default",
    },
    content: [
      {
        text: "Bullet List Item",
        type: "text",
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: "f4b9267f-9648-4241-b326-ba0e9a2d6a9f",
    type: "numberedListItem",
    props: {
      textColor: "default",
      textAlignment: "left",
      backgroundColor: "default",
    },
    content: [
      {
        text: "Numbered List Item",
        type: "text",
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: "86564289-b18f-4c73-95ae-91e5783bba26",
    type: "checkListItem",
    props: {
      checked: false,
      textColor: "default",
      textAlignment: "left",
      backgroundColor: "default",
    },
    content: [
      {
        text: "Check List Item",
        type: "text",
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: "71996a41-4f4f-4ca9-8f60-0899f99c97a1",
    type: "table",
    props: {
      textColor: "default",
      backgroundColor: "default",
    },
    content: {
      rows: [
        {
          cells: [
            [
              {
                text: "Table Cell",
                type: "text",
                styles: {},
              },
            ],
            [
              {
                text: "Table Cell",
                type: "text",
                styles: {},
              },
            ],
            [
              {
                text: "Table Cell",
                type: "text",
                styles: {},
              },
            ],
          ],
        },
        {
          cells: [
            [
              {
                text: "Table Cell",
                type: "text",
                styles: {},
              },
            ],
            [
              {
                text: "Table Cell",
                type: "text",
                styles: {},
              },
            ],
            [
              {
                text: "Table Cell",
                type: "text",
                styles: {},
              },
            ],
          ],
        },
        {
          cells: [
            [
              {
                text: "Table Cell",
                type: "text",
                styles: {},
              },
            ],
            [
              {
                text: "Table Cell",
                type: "text",
                styles: {},
              },
            ],
            [
              {
                text: "Table Cell",
                type: "text",
                styles: {},
              },
            ],
          ],
        },
      ],
      type: "tableContent",
    },
    children: [],
  },
  {
    id: "2827dbed-1839-4fd9-b8b2-32aaa53279c8",
    type: "file",
    props: {
      url: "",
      name: "",
      caption: "",
      backgroundColor: "default",
    },
    children: [],
  },
  {
    id: "46f9a600-bed2-42cf-8b58-40cf2062b22d",
    type: "image",
    props: {
      url: "https://interactive-examples.mdn.mozilla.net/media/cc0-images/grapefruit-slice-332-332.jpg",
      name: "",
      caption:
        "From https://interactive-examples.mdn.mozilla.net/media/cc0-images/grapefruit-slice-332-332.jpg",
      showPreview: true,
      previewWidth: 512,
      textAlignment: "left",
      backgroundColor: "default",
    },
    children: [],
  },
  {
    id: "2993b4d7-7b1d-403e-9df5-c6382bdd8a8e",
    type: "video",
    props: {
      url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm",
      name: "",
      caption:
        "From https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm",
      showPreview: true,
      previewWidth: 512,
      textAlignment: "left",
      backgroundColor: "default",
    },
    children: [],
  },
  {
    id: "22bc71aa-8b16-452f-bc25-3bd4d54b6415",
    type: "audio",
    props: {
      url: "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3",
      name: "",
      caption:
        "From https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3",
      showPreview: true,
      backgroundColor: "default",
    },
    children: [],
  },
  {
    id: "3178b5b1-c0af-48ce-9153-652d64d2bc53",
    type: "paragraph",
    props: {
      textColor: "default",
      textAlignment: "left",
      backgroundColor: "default",
    },
    content: [],
    children: [],
  },
  {
    id: "90a2168d-fc73-4b70-ae2c-da3fbc1efdd9",
    type: "paragraph",
    props: {
      textColor: "default",
      textAlignment: "left",
      backgroundColor: "default",
    },
    content: [
      {
        text: "Inline Content:",
        type: "text",
        styles: {
          bold: true,
        },
      },
    ],
    children: [],
  },
  {
    id: "19f46e6d-48bd-4ec3-8c52-049311c7431d",
    type: "paragraph",
    props: {
      textColor: "default",
      textAlignment: "left",
      backgroundColor: "default",
    },
    content: [
      {
        text: "Styled Text",
        type: "text",
        styles: {
          bold: true,
          italic: true,
          textColor: "red",
          backgroundColor: "blue",
        },
      },
      {
        text: " ",
        type: "text",
        styles: {},
      },
      {
        href: "https://www.blocknotejs.org",
        type: "link",
        content: [
          {
            text: "Link",
            type: "text",
            styles: {},
          },
        ],
      },
    ],
    children: [],
  },
  {
    id: "5a462b14-9fdf-4cf3-a9f5-e3872439922e",
    type: "paragraph",
    props: {
      textColor: "default",
      textAlignment: "left",
      backgroundColor: "default",
    },
    content: [],
    children: [],
  },
];

test.each(blocks)("block should parse successful", (expectedBlock) => {
  const actualBlock = Block.safeParse(expectedBlock);
  expect(actualBlock.success).toBeTruthy();
  assert.deepEqual(actualBlock.data, expectedBlock);
});
