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

  return (
    <>
      {allContacts.reverse().map((contact) => {
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
      })}
    </>
  );
};

export default ContactList;
