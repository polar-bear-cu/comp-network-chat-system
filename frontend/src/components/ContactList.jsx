import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";
import UsersLoadingSkeleton from "./UserLoadingSkeleton";
import { User } from "lucide-react";
import NoContactFound from "./NoContactFound";

const ContactList = () => {
  const { getAllContacts, allContacts, setSelectedUser, isUsersLoading } =
    useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  if (!Array.isArray(allContacts) || allContacts.length === 0)
    return <NoContactFound />;

  // Separate online and offline users
  const onlineContacts = allContacts.filter(contact => onlineUsers.includes(contact._id));
  const offlineContacts = allContacts.filter(contact => !onlineUsers.includes(contact._id));

  // Sort each group by creation date (newest first)
  const sortedOnlineContacts = [...onlineContacts].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  const sortedOfflineContacts = [...offlineContacts].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const renderContact = (contact) => {
    const isOnline = onlineUsers.includes(contact._id);

    return (
      <div
        key={contact._id}
        className="p-4 rounded-lg cursor-pointer bg-muted/30 border border-border hover:bg-muted/50 transition-colors"
        onClick={() => setSelectedUser(contact)}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full relative bg-muted flex items-center justify-center border border-border">
            <User className="w-8 h-8 text-primary" />
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border border-background ${
                isOnline ? "bg-green-500" : "bg-gray-500"
              }`}
            />
          </div>
          <h4 className="font-medium truncate text-foreground/90">
            {contact.username}
          </h4>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Online Users Section */}
      {sortedOnlineContacts.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 px-2">
            Online ({sortedOnlineContacts.length})
          </h3>
          <div className="space-y-2">
            {sortedOnlineContacts.map(renderContact)}
          </div>
        </div>
      )}

      {/* Offline Users Section */}
      {sortedOfflineContacts.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 px-2">
            Offline ({sortedOfflineContacts.length})
          </h3>
          <div className="space-y-2">
            {sortedOfflineContacts.map(renderContact)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactList;
