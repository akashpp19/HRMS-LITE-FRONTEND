const variants = {
  present: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  absent: 'bg-red-50 text-red-700 border border-red-200',
  late: 'bg-amber-50 text-amber-700 border border-amber-200',
  'half-day': 'bg-orange-50 text-orange-700 border border-orange-200',
  active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  inactive: 'bg-gray-50 text-gray-500 border border-gray-200',
  pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
};

const dotColors = {
  present: 'bg-emerald-500',
  absent: 'bg-red-500',
  late: 'bg-amber-500',
  'half-day': 'bg-orange-500',
  active: 'bg-emerald-500',
  inactive: 'bg-gray-400',
  pending: 'bg-yellow-500',
  approved: 'bg-emerald-500',
  rejected: 'bg-red-500',
};

export default function Badge({ status, showDot = true }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        variants[status] || variants.active
      }`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[status] || dotColors.active}`} />
      )}
      {label}
    </span>
  );
}
