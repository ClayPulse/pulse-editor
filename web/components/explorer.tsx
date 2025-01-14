"use client";

import {
  FileSystemObject,
  TreeViewGroupRef,
  TreeViewNodeRef,
  ViewDocument,
} from "@/lib/types";
import {
  ForwardedRef,
  forwardRef,
  Ref,
  RefObject,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { EditorContext } from "./providers/editor-context-provider";
import { PlatformEnum } from "@/lib/platform-api/available-platforms";
import { getPlatform } from "@/lib/platform-api/platform-checker";
import { View } from "@/lib/views/view";
import { ViewTypeEnum } from "@/lib/views/available-views";
import { ViewManager } from "@/lib/views/view-manager";
import { Button, colors, Input } from "@nextui-org/react";
import useExplorer from "@/lib/hooks/use-explorer";
import { usePlatformApi } from "@/lib/hooks/use-platform-api";
import ProjectSettingsModal from "./modals/project-settings-modal";
import Icon from "./icon";

// A tree view node that represents a single file or folder
const TreeViewNode = forwardRef(function TreeViewNode(
  {
    object,
    viewFile,
  }: {
    object: FileSystemObject;
    viewFile: (uri: string) => void;
  },
  ref: Ref<TreeViewNodeRef | null>,
) {
  useImperativeHandle(ref, () => ({
    getSubGroupRef() {
      return groupRef.current;
    },
    getName() {
      return object.name;
    },
  }));

  const [isFolderCollapsed, setIsFolderCollapsed] = useState(true);
  const [isSelected, setIsSelected] = useState(false);
  const editorContext = useContext(EditorContext);

  const groupRef = useRef<TreeViewGroupRef | null>(null);

  function selectNode() {
    // Clear all other selected nodes and select this node
    // if Ctrl is not pressed
    if (editorContext?.editorStates.pressedKeys.indexOf("Control") === -1) {
      // Skip if the node is already selected
      if (
        editorContext?.editorStates.explorerTreeViewNodeRefs?.includes(
          ref as RefObject<TreeViewNodeRef>,
        )
      ) {
        return;
      }

      editorContext?.setEditorStates((prev) => {
        return {
          ...prev,
          explorerTreeViewNodeRefs: [ref as RefObject<TreeViewNodeRef>],
        };
      });
      setIsSelected(true);
    } else {
      // Unselect this node if it is already selected
      if (
        editorContext?.editorStates.explorerTreeViewNodeRefs?.includes(
          ref as RefObject<TreeViewNodeRef>,
        )
      ) {
        console.log("Unselecting");
        editorContext?.setEditorStates((prev) => {
          return {
            ...prev,
            explorerTreeViewNodeRefs: prev.explorerTreeViewNodeRefs?.filter(
              (nodeRef) => nodeRef !== (ref as RefObject<TreeViewNodeRef>),
            ),
          };
        });
        setIsSelected(false);
        return;
      }

      editorContext?.setEditorStates((prev) => {
        return {
          ...prev,
          explorerTreeViewNodeRefs: [
            ...(prev.explorerTreeViewNodeRefs ?? []),
            ref as RefObject<TreeViewNodeRef>,
          ],
        };
      });
      setIsSelected(true);
    }
  }

  // Unselect self if self is not in the selected nodes
  useEffect(() => {
    if (
      editorContext?.editorStates.explorerTreeViewNodeRefs?.indexOf(
        ref as RefObject<TreeViewNodeRef>,
      ) === -1
    ) {
      setIsSelected(false);
    }
  }, [editorContext?.editorStates.explorerTreeViewNodeRefs]);

  return object.isFolder ? (
    <div className="space-y-0.5">
      <Button
        className="h-6 w-full px-2 text-[16px]"
        size="sm"
        onPress={() => {
          setIsFolderCollapsed(!isFolderCollapsed);
          selectNode();
        }}
        variant={isSelected ? "bordered" : "solid"}
      >
        <div className="flex w-full">
          <p>{object.name}</p>
          <div className="flex w-full justify-end">
            <Icon name={isFolderCollapsed ? "expand_more" : "expand_less"} />
          </div>
        </div>
      </Button>
      {object.subDirItems && !isFolderCollapsed && (
        <div className="ml-4">
          <TreeViewGroup
            ref={groupRef}
            objects={object.subDirItems}
            viewFile={viewFile}
          />
        </div>
      )}
    </div>
  ) : (
    <Button
      className="h-6 w-full px-2 text-[16px]"
      size="sm"
      onPress={() => {
        viewFile(object.uri);
        selectNode();
      }}
      variant={isSelected ? "bordered" : "light"}
    >
      <div className="w-full">
        <p className="w-fit">{object.name}</p>
      </div>
    </Button>
  );
});

function TreeViewNodeWrapper({
  object,
  viewFile,
}: {
  object: FileSystemObject;
  viewFile: (uri: string) => void;
}) {
  const nodeRef = useRef<TreeViewNodeRef | null>(null);

  return <TreeViewNode ref={nodeRef} object={object} viewFile={viewFile} />;
}

const TreeViewGroup = forwardRef(function TreeViewGroup(
  {
    objects,
    viewFile,
  }: {
    objects: FileSystemObject[];
    viewFile: (uri: string) => void;
  },
  ref: Ref<TreeViewGroupRef>,
) {
  useImperativeHandle(ref, () => ({
    startCreatingNewFolder() {
      setIsCreatingNewFolder(true);
    },
    startCreatingNewFile() {
      setIsCreatingNewFile(true);
    },
  }));

  const [isCreatingNewFile, setIsCreatingNewFile] = useState(false);
  const [isCreatingNewFolder, setIsCreatingNewFolder] = useState(false);

  if (objects.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <p>Empty content. Create a new file to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {objects.map((object) => {
        return (
          <TreeViewNodeWrapper
            key={object.uri}
            object={object}
            viewFile={viewFile}
          />
        );
      })}

      {isCreatingNewFolder && <Input placeholder="folder name" />}
      {isCreatingNewFile && <Input placeholder="file name" />}
    </div>
  );
});

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

  // Create new file/folder
  const [isCreatingNewFile, setIsCreatingNewFile] = useState(false);
  const [isCreatingNewFolder, setIsCreatingNewFolder] = useState(false);

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
      editorContext?.setEditorStates((prev) => {
        return {
          ...prev,
          project: projectName,
          projectContent: objects,
        };
      });
    });
  }

  function viewFile(uri: string) {
    platformApi?.readFile(uri).then((file) => {
      file?.text().then((text) => {
        const viewDocument: ViewDocument = {
          fileContent: text,
          filePath: uri,
        };
        openDocumentInView(viewDocument);
      });
    });
  }

  function openDocumentInView(doc: ViewDocument) {
    const view = new View(ViewTypeEnum.Code, doc);
    // Notify state update by setting a modified copy of the view manager
    editorContext?.setViewManager((prev) => {
      const newVM = ViewManager.copy(prev);
      newVM?.clearView();
      // Add view to view manager
      newVM?.addView(view);
      // Set the view as active
      newVM?.setActiveView(view);
      return newVM;
    });

    if (platform === PlatformEnum.Capacitor) {
      setIsMenuOpen(false);
    }
  }

  function formatDateTime(date: Date) {
    const year = date.getFullYear();
    const month = (1 + date.getMonth()).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hour = date.getHours().toString().padStart(2, "0");
    const minute = date.getMinutes().toString().padStart(2, "0");

    return year + "-" + month + "-" + day + " " + hour + ":" + minute;
  }

  function startCreatingNewFile() {
    setIsCreatingNewFile(true);
  }

  function startCreatingNewFolder() {
    setIsCreatingNewFolder(true);
  }

  // Browse inside a project
  if (editorContext?.editorStates.project) {
    return (
      <div className="flex h-full w-full flex-col space-y-2 overflow-y-auto bg-content2 px-4 py-2">
        <div className="flex h-10 w-full items-center rounded-xl bg-default px-3 text-default-foreground">
          <div className="flex w-full">
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={startCreatingNewFolder}
            >
              <Icon name="create_new_folder" variant="outlined" />
            </Button>
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={startCreatingNewFile}
            >
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

        <TreeViewGroup
          objects={editorContext.editorStates.projectContent ?? []}
          viewFile={viewFile}
        />
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
