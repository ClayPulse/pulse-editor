import type { Meta, StoryObj } from "@storybook/react";

import FileView from "../../components/views/file-view";
import React from "react";

const meta = {
  component: FileView,
} satisfies Meta<typeof FileView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <div className="text-blue-500">File View</div>,
  },
};
