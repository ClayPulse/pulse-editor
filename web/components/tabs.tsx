import { Button, Tooltip } from "@nextui-org/react";
import { AnimatePresence, motion } from "framer-motion";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import Icon from "./icon";
import { TabItem } from "@/lib/types";

export default function Tabs({
  tabItems,
  selectedItem,
  setSelectedItem,
}: {
  tabItems: TabItem[];
  selectedItem: TabItem | undefined;
  setSelectedItem: Dispatch<SetStateAction<TabItem | undefined>>;
}) {
  const tabDivRef = useRef<HTMLDivElement | null>(null);
  const [isLeftScrollable, setIsLeftScrollable] = useState<boolean>(false);
  const [isRightScrollable, setIsRightScrollable] = useState<boolean>(false);

  function updateScroll() {
    if (tabDivRef.current) {
      setIsLeftScrollable(tabDivRef.current.scrollLeft > 0);
      setIsRightScrollable(
        tabDivRef.current.scrollLeft + tabDivRef.current.clientWidth <
          tabDivRef.current.scrollWidth - 1,
      );
    }
  }

  useEffect(() => {
    updateScroll();
  }, [tabItems]);

  return (
    <div className="mx-1 flex h-full items-center overflow-x-auto">
      <Button
        isIconOnly
        variant="light"
        size="sm"
        onPress={() => {
          // Scroll to the left
          tabDivRef.current?.scrollBy({
            left: -100,
            behavior: "smooth",
          });
        }}
        isDisabled={!isLeftScrollable}
      >
        <Icon name="arrow_left" />
      </Button>
      <AnimatePresence>
        <div
          ref={tabDivRef}
          className="flex items-center overflow-x-auto scrollbar-hide"
          onScroll={(e) => {
            updateScroll();
          }}
        >
          {tabItems.map((item) => (
            <div key={item.name} className="relative flex h-full items-center">
              {selectedItem?.name === item.name && (
                <motion.div
                  className="absolute z-10 h-8 w-full rounded-lg bg-content4 shadow-sm"
                  layoutId="tab-indicator"
                ></motion.div>
              )}
              <Tooltip content={item.description}>
                <Button
                  className={`z-20 h-fit rounded-lg bg-transparent px-2 py-1`}
                  disableRipple
                  disableAnimation
                  onPress={(e) => {
                    setSelectedItem(item);
                    // Move scroll location to the tab
                    const tab = e.target as HTMLElement;
                    tab?.scrollIntoView({
                      behavior: "smooth",
                      inline: "nearest",
                    });
                  }}
                >
                  <div
                    className={`flex items-center space-x-0.5 text-sm text-content1-foreground`}
                  >
                    {item.icon && (
                      <Icon
                        variant="outlined"
                        name={item.icon || "smart_toy"}
                      />
                    )}
                    <p>{item.name}</p>
                  </div>
                </Button>
              </Tooltip>
            </div>
          ))}
        </div>
      </AnimatePresence>

      <Button
        isIconOnly
        variant="light"
        size="sm"
        onPress={() => {
          // Scroll to the right
          tabDivRef.current?.scrollBy({
            left: 100,
            behavior: "smooth",
          });
        }}
        isDisabled={!isRightScrollable}
      >
        <Icon name="arrow_right" />
      </Button>
    </div>
  );
}
