import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGroupStore } from "@/store/useGroupStore";

const NotMemberPlaceHolder = () => {
  const { selectedGroup, joinGroup } = useGroupStore();
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 text-foreground">
      {/* Icon Circle */}
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5 bg-linear-to-br from-accent/20 to-accent-foreground/10">
        <Users className="w-8 h-8 text-accent-foreground" />
      </div>

      {/* Heading */}
      <h3 className="text-lg font-medium mb-3 text-foreground">
        You're not a member of{" "}
        <span className="font-semibold">{selectedGroup.name}</span>
      </h3>

      {/* Description */}
      <div className="flex flex-col space-y-3 max-w-md mb-5">
        <p className="text-sm text-muted-foreground">
          Join this group to start chatting and see group messages.
        </p>
        <div className="h-px w-32 mx-auto bg-linear-to-r from-transparent via-accent/30 to-transparent"></div>
      </div>

      {/* Join button */}
      <Button
        className="mt-2"
        onClick={() => {
          joinGroup(selectedGroup._id);
        }}
      >
        Join Group
      </Button>
    </div>
  );
};

export default NotMemberPlaceHolder;
