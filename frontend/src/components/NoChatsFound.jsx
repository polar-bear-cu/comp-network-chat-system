import { useChatStore } from "@/store/useChatStore";
import { MessageCircle } from "lucide-react";
import { Button } from "./ui/button";

const NoChatsFound = () => {
  const { setActiveTab } = useChatStore();

  return (
    <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
      <div className="w-16 h-16 rounded-full flex items-center justify-center bg-primary/10 text-primary">
        <MessageCircle className="w-8 h-8" />
      </div>
      <div>
        <h4 className="font-medium mb-1 text-foreground/90">
          No conversations yet
        </h4>
        <p className="text-sm text-muted-foreground px-6">
          Start a new chat by selecting a contact from the contacts tab
        </p>
      </div>
      <Button
        onClick={() => setActiveTab("contacts")}
        className="px-4 py-2 text-sm rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
      >
        Find contacts
      </Button>
    </div>
  );
};
export default NoChatsFound;
