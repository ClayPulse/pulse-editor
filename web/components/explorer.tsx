"use client";

import {
  FileSystemObject,
  TreeViewGroupRef,
  TreeViewNodeRef,
  ViewDocument,
} from "@/lib/types";
import {
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
import { Button, Input } from "@nextui-org/react";
import useExplorer from "@/lib/hooks/use-explorer";
import { usePlatformApi } from "@/lib/hooks/use-platform-api";
import ProjectSettingsModal from "./modals/project-settings-modal";
import Icon from "./icon";
import toast from "react-hot-toast";
import { AbstractPlatformAPI } from "@/lib/platform-api/abstract-platform-api";

// A tree view node that represents a single file or folder
const TreeViewNode = forwardRef(function TreeViewNode(
  {
    object,
    viewFile,
    platformApi,
    parentGroupRef,
  }: {
    object: FileSystemObject;
    viewFile: (uri: string) => void;
    platformApi?: AbstractPlatformAPI;
    parentGroupRef: RefObject<TreeViewGroupRef>;
  },
  ref: Ref<TreeViewNodeRef | null>,
) {
  useImperativeHandle(ref, () => ({
    getParentGroupRef() {
      return parentGroupRef.current;
    },
    getChildGroupRef() {
      return childGroupRef.current;
    },
    isFolder() {
      return object.isFolder;
    },
  }));

  const [isFolderCollapsed, setIsFolderCollapsed] = useState(true);
  const [isSelected, setIsSelected] = useState(false);
  const editorContext = useContext(EditorContext);

  const childGroupRef = useRef<TreeViewGroupRef | null>(null);

  // Unselect self if self is not in the selected nodes
  useEffect(() => {
    if (
      editorContext?.editorStates.explorerSelectedNodeRefs?.indexOf(
        ref as RefObject<TreeViewNodeRef>,
      ) === -1
    ) {
      setIsSelected(false);

      // Reset group state
      childGroupRef.current?.cancelCreating();
    }
  }, [editorContext?.editorStates.explorerSelectedNodeRefs]);

  /* Select 1 node. This is for single selection when Ctrl is not pressed. */
  function selectNode() {
    // Clear all other selected nodes and select this node
    // if Ctrl is not pressed
    editorContext?.setEditorStates((prev) => {
      return {
        ...prev,
        explorerSelectedNodeRefs: [ref as RefObject<TreeViewNodeRef>],
      };
    });
    setIsSelected(true);
  }

  /* Clear all selected nodes. This is for single selection when Ctrl is not pressed. */
  function unSelectNode() {
    editorContext?.setEditorStates((prev) => {
      return {
        ...prev,
        explorerSelectedNodeRefs: [],
      };
    });
    setIsSelected(false);
  }

  function multiSelectNode() {
    // Unselect this node if it is already selected
    if (
      editorContext?.editorStates.explorerSelectedNodeRefs?.includes(
        ref as RefObject<TreeViewNodeRef>,
      )
    ) {
      editorContext?.setEditorStates((prev) => {
        return {
          ...prev,
          explorerSelectedNodeRefs: prev.explorerSelectedNodeRefs?.filter(
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
        explorerSelectedNodeRefs: [
          ...(prev.explorerSelectedNodeRefs ?? []),
          ref as RefObject<TreeViewNodeRef>,
        ],
      };
    });
    setIsSelected(true);
  }

  function isCtrlDown() {
    return editorContext?.editorStates.pressedKeys.indexOf("Control") !== -1;
  }

  return object.isFolder ? (
    <div className="space-y-0.5">
      <Button
        className="w-full px-2 text-[16px]"
        style={{
          height: getPlatform() === PlatformEnum.Capacitor ? "32px" : "24px",
        }}
        size="sm"
        onPress={() => {
          if (isCtrlDown()) {
            multiSelectNode();
          } else {
            if (isFolderCollapsed) {
              selectNode();
            } else {
              unSelectNode();
            }
            // Only toggle folder collapsed state if Ctrl is not pressed
            setIsFolderCollapsed(!isFolderCollapsed);
          }
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
            ref={childGroupRef}
            objects={object.subDirItems}
            viewFile={viewFile}
            folderUri={object.uri}
            platformApi={platformApi}
          />
        </div>
      )}
    </div>
  ) : (
    <Button
      className="w-full px-2 text-[16px]"
      style={{
        height: getPlatform() === PlatformEnum.Capacitor ? "32px" : "24px",
      }}
      size="sm"
      onPress={() => {
        if (isCtrlDown()) {
          multiSelectNode();
        } else {
          if (isFolderCollapsed) {
            selectNode();
          } else {
            unSelectNode();
          }
        }
        viewFile(object.uri);
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
  platformApi,
  parentGroupRef,
}: {
  object: FileSystemObject;
  viewFile: (uri: string) => void;
  platformApi?: AbstractPlatformAPI;
  parentGroupRef: RefObject<TreeViewGroupRef>;
}) {
  const nodeRef = useRef<TreeViewNodeRef | null>(null);

  return (
    <TreeViewNode
      ref={nodeRef}
      object={object}
      viewFile={viewFile}
      platformApi={platformApi}
      parentGroupRef={parentGroupRef}
    />
  );
}

const TreeViewGroup = forwardRef(function TreeViewGroup(
  {
    objects,
    viewFile,
    folderUri,
    platformApi,
  }: {
    objects: FileSystemObject[];
    viewFile: (uri: string) => void;
    folderUri: string;
    platformApi?: AbstractPlatformAPI;
  },
  ref: Ref<TreeViewGroupRef>,
) {
  useImperativeHandle(ref, () => ({
    startCreatingNewFolder() {
      setFolderNameInputValue("");
      setFileNameInputValue("");
      setIsCreatingNewFolder(true);
      setIsCreatingNewFile(false);
    },
    startCreatingNewFile() {
      setFolderNameInputValue("");
      setFileNameInputValue("");
      setIsCreatingNewFolder(false);
      setIsCreatingNewFile(true);
    },
    cancelCreating() {
      setFolderNameInputValue("");
      setFileNameInputValue("");
      setIsCreatingNewFolder(false);
      setIsCreatingNewFile(false);
    },
  }));

  const [isCreatingNewFile, setIsCreatingNewFile] = useState(false);
  const [isCreatingNewFolder, setIsCreatingNewFolder] = useState(false);

  const [folderNameInputValue, setFolderNameInputValue] = useState<string>("");
  const [fileNameInputValue, setFileNameInputValue] = useState<string>("");
  const editorContext = useContext(EditorContext);

  function createNewFolder(uri: string) {
    console.log("Creating new folder with uri:", uri);

    if (!platformApi) {
      toast.error("Platform API is not available.");
      return;
    }

    platformApi.createFolder(uri).then(() => {
      const projectUri =
        editorContext?.persistSettings?.projectHomePath +
        "/" +
        editorContext?.editorStates.project;
      platformApi.discoverProjectContent(projectUri).then((objects) => {
        editorContext?.setEditorStates((prev) => {
          return {
            ...prev,
            projectContent: objects,
          };
        });

        toast.success("Folder created successfully.");
      });
    });

    setFolderNameInputValue("");
    setIsCreatingNewFolder(false);
  }

  function createNewFile(uri: string) {
    console.log("Creating new file with uri:", uri);

    if (!platformApi) {
      toast.error("Platform API is not available.");
      return;
    }

    platformApi.createFile(uri).then(() => {
      const projectUri =
        editorContext?.persistSettings?.projectHomePath +
        "/" +
        editorContext?.editorStates.project;
      platformApi.discoverProjectContent(projectUri).then((objects) => {
        editorContext?.setEditorStates((prev) => {
          return {
            ...prev,
            projectContent: objects,
          };
        });

        toast.success("File created successfully.");
      });
    });

    setFileNameInputValue("");
    setIsCreatingNewFile(false);
  }

  return (
    <div className="space-y-0.5">
      {objects.map((object) => {
        return (
          <TreeViewNodeWrapper
            key={object.uri}
            object={object}
            viewFile={viewFile}
            platformApi={platformApi}
            parentGroupRef={ref as RefObject<TreeViewGroupRef>}
          />
        );
      })}

      {isCreatingNewFolder && (
        <Input
          placeholder="folder name"
          autoFocus
          variant="bordered"
          size="sm"
          value={folderNameInputValue}
          onValueChange={setFolderNameInputValue}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const uri = folderUri + "/" + folderNameInputValue;
              createNewFolder(uri);
            }
          }}
          onFocusChange={(isFocused) => {
            if (!isFocused) {
              const uri = folderUri + "/" + folderNameInputValue;
              createNewFolder(uri);
            }
          }}
        />
      )}
      {isCreatingNewFile && (
        <Input
          placeholder="file name"
          autoFocus
          variant="bordered"
          size="sm"
          value={fileNameInputValue}
          onValueChange={setFileNameInputValue}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const uri = folderUri + "/" + fileNameInputValue;
              createNewFile(uri);
            }
          }}
          onFocusChange={(isFocused) => {
            if (!isFocused) {
              const uri = folderUri + "/" + fileNameInputValue;
              createNewFile(uri);
            }
          }}
        />
      )}
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

  const rootGroupRef = useRef<TreeViewGroupRef | null>(null);

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

  // Reset root group ref when there are other nodes selected
  useEffect(() => {
    const selectedNodes =
      editorContext?.editorStates.explorerSelectedNodeRefs ?? [];

    if (selectedNodes.length > 0) {
      rootGroupRef.current?.cancelCreating();
    }
  }, [editorContext?.editorStates.explorerSelectedNodeRefs]);

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

  function startCreatingNewFolder() {
    const selectedNodes =
      editorContext?.editorStates.explorerSelectedNodeRefs ?? [];

    // Use the outer most selected tree view group
    if (selectedNodes.length === 0) {
      rootGroupRef.current?.startCreatingNewFolder();
      return;
    } else if (selectedNodes.length === 1) {
      const node = selectedNodes[0].current;

      if (node?.isFolder()) {
        const childGroup = node?.getChildGroupRef();
        childGroup?.startCreatingNewFolder();
        return;
      }

      // If the selected node is a file, create a new folder in the same folder
      const parentGroup = node?.getParentGroupRef();
      parentGroup?.startCreatingNewFolder();
      return;
    }

    toast.error("Please select only one folder to create a new folder inside.");
    return;
  }

  function startCreatingNewFile() {
    const selectedNodes =
      editorContext?.editorStates.explorerSelectedNodeRefs ?? [];

    // Use the outer most selected tree view group
    if (selectedNodes.length === 0) {
      rootGroupRef.current?.startCreatingNewFile();
      return;
    } else if (selectedNodes.length === 1) {
      const node = selectedNodes[0].current;

      if (node?.isFolder()) {
        const childGroup = node?.getChildGroupRef();
        childGroup?.startCreatingNewFile();
        return;
      }

      // If the selected node is a file, create a new file in the same folder
      const parentGroup = node?.getParentGroupRef();
      parentGroup?.startCreatingNewFile();
      return;
    }

    toast.error("Please select only one folder to create a new file inside.");
    return;
  }

  // Choose project home path
  if (!editorContext?.persistSettings?.projectHomePath) {
    return (
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
    );
  }

  // Browse inside a project
  if (editorContext?.editorStates.project) {
    return (
      <div className="relative h-full w-full bg-content2 px-4 py-2">
        {editorContext.editorStates.projectContent?.length === 0 && (
          <div className="pointer-events-none absolute left-0 top-0 m-0 flex h-full w-full flex-col items-center justify-center pb-16">
            <p>Empty content. Create a new file to get started.</p>
          </div>
        )}
        <div className="flex h-full w-full flex-col space-y-2">
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
          <div className="overflow-y-auto">
            <TreeViewGroup
              ref={rootGroupRef}
              objects={editorContext.editorStates.projectContent ?? []}
              viewFile={viewFile}
              folderUri={
                editorContext.persistSettings?.projectHomePath +
                "/" +
                editorContext.editorStates.project
              }
              platformApi={platformApi}
            />
          </div>
        </div>
      </div>
    );
  }
  // Pick project
  else {
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
}
