'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import MetricsCard from '@/components/MetricsCard';
import FunnelChart from '@/components/FunnelChart';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Users, MousePointer, Store, UserPlus, TrendingUp, TrendingDown } from 'lucide-react';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [funnelData, setFunnelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [funnelResponse] = await Promise.all([
        fetch('/api/analytics/funnel')
      ]);

      if (!funnelResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const funnelResult = await funnelResponse.json();
      
      setFunnelData(funnelResult.data);
      setMetrics(funnelResult.data.overall);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="Total Website Visits"
          value={metrics?.totalWebsiteVisits || 0}
          icon={<MousePointer className="h-5 w-5" />}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
        />
        <MetricsCard
          title="Total Store Visits"
          value={metrics?.totalStoreVisits || 0}
          icon={<Store className="h-5 w-5" />}
          iconColor="text-green-600"
          bgColor="bg-green-50"
        />
        <MetricsCard
          title="Total Signups"
          value={metrics?.totalSignups || 0}
          icon={<UserPlus className="h-5 w-5" />}
          iconColor="text-purple-600"
          bgColor="bg-purple-50"
        />
        <MetricsCard
          title="Conversion Rate"
          value={`${metrics?.overallConversionRate || 0}%`}
          icon={metrics?.overallConversionRate > 5 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
          iconColor={metrics?.overallConversionRate > 5 ? "text-green-600" : "text-red-600"}
          bgColor={metrics?.overallConversionRate > 5 ? "bg-green-50" : "bg-red-50"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          {funnelData ? (
            <FunnelChart data={funnelData} />
          ) : (
            <p className="text-gray-500 text-center py-8">No funnel data available</p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-sm font-medium text-gray-600">Website → Store</span>
                <span className="text-lg font-bold text-indigo-600">
                  {funnelData?.stages[1]?.conversionFromPrevious || 0}%
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-sm font-medium text-gray-600">Store → Signup</span>
                <span className="text-lg font-bold text-indigo-600">
                  {funnelData?.stages[2]?.conversionFromPrevious || 0}%
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm font-medium text-gray-600">Overall Conversion</span>
                <span className="text-lg font-bold text-indigo-600">
                  {metrics?.overallConversionRate || 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Funnel Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {funnelData?.stages?.map((stage, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{stage.name}</span>
                    <span className="text-sm text-gray-500">{stage.count} ({stage.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full"
                      style={{ width: `${stage.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}