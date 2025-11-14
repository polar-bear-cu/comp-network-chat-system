import { useEffect, useState } from "react";
import { useGroupStore } from "@/store/useGroupStore";
import { useChatStore } from "@/store/useChatStore";
import UsersLoadingSkeleton from "./UserLoadingSkeleton";
import { Check, Users, Plus } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

const GroupList = () => {
  const { authUser } = useAuthStore();
  const { setActiveTab: setGlobalActiveTab } = useChatStore();
  const { 
    getMyGroups, 
    getAvailableGroups, 
    myGroups, 
    availableGroups, 
    setSelectedGroup, 
    isMyGroupsLoading, 
    isAvailableGroupsLoading,
    getGroupUnreadCounts,
    groupUnreadCounts,
    activeGroupTab
  } = useGroupStore();

  useEffect(() => {
    getMyGroups();
    getAvailableGroups();
    getGroupUnreadCounts();
  }, [getMyGroups, getAvailableGroups, getGroupUnreadCounts]);

  const setActiveTab = (tab) => {
    useGroupStore.setState({ activeGroupTab: tab });
  };

  const renderGroupItem = (group, showJoinButton = false) => {
    const unreadCount = groupUnreadCounts[group._id] || 0;
    
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
          <div className="flex flex-col flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <h4 className="font-medium truncate text-foreground/90">
                  {group.name}
                </h4>
                {!showJoinButton && (
                  <Check className="w-4 h-4 text-primary shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2">
                {!showJoinButton && unreadCount > 0 && (
                  <div className="bg-primary text-primary-foreground text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-2">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm truncate text-foreground/60">
              By {group.owner.username} • {group.members?.length || 0} members
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("my-groups")}
          className={`flex-1 py-2 px-4 text-sm font-medium transition-colors cursor-pointer ${
            activeGroupTab === "my-groups"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          My Groups ({myGroups.length})
        </button>
        <button
          onClick={() => setActiveTab("available")}
          className={`flex-1 py-2 px-4 text-sm font-medium transition-colors cursor-pointer ${
            activeGroupTab === "available"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Available ({availableGroups.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-3">
        {activeGroupTab === "my-groups" && (
          <>
            {isMyGroupsLoading ? (
              <UsersLoadingSkeleton />
            ) : myGroups.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No groups joined yet</p>
                <p className="text-sm text-muted-foreground/70">
                  Create a new group or join available ones!
                </p>
              </div>
            ) : (
              myGroups.map((group) => renderGroupItem(group, false))
            )}
          </>
        )}

        {activeGroupTab === "available" && (
          <>
            {isAvailableGroupsLoading ? (
              <UsersLoadingSkeleton />
            ) : availableGroups.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No available groups</p>
                <p className="text-sm text-muted-foreground/70">
                  You've joined all existing groups!
                </p>
              </div>
            ) : (
              availableGroups.map((group) => renderGroupItem(group, true))
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GroupList;
