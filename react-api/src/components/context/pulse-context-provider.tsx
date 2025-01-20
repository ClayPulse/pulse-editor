import React, { ReactNode } from "react";

export default function PulseContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <div>{children}</div>;
}
