export default function SkeletonCard() {
  return (
    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-slate-800/50 border border-white/5">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      
      <div className="absolute bottom-3 left-3 right-3 h-4 bg-white/10 rounded-md" />
    </div>
  );
}