interface CompletedBadgeProps {
  isCompleted: boolean;
  className?: string;
}

export default function CompletedBadge({ isCompleted, className = '' }: CompletedBadgeProps) {
  if (!isCompleted) return null;
  
  return (
    <span className={`ml-1 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm ${className}`}>
      Đã hoàn thành
    </span>
  );
}
