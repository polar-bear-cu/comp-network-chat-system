const MessagesLoadingSkeleton = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className={`flex ${
            index % 2 === 0 ? "justify-start" : "justify-end"
          } animate-pulse`}
        >
          <div className="bg-card border border-border w-32 h-6 rounded-lg" />
        </div>
      ))}
    </div>
  );
};

export default MessagesLoadingSkeleton;
