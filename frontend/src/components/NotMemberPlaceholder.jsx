import { useState } from "react";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGroupStore } from "@/store/useGroupStore";

const NotMemberPlaceholder = () => {
  const { selectedGroup, joinGroup, getAllGroups, setSelectedGroup } =
    useGroupStore();
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  const handleJoin = async () => {
    if (!selectedGroup) return;
    setErrorText("");
    setLoading(true);

    const res = await joinGroup(selectedGroup._id);

    if (res.success) {
      setSelectedGroup(res.group);
    } else {
      setErrorText(res.message);
    }

    console.log("test");

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 text-foreground">
      {/* Icon Circle */}
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5 bg-linear-to-br from-accent/20 to-accent-foreground/10">
        <Users className="w-8 h-8 text-accent-foreground" />
      </div>

      {/* Heading */}
      <h3 className="text-lg font-medium mb-3 text-foreground">
        You're not a member of{" "}
        <span className="font-semibold">{selectedGroup?.name}</span>
      </h3>

      <p className="text-sm text-muted-foreground mb-5">
        Join this group to start chatting and see group messages.
      </p>

      <Button className="mt-2" onClick={handleJoin} disabled={loading}>
        {loading ? "Joining..." : "Join Group"}
      </Button>

      {errorText && (
        <p className="text-sm text-destructive mt-3">{errorText}</p>
      )}
    </div>
  );
};

export default NotMemberPlaceholder;
