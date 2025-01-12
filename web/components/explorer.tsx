"use client";

import { ProjectInfo, ViewDocument } from "@/lib/types";
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
import ProjectSettingsModal from "./modals/project-settings-modal";

export default function Explorer({
  setIsMenuOpen,
}: {
  setIsMenuOpen: (isOpen: boolean) => void;
}) {
  const platform = getPlatform();
  const editorContext = useContext(EditorContext);
  const { selectAndSetProjectHome } = useExplorer();
  const { platformApi } = usePlatformApi();

  const [isProjectSettingsModalOpen, setIsProjectSettingsModalOpen] =
    useState(false);

  useEffect(() => {
    if (platformApi) {
      const homePath = editorContext?.persistSettings?.projectHomePath;
      if (homePath) {
        platformApi.listPathProjects(homePath).then((projects) => {
          editorContext?.setEditorStates((prev) => {
            return {
              ...prev,
              projectsInfo: projects,
            };
          });
        });
      }
    }
  }, [editorContext?.persistSettings, platformApi]);

  function openProject(projectName: string) {
    const uri =
      editorContext?.persistSettings?.projectHomePath + "/" + projectName;

    platformApi?.discoverProjectContent(uri).then((objects) => {
      console.log(objects);
      editorContext?.setEditorStates((prev) => {
        return {
          ...prev,
          project: projectName,
          projectContent: objects,
        };
      });
    });
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

  function formatDateTime(date: Date) {
    const year = date.getFullYear();
    const month = (1 + date.getMonth()).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hour = date.getHours().toString().padStart(2, "0");
    const minute = date.getMinutes().toString().padStart(2, "0");

    return year + "-" + month + "-" + day + " " + hour + ":" + minute;
  }

  return (
    <>
      {editorContext?.persistSettings?.projectHomePath ? (
        <div className="h-full w-full space-y-2 overflow-y-auto bg-content2 p-4">
          <Button
            className="w-full"
            onPress={() => {
              setIsProjectSettingsModalOpen(true);
            }}
          >
            New Project
          </Button>
          <ProjectSettingsModal
            isOpen={isProjectSettingsModalOpen}
            setIsOpen={setIsProjectSettingsModalOpen}
            isNewProject={true}
          />
          <div className="flex w-full flex-col gap-2">
            {editorContext.editorStates.projectsInfo?.map((project, index) => (
              <Button
                className="w-full"
                key={index}
                variant="light"
                onPress={() => {
                  openProject(project.name);
                }}
              >
                <div className="flex w-full flex-col items-start justify-center">
                  <p>{project.name}</p>
                  <p className="text-xs">
                    {/* Format date time to YYYY-mm-DD HH-MM */}
                    {"Created: " + formatDateTime(project.ctime)}
                  </p>
                </div>
              </Button>
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
