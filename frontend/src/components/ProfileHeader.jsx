import { LogOut, Plus, User } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "./ui/button";
import { useGroupStore } from "@/store/useGroupStore";

const ProfileHeader = () => {
  const { logout, authUser } = useAuthStore();
  const { setOpenCreateGroupPopup } = useGroupStore();

  if (!authUser) return null;

  return (
    <div className="p-5 border-b border-border max-h-[84px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-between gap-4">
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
            className="text-primary transition-colors"
            onClick={() => {
              setOpenCreateGroupPopup(true);
            }}
          >
            <Plus className="w-5 h-5" />
          </Button>
          <Button
            variant={"outline"}
            className="text-primary transition-colors"
            onClick={logout}
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
export default ProfileHeader;
