const UsersLoadingSkeleton = () => {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="p-4 rounded-lg animate-pulse bg-muted/30 border border-border"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-muted"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 rounded w-3/4 bg-muted-foreground/20"></div>
              <div className="h-3 rounded w-1/2 bg-muted-foreground/10"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
export default UsersLoadingSkeleton;
