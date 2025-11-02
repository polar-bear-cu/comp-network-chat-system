import { useChatStore } from "@/store/useChatStore";
import NoGroupFound from "./NoGroupFound";
import { useEffect } from "react";
import UsersLoadingSkeleton from "./UserLoadingSkeleton";
import { useGroupStore } from "@/store/useGroupStore";

const GroupList = () => {
  const { isUsersLoading } = useChatStore();
  const { getAllGroups, allGroups, setSelectedGroup } = useGroupStore();

  useEffect(() => {
    getAllGroups();
  }, [getAllGroups]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  if (!Array.isArray(allGroups) || allGroups.length === 0)
    return <NoGroupFound />;

  return (
    <>
      {allGroups.map((group) => {
        return (
          <div
            key={group._id}
            className="p-4 rounded-lg cursor-pointer bg-muted/30 border border-border hover:bg-muted/50 transition-colors"
            onClick={() => setSelectedGroup(group)}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full relative bg-muted flex items-center justify-center border border-border">
                <User className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-medium truncate text-foreground/90">
                {group.name}
              </h4>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default GroupList;
