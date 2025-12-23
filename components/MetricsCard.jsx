import { Card, CardContent } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';

export default function MetricsCard({ title, value, icon, iconColor, bgColor }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">
              {typeof value === 'number' ? formatNumber(value) : value}
            </p>
          </div>
          <div className={`p-3 rounded-lg ${bgColor}`}>
            <div className={iconColor}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}