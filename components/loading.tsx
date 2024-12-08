import { Progress } from "@nextui-org/react";

export default function Loading() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center dark:bg-[#27272A]">
      <Progress
        isIndeterminate={true}
        className="w-1/2 text-black dark:text-white"
        color="default"
        size="md"
        label="Loading..."
        classNames={{
          label: "w-full text-center",
        }}
      />
    </div>
  );
}
