"use client";

import { Button, Input, Switch } from "@nextui-org/react";
import ModalWrapper from "./modal-wrapper";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { usePlatformApi } from "@/lib/hooks/use-platform-api";
import { EditorContext } from "../providers/editor-context-provider";
import { ProjectInfo } from "@/lib/types";

export default function ProjectSettingsModal({
  isOpen,
  setIsOpen,
  projectInfo,
}: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  projectInfo?: ProjectInfo;
}) {
  const [projectName, setProjectName] = useState("");
  const [isUsingManagedBackup, setIsUsingManagedBackup] = useState(false);

  const { platformApi } = usePlatformApi();
  const editorContext = useContext(EditorContext);

  useEffect(() => {
    if (projectInfo) {
      setProjectName(projectInfo.name);
    }
  }, [projectInfo]);

  function handleUpdateProject() {
    if (!platformApi) {
      toast.error("Unknown platform.");
      return;
    }

    if (isUsingManagedBackup) {
      toast.error("Managed Cloud Backup is not yet implemented.");
      return;
    }

    if (projectName === "") {
      toast.error("Project Name is required.");
      return;
    }

    // Update project
    const homePath = editorContext?.persistSettings?.projectHomePath;
    if (!homePath) {
      toast.error("Project Home Path is not set.");
      return;
    }

    const oldUri = homePath + "/" + projectInfo?.name;
    const newUri = homePath + "/" + projectName;
    platformApi
      .updateProject(oldUri, newUri)
      .then(() => {
        toast.success("Project updated.");
        platformApi.listPathProjects(homePath).then((projects) => {
          editorContext?.setEditorStates((prev) => {
            return {
              ...prev,
              projectsInfo: projects,
            };
          });
        });
        setIsOpen(false);
      })
      .catch((err) => {
        toast.error("Failed to update project.");
      });
  }

  function handleCreateProject() {
    if (!platformApi) {
      toast.error("Unknown platform.");
      return;
    }

    if (isUsingManagedBackup) {
      toast.error("Managed Cloud Backup is not yet implemented.");
      return;
    }

    if (projectName === "") {
      toast.error("Project Name is required.");
      return;
    }

    // Create project
    const homePath = editorContext?.persistSettings?.projectHomePath;
    if (!homePath) {
      toast.error("Project Home Path is not set.");
      return;
    }

    const uri = homePath + "/" + projectName;
    platformApi
      .createProject(uri)
      .then(() => {
        toast.success("Project created.");
        platformApi.listPathProjects(homePath).then((projects) => {
          editorContext?.setEditorStates((prev) => {
            return {
              ...prev,
              projectsInfo: projects,
            };
          });
        });
        setIsOpen(false);
      })
      .catch((err) => {
        toast.error("Failed to create project.");
      });
  }

  return (
    <ModalWrapper isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="flex h-full w-full flex-col items-center space-y-4 p-4">
        <p>Project Settings</p>
        <Input
          label="Project Name"
          isRequired
          value={projectName}
          onValueChange={setProjectName}
        />
        <div className="w-full space-y-1">
          <p>Source Control (Optional)</p>
          <Switch
            isSelected={isUsingManagedBackup}
            onValueChange={setIsUsingManagedBackup}
          >
            {isUsingManagedBackup
              ? "Enable Managed Cloud Backup"
              : "GitHub as Source Control"}
          </Switch>
          {isUsingManagedBackup ? (
            <p className="text-xs">
              Easy to use for projects that involves multiple media or large
              files.
              <br />
              e.g. image, audio, video.
            </p>
          ) : (
            <p className="text-xs">
              Best for projects that involves code and text files only.
            </p>
          )}
        </div>
        {!isUsingManagedBackup && (
          <Input
            label="Configure GitHub Remote"
            placeholder="e.g. https://github.com/Shellishack/pulse-editor.git"
          />
        )}
        {projectInfo ? (
          <Button onPress={handleUpdateProject}>Update</Button>
        ) : (
          <Button onPress={handleCreateProject}>Create</Button>
        )}
      </div>
    </ModalWrapper>
  );
}
