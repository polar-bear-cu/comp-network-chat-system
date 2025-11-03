import ActiveTabSwitch from "@/components/ActiveTabSwitch";
import BorderAnimatedContainer from "@/components/BorderAnimatedContainer";
import ChatContainer from "@/components/ChatContainer";
import ChatsList from "@/components/ChatsList";
import ContactList from "@/components/ContactList";
import NoConversationPlaceholder from "@/components/NoConversationPlaceholder";
import ProfileHeader from "@/components/ProfileHeader";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLoader from "./PageLoader";
import GroupList from "@/components/GroupList";
import { useGroupStore } from "@/store/useGroupStore";
import CreateGroupPopup from "@/components/CreateGroupPopup";
import GroupChatContainer from "@/components/GroupChatContainer";

const ChatPage = () => {
  const navigate = useNavigate();
  const { authUser, isCheckingAuth, checkAuth } = useAuthStore();
  const { activeTab, selectedUser, subscribeToUsers, unsubscribeFromUsers } =
    useChatStore();
  const {
    openCreateGroupPopup,
    selectedGroup,
    subscribeToGroups,
    unsubscribeFromGroups,
  } = useGroupStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authUser) navigate("/login");
  }, [authUser, navigate]);

  useEffect(() => {
    if (authUser) {
      subscribeToGroups();
      subscribeToUsers();
    }
    return () => {
      unsubscribeFromGroups();
      unsubscribeFromUsers();
    };
  }, [
    authUser,
    subscribeToGroups,
    unsubscribeFromGroups,
    subscribeToUsers,
    unsubscribeFromUsers,
  ]);

  if (isCheckingAuth) return <PageLoader />;

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-primary to-secondary flex justify-center items-center">
      <div className="relative w-full max-w-7xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden">
        <BorderAnimatedContainer>
          {/* Left Panel */}
          <div className="w-100 bg-sidebar/50 backdrop-blur-sm flex flex-col">
            <ProfileHeader />
            <ActiveTabSwitch />

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {activeTab === "chats" ? (
                <ChatsList />
              ) : activeTab === "contacts" ? (
                <ContactList />
              ) : activeTab === "groups" ? (
                <GroupList />
              ) : null}
            </div>
          </div>

          {/* Right Panel */}
          <div className="flex-1 flex flex-col bg-card/50 backdrop-blur-sm">
            {authUser && selectedUser ? (
              <ChatContainer />
            ) : authUser && selectedGroup ? (
              <GroupChatContainer />
            ) : (
              <NoConversationPlaceholder />
            )}
          </div>
        </BorderAnimatedContainer>
      </div>

      {openCreateGroupPopup && <CreateGroupPopup />}
    </div>
  );
};

export default ChatPage;
