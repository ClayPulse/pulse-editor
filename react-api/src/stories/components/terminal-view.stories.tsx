import type { Meta, StoryObj } from "@storybook/react";

import TerminalView from "../../components/views/terminal-view";
import React from "react";

const meta = {
  component: TerminalView,
} satisfies Meta<typeof TerminalView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <div>Terminal View</div>,
  },
};
