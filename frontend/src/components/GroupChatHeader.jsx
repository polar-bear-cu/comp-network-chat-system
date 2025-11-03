import { useEffect, useState } from "react";
import { useGroupStore } from "@/store/useGroupStore";
import { LogOut, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/useAuthStore";

const GroupChatHeader = () => {
  const { selectedGroup, setSelectedGroup, leaveGroup } = useGroupStore();
  const { authUser } = useAuthStore();
  const [isLeaving, setLeaving] = useState(false);
  const [errorText, setErrorText] = useState("");

  if (!selectedGroup) return null;

  const members = selectedGroup?.members || [];
  const sortedMembers = [...members].sort((a, b) => {
    if (a._id === selectedGroup.ownerId) return -1;
    if (b._id === selectedGroup.ownerId) return 1;
    return 0;
  });

  const isOwner = selectedGroup.owner._id === authUser._id;
  const isMember = members.some((m) => m._id === authUser._id);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") setSelectedGroup(null);
    };
    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedGroup]);

  async function handleLeaveGroup() {
    if (!selectedGroup) return;
    setErrorText("");
    setLeaving(true);

    const res = await leaveGroup(selectedGroup._id);
    if (!res.success) {
      setErrorText(res.message);
    }

    setLeaving(false);
  }

  return (
    <div className="flex justify-between items-center border-b max-h-[84px] px-6 flex-1 bg-background border-border text-foreground">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center border border-border relative">
          <Users className="w-7 h-7 text-primary" />
        </div>

        <div>
          <h3 className="text-foreground font-semibold">
            {selectedGroup.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {members.length} member{members.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Members Popup */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary" size="sm">
              View Members
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Group Members</DialogTitle>
            </DialogHeader>

            <div className="space-y-2">
              {sortedMembers.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted transition"
                >
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm font-bold text-accent-foreground">
                    {member.username[0].toUpperCase()}
                  </div>
                  <p className="text-sm">
                    {member.username}
                    {member._id === selectedGroup.owner._id && " (Owner)"}
                    {member._id === authUser._id && " (Me)"}
                  </p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {isMember && !isOwner && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <LogOut className="w-4 h-4" />
                Leave
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Leave Group</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to leave{" "}
                  <strong>{selectedGroup.name}</strong>? You won't be able to
                  see group messages anymore.
                </p>

                {errorText && (
                  <p className="text-sm text-destructive">{errorText}</p>
                )}

                <div className="flex justify-end gap-2">
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={isLeaving}
                      onClick={() => {
                        setErrorText("");
                      }}
                    >
                      Cancel
                    </Button>
                  </DialogTrigger>
                  <Button
                    variant="destructive"
                    onClick={handleLeaveGroup}
                    disabled={isLeaving}
                  >
                    {isLeaving ? "Leaving..." : "Leave Group"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        <button onClick={() => setSelectedGroup(null)}>
          <X className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer" />
        </button>
      </div>
    </div>
  );
};

export default GroupChatHeader;
