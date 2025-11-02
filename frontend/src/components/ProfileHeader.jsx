import { LogOutIcon, User } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "./ui/button";

const ProfileHeader = () => {
  const { logout, authUser } = useAuthStore();

  if (!authUser) return null;

  return (
    <div className="p-6 border-b border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border border-border">
            <User className="w-8 h-8 text-primary" />
          </div>

          <div>
            <h3 className="text-foreground font-medium text-base max-w-[180px] truncate">
              {authUser.username}
            </h3>

            <p className="text-muted-foreground text-xs">Online</p>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <Button
            variant={"outline"}
            className="cursor-pointer text-primary transition-colors"
            onClick={logout}
          >
            <LogOutIcon className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
export default ProfileHeader;
