import MessageInput from "./MessageInput";
import { useGroupStore } from "@/store/useGroupStore";
import { useAuthStore } from "@/store/useAuthStore";
import NotMemberPlaceHolder from "./NotMemberPlaceholder";
import GroupChatHeader from "./GroupChatHeader";

const GroupChatContainer = () => {
  const { selectedGroup } = useGroupStore();
  const { authUser } = useAuthStore();

  if (!selectedGroup) return null;

  const isMember = selectedGroup.members?.some((m) => m._id === authUser?._id);

  return (
    <div className="flex flex-col h-full">
      <GroupChatHeader />
      {!isMember ? (
        <NotMemberPlaceHolder />
      ) : (
        <div className="flex flex-col flex-1">
          <div className="flex-1"></div>

          <MessageInput />
        </div>
      )}
    </div>
  );
};

export default GroupChatContainer;
