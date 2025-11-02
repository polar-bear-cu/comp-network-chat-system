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
      {contacts.map((contact) => (
        <div
          key={contact._id}
          className="p-4 rounded-lg cursor-pointer bg-muted/30 border border-border hover:bg-muted/50 transition-colors"
          onClick={() => setSelectedUser(contact)}
        >
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center border border-border">
              <User className="w-6 h-6 text-foreground/60" />
            </div>

            <h4 className="font-medium truncate text-foreground">
              {contact.username}
            </h4>
          </div>
        </div>
      ))}
    </>
  );
};

export default ContactList;
