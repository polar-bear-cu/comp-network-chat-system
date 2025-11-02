import { useGroupStore } from "@/store/useGroupStore";
import { useState } from "react";
import { Button } from "./ui/button";

const CreateGroupPopup = () => {
  const [groupName, setGroupName] = useState("");
  const { setOpenCreateGroupPopup } = useGroupStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (groupName.trim()) {
      alert(`Create group: ${groupName}`);
      setOpenCreateGroupPopup(false);
      setGroupName("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setOpenCreateGroupPopup(false)}
      />

      {/* Modal */}
      <div className="relative w-80 rounded-xl bg-card border border-border shadow-xl p-6 animate-in zoom-in-105 fade-in duration-200 z-10">
        <h3 className="text-lg font-semibold text-center mb-4">
          Create a Group
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            className="w-full border border-input bg-background rounded-md p-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpenCreateGroupPopup(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupPopup;
