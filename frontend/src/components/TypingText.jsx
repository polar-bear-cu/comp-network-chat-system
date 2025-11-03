const TypingText = ({ username }) => {
  return (
    <div className="flex items-center gap-2 px-3 py-1">
      <span className="text-sm text-muted-foreground">
        {username ? `${username} typing...` : "typing..."}
      </span>
    </div>
  );
};

export default TypingText;
