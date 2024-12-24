import { Button, Divider, Input, Link, Textarea } from "@nextui-org/react";
import ModalWrapper from "./modal-wrapper";
import { Dispatch, SetStateAction, useState } from "react";
import { AgentConfig } from "@/lib/types";

export default function AgentConfigModal({
  isOpen,
  setIsOpen,
  setAgents,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  setAgents: Dispatch<SetStateAction<AgentConfig[]>>;
}) {
  const [name, setName] = useState<string>("");
  const [icon, setIcon] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");

  return (
    <ModalWrapper isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="flex flex-col space-y-2">
        <p className="text-center text-lg font-bold text-foreground">
          Configure New Agent
        </p>
        <p>
          Add a new agent definition by adding agent name, icon, description,
          and prompt.
        </p>

        <Input
          label="name"
          placeholder="Enter agent name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="icon"
          placeholder="Enter agent icon"
          description={
            <p>
              You can use Material Icons. See available icons at
              <Link
                href="https://marella.me/material-icons/demo/"
                target="_blank"
                className="text-xs"
              >
                &nbsp; Available Icons
              </Link>
              .
            </p>
          }
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
        />
        <Textarea
          label="description"
          placeholder="Enter agent description"
          isMultiline
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Textarea
          label="prompt"
          placeholder="Enter agent prompt"
          isMultiline
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <Button
          onPress={() => {
            const config: AgentConfig = {
              name: name,
              icon: icon === "" ? "smart_toy" : icon,
              description: description,
              prompt: prompt,
            };

            setAgents((prev) => [...prev, config]);
            setIsOpen(false);
          }}
        >
          Add Agent
        </Button>

        <Divider />
        <p>Alternatively, you can import or find agent in the marketplace.</p>
        <Button isDisabled>Import Agent (Coming Soon)</Button>
        <Button isDisabled>Marketplace (Coming Soon)</Button>
      </div>
    </ModalWrapper>
  );
}
