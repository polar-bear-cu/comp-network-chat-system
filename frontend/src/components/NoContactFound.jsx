import { UserCircle } from "lucide-react";

const NoContactFound = () => {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
      <div className="w-16 h-16 rounded-full flex items-center justify-center bg-primary/10 text-primary">
        <UserCircle className="w-8 h-8" />
      </div>
      <div>
        <h4 className="font-medium mb-1 text-foreground/90">No users yet</h4>
        <p className="text-sm text-muted-foreground px-6">
          Please check back later.
        </p>
      </div>
    </div>
  );
};
export default NoContactFound;
