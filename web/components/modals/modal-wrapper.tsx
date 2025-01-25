import { Modal, ModalContent } from "@nextui-org/react";

export default function ModalWrapper({
  children,
  isOpen,
  setIsOpen,
  title,
}: {
  children?: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  title: string;
}) {
  return (
    <Modal
      backdrop="opaque"
      isOpen={isOpen}
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut",
            },
          },
          exit: {
            y: -20,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: "easeIn",
            },
          },
        },
      }}
      onClose={() => {
        setIsOpen(false);
      }}
      isDismissable={false}
    >
      <ModalContent>
        <div className="h-fit w-full px-4 pt-8">
          <div className="max-h-[70vh] overflow-y-auto pb-4">
            <p className="text-center text-lg font-bold pb-4">
              {title}
            </p>
            {children}
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
