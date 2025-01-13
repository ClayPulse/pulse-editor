"use client";

import { FileSystemObject, ProjectInfo, ViewDocument } from "@/lib/types";
import { Key, useContext, useEffect, useState } from "react";
import { EditorContext } from "./providers/editor-context-provider";
import { PlatformEnum } from "@/lib/platform-api/available-platforms";
import { getPlatform } from "@/lib/platform-api/platform-checker";
import toast from "react-hot-toast";
import { View } from "@/lib/views/view";
import { ViewTypeEnum } from "@/lib/views/available-views";
import { ViewManager } from "@/lib/views/view-manager";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import useExplorer from "@/lib/hooks/use-explorer";
import { usePlatformApi } from "@/lib/hooks/use-platform-api";
import ProjectSettingsModal from "./modals/project-settings-modal";
import Icon from "./icon";

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

  function closeProject() {
    editorContext?.setEditorStates((prev) => {
      return {
        ...prev,
        project: "",
        projectContent: [],
      };
    });
  }

  function handleProjectMenu(key: Key) {
    if (key === "close") {
      closeProject();
    } else if (key === "settings") {
      setIsProjectSettingsModalOpen(true);
    }
  }

  function TreeNode({ object }: { object: FileSystemObject }) {
    const [isFolderCollapsed, setIsFolderCollapsed] = useState(true);

    return object.isFolder ? (
      <div className="space-y-0.5">
        <Button
          className="h-6 w-full px-2 text-[16px]"
          size="sm"
          onPress={() => {
            setIsFolderCollapsed(!isFolderCollapsed);
          }}
        >
          <div className="flex w-full">
            <div>{object.name}</div>
            <div className="flex w-full justify-end">
              <Icon name={isFolderCollapsed ? "expand_more" : "expand_less"} />
            </div>
          </div>
        </Button>
        {object.subDirItems && !isFolderCollapsed && (
          <div className="ml-4">
            <TreeView objects={object.subDirItems} />
          </div>
        )}
      </div>
    ) : (
      <div className="px-2">{object.name}</div>
    );
  }

  function TreeView({ objects }: { objects: FileSystemObject[] }) {
    return (
      <div className="space-y-0.5">
        {objects.map((object, index) => {
          return <TreeNode key={index} object={object} />;
        })}
      </div>
    );
  }

  // Browse inside a project
  if (editorContext?.editorStates.project) {
    return (
      <div className="flex h-full w-full flex-col space-y-2 overflow-y-auto bg-content2 p-4">
        <div className="flex w-full items-center justify-center pl-8">
          <p>{editorContext.editorStates.project}</p>
          <Dropdown>
            <DropdownTrigger>
              <Button onPress={() => {}} isIconOnly variant="light" size="sm">
                <Icon name="expand_more" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu onAction={handleProjectMenu}>
              <DropdownItem key="close">Close Project</DropdownItem>
              <DropdownItem key="settings">Project Settings</DropdownItem>
            </DropdownMenu>
          </Dropdown>{" "}
          <ProjectSettingsModal
            isOpen={isProjectSettingsModalOpen}
            setIsOpen={setIsProjectSettingsModalOpen}
            projectInfo={editorContext.editorStates.projectsInfo?.find(
              (project) => project.name === editorContext.editorStates.project,
            )}
          />
        </div>

        <div className="flex h-10 w-full items-center rounded-xl bg-default px-3 text-default-foreground">
          <div className="flex w-full">
            <Button isIconOnly variant="light" size="sm">
              <Icon name="create_new_folder" variant="outlined" />
            </Button>
            <Button isIconOnly variant="light" size="sm">
              <Icon uri="/icons/add-file" className="-translate-x-0.5" />
            </Button>
          </div>
          <div className="flex">
            <Button isIconOnly variant="light" size="sm">
              <Icon name="cloud_upload" variant="outlined" />
            </Button>
            <Button isIconOnly variant="light" size="sm">
              <Icon name="cloud_download" variant="outlined" />
            </Button>
            <Button isIconOnly variant="light" size="sm">
              <Icon name="search" variant="outlined" />
            </Button>
          </div>
        </div>

        <TreeView objects={editorContext.editorStates.projectContent ?? []} />
      </div>
    );
  }
  // Pick project
  else if (editorContext?.persistSettings?.projectHomePath) {
    return (
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
                  {"Created: " + formatDateTime(project.ctime)}
                </p>
              </div>
            </Button>
          ))}
        </div>
      </div>
    );
  }
  // Choose project home path
  return (
    <div className="h-full w-full space-y-2 bg-content2 p-4">
      <p>
        You have not set a project home path yet. Please set a project home path
        to continue. All your projects will be saved in this directory.
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
  );
}
