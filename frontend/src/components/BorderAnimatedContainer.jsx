const BorderAnimatedContainer = ({ children }) => {
  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-r from-cyan-500 via-slate-600 to-cyan-300 animate-spin-slow rounded-2xl p-0.5">
        <div className="w-full h-full bg-background rounded-2xl flex overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BorderAnimatedContainer;
