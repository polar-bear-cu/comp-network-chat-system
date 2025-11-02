import { useChatStore } from "@/store/useChatStore";
import { Button } from "./ui/button";

const ActiveTabSwitch = () => {
  const { activeTab, setActiveTab } = useChatStore();

  return (
    <div className="flex gap-2 p-2 m-2 bg-transparent">
      <Button
        variant={"outline"}
        onClick={() => setActiveTab("chats")}
        className={`px-4 py-2 cursor-pointer rounded-lg border transition-all duration-200 text-sm font-medium
${
  activeTab === "chats"
    ? "bg-primary/20 text-primary border-primary/50"
    : "text-muted-foreground border-border hover:bg-muted/30"
}`}
      >
        Chats
      </Button>

      <Button
        variant={"outline"}
        onClick={() => setActiveTab("contacts")}
        className={`px-4 py-2 cursor-pointer rounded-lg border transition-all duration-200 text-sm font-medium
${
  activeTab === "contacts"
    ? "bg-primary/20 text-primary border-primary/50"
    : "text-muted-foreground border-border hover:bg-muted/30"
}`}
      >
        Contacts
      </Button>
    </div>
  );
};
export default ActiveTabSwitch;
