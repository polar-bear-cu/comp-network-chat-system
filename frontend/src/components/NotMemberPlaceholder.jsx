import { useState } from "react";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGroupStore } from "@/store/useGroupStore";

const NotMemberPlaceholder = () => {
  const { selectedGroup, joinGroup } = useGroupStore();
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  const handleJoin = async () => {
    if (!selectedGroup) return;
    setErrorText("");
    setLoading(true);

    const res = await joinGroup(selectedGroup._id);

    if (!res.success) {
      setErrorText(res.message);
    }

    setLoading(false);
  };

  const members = selectedGroup?.members || [];
  const sortedMembers = [...members].sort((a, b) => {
    if (a._id === selectedGroup?.owner?._id) return -1;
    if (b._id === selectedGroup?.owner?._id) return 1;
    return 0;
  });

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 text-foreground max-w-md mx-auto">
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

      {/* Group Members Section */}
      {members.length > 0 && (
        <div className="w-full mb-6">
          <h4 className="text-sm font-medium text-foreground mb-3">
            Group Members ({members.length})
          </h4>
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {sortedMembers.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary border border-primary/20">
                    {member.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm text-foreground">
                      {member.username}
                      {member._id === selectedGroup?.owner?._id && (
                        <span className="ml-1 text-xs text-primary font-medium">
                          (Owner)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
