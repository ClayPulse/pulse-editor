"use client";

import { ViewDocument } from "@/lib/types";
import { useContext, useEffect, useState } from "react";
import { EditorContext } from "./providers/editor-context-provider";
import { PlatformEnum } from "@/lib/platform-api/available-platforms";
import { getPlatform } from "@/lib/platform-api/platform-checker";
import toast from "react-hot-toast";
import { View } from "@/lib/views/view";
import { ViewTypeEnum } from "@/lib/views/available-views";
import { ViewManager } from "@/lib/views/view-manager";
import { Button } from "@nextui-org/react";
import useExplorer from "@/lib/hooks/use-explorer";
import { usePlatformApi } from "@/lib/hooks/use-platform-api";

export default function Explorer({
  setIsMenuOpen,
}: {
  setIsMenuOpen: (isOpen: boolean) => void;
}) {
  const platform = getPlatform();
  const editorContext = useContext(EditorContext);
  const { selectAndSetProjectHome } = useExplorer();
  const { platformApi } = usePlatformApi();
  const [projects, setProjects] = useState<string[]>([]);

  useEffect(() => {
    if (platformApi) {
      const homePath = editorContext?.persistSettings?.projectHomePath;
      if (homePath) {
        platformApi.listPathFolders(homePath).then((projects) => {
          setProjects(projects);
        });
      }
    }
  }, [editorContext?.persistSettings, platformApi]);

  async function discoverFiles() {
    // const fileSystemObject = await platformApi.openProject();
  }

  function saveFile() {
    const viewDocument =
      editorContext?.viewManager?.getActiveView()?.viewDocument;
    if (viewDocument) {
      if (platform === PlatformEnum.Web) {
        toast.error(
          "Save file is not yet implemented for web platform, try downloading the file instead",
        );
      } else {
        // showSaveFileDialog().then((filePath) => {
        //   if (filePath) {
        //     writeFile(
        //       new File([viewDocument.fileContent], filePath),
        //       filePath,
        //     ).then(() => {
        //       toast.success("File saved successfully");
        //     });
        //   }
        // });
      }
    }
  }

  function openFile() {
    // platformApi?.showOpenFileDialog().then((files) => {
    //   console.log(files);
    //   const firstFile = files[0];
    //   firstFile?.text().then((text) => {
    //     console.log("File content:\n" + text);
    //     const viewDocument: ViewDocument = {
    //       fileContent: text,
    //       filePath: firstFile.name,
    //     };
    //     openDocumentInView(viewDocument);
    //   });
    // });
  }

  function openDocumentInView(doc: ViewDocument) {
    const view = new View(ViewTypeEnum.Code, doc);
    // Notify state update
    editorContext?.setViewManager((prev) => {
      const newVM = ViewManager.copy(prev);
      newVM?.clearView();
      // Add view to view manager
      newVM?.addView(view);
      // Set the view as active
      newVM?.setActiveView(view);
      return newVM;
    });

    setIsMenuOpen(false);
  }

  return (
    <>
      {editorContext?.persistSettings?.projectHomePath ? (
        <div className="h-full w-full space-y-2 bg-content2 p-4 overflow-y-auto">
          <Button className="w-full">New Project</Button>
          <div className="grid w-full grid-cols-2 gap-4">
            {projects.map((project, index) => (
              <div className="flex h-28 w-full flex-col gap-y-0.5" key={index}>
                <div className="h-full w-full rounded-lg bg-default"></div>
                <div>
                  <p className="text-center">{project}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-full w-full space-y-2 bg-content2 p-4">
          <p>
            You have not set a project home path yet. Please set a project home
            path to continue. All your projects will be saved in this directory.
          </p>
          <Button
            className="w-full"
            onPress={() => {
              selectAndSetProjectHome();
            }}
          >
            Select Project Home Path
          </Button>
        </div>
      )}
    </>
  );
}
