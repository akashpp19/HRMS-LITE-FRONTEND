export default function StatCard({ icon: Icon, value, label, color = 'primary', trend }) {
  const colorMap = {
    primary: { gradient: 'from-violet-500 to-purple-600', iconBg: 'bg-violet-100', icon: 'text-violet-600', text: 'text-violet-600' },
    success: { gradient: 'from-emerald-500 to-teal-600', iconBg: 'bg-emerald-100', icon: 'text-emerald-600', text: 'text-emerald-600' },
    danger:  { gradient: 'from-red-500 to-rose-600', iconBg: 'bg-red-100', icon: 'text-red-600', text: 'text-red-600' },
    warning: { gradient: 'from-amber-500 to-yellow-600', iconBg: 'bg-amber-100', icon: 'text-amber-600', text: 'text-amber-600' },
    info:    { gradient: 'from-blue-500 to-indigo-600', iconBg: 'bg-blue-100', icon: 'text-blue-600', text: 'text-blue-600' },
    orange:  { gradient: 'from-orange-500 to-amber-600', iconBg: 'bg-orange-100', icon: 'text-orange-600', text: 'text-orange-600' },
  };

  const c = colorMap[color] || colorMap.primary;

  return (
    <div className="card p-5 hover:-translate-y-0.5 group">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${c.iconBg} transition-transform group-hover:scale-110`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
          <p className={`text-xs font-semibold mt-1 ${c.text} uppercase tracking-wider`}>{label}</p>
        </div>
      </div>
      {trend && (
        <div className={`mt-3 pt-3 border-t border-gray-100 text-xs font-medium ${trend > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
        </div>
      )}
    </div>
  );
}
