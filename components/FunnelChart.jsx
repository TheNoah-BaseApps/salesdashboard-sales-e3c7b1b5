'use client';

export default function FunnelChart({ data }) {
  if (!data || !data.stages) {
    return (
      <div className="text-center py-8 text-gray-500">
        No funnel data available
      </div>
    );
  }

  const maxCount = data.stages[0]?.count || 1;

  return (
    <div className="space-y-6 py-4">
      {data.stages.map((stage, index) => {
        const widthPercent = (stage.count / maxCount) * 100;
        
        return (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">{stage.name}</span>
              <div className="flex items-center gap-4">
                <span className="text-gray-600">{stage.count} visits</span>
                {stage.conversionFromPrevious !== undefined && (
                  <span className="text-indigo-600 font-medium">
                    {stage.conversionFromPrevious}% conversion
                  </span>
                )}
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-16 bg-gray-100 rounded-lg overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-medium transition-all duration-500"
                  style={{ width: `${widthPercent}%` }}
                >
                  {widthPercent > 20 && `${stage.percentage}%`}
                </div>
              </div>
              {widthPercent <= 20 && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-700">
                  {stage.percentage}%
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}