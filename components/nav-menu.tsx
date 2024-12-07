import { Button } from "@nextui-org/react";
import { AnimatePresence, motion } from "framer-motion";
import { useMediaQuery } from "react-responsive";
import { useFileSystem } from "@/lib/hooks/use-file-system";
import { ViewDocument } from "@/lib/types";
import { CodeEditorViewRef } from "./views/code-editor-view";
import { EditorContext } from "./providers/editor-context-provider";
import { useContext } from "react";

function MenuPanel({ children }: { children?: React.ReactNode }) {
  const isDesktop = useMediaQuery({
    query: "(min-width: 768px)",
  });

  return (
    <>
      {isDesktop ? (
        <motion.div
          className="z-30 hidden h-full w-[400px] flex-shrink-0 md:block"
          initial={{
            x: -400,
          }}
          animate={{
            x: 0,
          }}
          exit={{
            x: -400,
          }}
          transition={{
            type: "tween",
          }}
        >
          {children}
        </motion.div>
      ) : (
        <motion.div
          className="absolute z-30 h-full w-full md:hidden"
          initial={{
            y: "-100vh",
          }}
          animate={{
            y: 0,
          }}
          exit={{
            y: "-100vh",
          }}
          transition={{
            type: "tween",
          }}
        >
          {children}
        </motion.div>
      )}
    </>
  );
}

export default function NavMenu({ isMenuOpen }: { isMenuOpen: boolean }) {
  const { projectPath, openFilePicker, readFile } = useFileSystem();

  const editorContext = useContext(EditorContext);

  return (
    <AnimatePresence>
      {isMenuOpen && (
        <MenuPanel>
          <div className="h-full w-full bg-content2 p-2">
            <div className="flex h-full w-full flex-col items-center space-y-1">
              {!projectPath && (
                <div className="flex w-full flex-wrap justify-center gap-x-0.5 gap-y-0.5">
                  <Button size="sm">New Project</Button>
                  <Button
                    size="sm"
                    onPress={() => {
                      openFilePicker(true).then((folderPaths) => {
                        console.log(folderPaths);
                      });
                    }}
                  >
                    Open Project
                  </Button>
                  <Button size="sm">Save Project</Button>
                  <Button size="sm">New File</Button>
                  <Button
                    size="sm"
                    onPress={() => {
                      openFilePicker(false).then((filePaths) => {
                        console.log(filePaths);
                        const filePath = filePaths[0];
                        // Open the first file
                        readFile(filePath).then((file) => {
                          console.log(file);
                          file.text().then((text) => {
                            console.log("File content:\n" + text);
                            const viewDocument: ViewDocument = {
                              fileContent: text,
                              filePath: filePath,
                            };
                            // Get the code editor view
                            const codeEditor = editorContext?.getViewById(
                              "1",
                            ) as CodeEditorViewRef;

                            // Set the viewDocument
                            codeEditor?.setViewDocument(viewDocument);
                          });
                        });
                      });
                    }}
                  >
                    Open File
                  </Button>
                  <Button size="sm">Save File</Button>
                </div>
              )}
            </div>
          </div>
        </MenuPanel>
      )}
    </AnimatePresence>
  );
}
