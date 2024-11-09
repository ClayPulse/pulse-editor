import { Suspense } from "react";

export default function ViewLayout({
  height = "100%",
  width = "100%",
  children,
}: {
  height?: string;
  width?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col items-start justify-between rounded-2xl bg-default p-3"
      style={{
        height,
        width,
      }}
    >
      <Suspense>{children}</Suspense>
    </div>
  );
}
