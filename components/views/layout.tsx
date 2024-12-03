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
      className="overflow-hidden rounded-lg"
      style={{
        height,
        width,
      }}
    >
      <Suspense>{children}</Suspense>
    </div>
  );
}
