export default function Avatar({ firstName, lastName, size = 'md' }) {
  const initial = (firstName || '?')[0].toUpperCase();
  const colors = [
    'bg-indigo-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-cyan-500',
    'bg-violet-500',
    'bg-teal-500',
    'bg-pink-500',
  ];
  const colorIndex =
    ((firstName || '').charCodeAt(0) + (lastName || '').charCodeAt(0)) % colors.length;

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <div
      className={`${sizeClasses[size]} ${colors[colorIndex]} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}
    >
      {initial}
    </div>
  );
}
