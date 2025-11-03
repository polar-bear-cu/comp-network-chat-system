import { useEffect } from "react";
import { useGroupStore } from "@/store/useGroupStore";
import NoGroupFound from "./NoGroupFound";
import UsersLoadingSkeleton from "./UserLoadingSkeleton";
import { Check, Users } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

const GroupList = () => {
  const { authUser } = useAuthStore();
  const { getAllGroups, allGroups, setSelectedGroup, isGroupsLoading } =
    useGroupStore();

  useEffect(() => {
    getAllGroups();
  }, [getAllGroups]);

  if (isGroupsLoading) return <UsersLoadingSkeleton />;

  if (!Array.isArray(allGroups) || allGroups.length === 0)
    return <NoGroupFound />;

  const isMember = (group) => {
    return group.members?.some((member) => member._id === authUser?._id);
  };

  return (
    <>
      {[...allGroups].reverse().map((group) => {
        const memberStatus = isMember(group);

        return (
          <div
            key={group._id}
            className="p-4 rounded-lg cursor-pointer bg-muted/30 border border-border hover:bg-muted/50 transition-colors"
            onClick={() => setSelectedGroup(group)}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full relative bg-muted flex items-center justify-center border border-border">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <h4 className="font-medium truncate text-foreground/90">
                    {group.name}
                  </h4>
                  {memberStatus && (
                    <Check className="w-4 h-4 text-primary shrink-0" />
                  )}
                </div>
                <p className="text-sm truncate text-foreground/60">
                  By {group.owner.username}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default GroupList;
