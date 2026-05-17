import { Users, TrendingUp, Target, XCircle } from "lucide-react";
import { StatsData } from "../../types";

interface StatsCardsProps {
  stats?: StatsData;
  isLoading?: boolean;
}

const STATUS_META = [
  { key: "New", icon: Users, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400" },
  { key: "Contacted", icon: TrendingUp, color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400" },
  { key: "Qualified", icon: Target, color: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400" },
  { key: "Lost", icon: XCircle, color: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400" },
];

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 animate-pulse h-24" />
        ))}
      </div>
    );
  }

  const getCount = (key: string) =>
    stats?.statusStats.find((s) => s._id === key)?.count || 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 col-span-2 lg:col-span-1">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Leads</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.totalLeads || 0}</p>
      </div>
      {STATUS_META.map(({ key, icon: Icon, color }) => (
        <div key={key} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">{key}</p>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{getCount(key)}</p>
        </div>
      ))}
    </div>
  );
}
