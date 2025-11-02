import { useChatStore } from "@/store/useChatStore";
import { useEffect } from "react";
import UsersLoadingSkeleton from "./UserLoadingSkeleton";
import { User } from "lucide-react";

const ContactList = () => {
  const { getAllContacts, allContacts, setSelectedUser, isUsersLoading } =
    useChatStore();

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  if (!Array.isArray(allContacts) || allContacts.length === 0) {
    return (
      <div className="text-foreground text-center py-4">No contacts found</div>
    );
  }

  return (
    <>
      {allContacts.map((contact) => (
        <div
          key={contact._id}
          className="p-4 rounded-lg cursor-pointer bg-muted/30 border border-border hover:bg-muted/50 transition-colors"
          onClick={() => setSelectedUser(contact)}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border border-border">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h4 className="font-medium truncate text-foreground/90">
              {contact.username}
            </h4>
          </div>
        </div>
      ))}
    </>
  );
};

export default ContactList;
