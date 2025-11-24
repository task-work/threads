export default function Loading() {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full 
        border-4 border-white/30 border-t-white" />
    </div>
  );
}