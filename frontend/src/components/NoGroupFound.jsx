import { Users } from "lucide-react";
import { Button } from "./ui/button";
import { useGroupStore } from "@/store/useGroupStore";

const NoGroupFound = () => {
  const { setOpenCreateGroupPopup } = useGroupStore();

  return (
    <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
      <div className="w-16 h-16 rounded-full flex items-center justify-center bg-primary/10 text-primary">
        <Users className="w-8 h-8" />
      </div>
      <div>
        <h4 className="font-medium mb-1 text-foreground/90">No groups yet</h4>
        <p className="text-sm text-muted-foreground px-6">
          You can create a new group by yourself
        </p>
      </div>
      <Button
        onClick={() => {
          setOpenCreateGroupPopup(true);
        }}
        className="px-4 py-2 text-sm rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
      >
        Create groups
      </Button>
    </div>
  );
};
export default NoGroupFound;
