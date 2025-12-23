'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingSpinner from '@/components/LoadingSpinner';
import FunnelChart from '@/components/FunnelChart';
import DateRangePicker from '@/components/DateRangePicker';
import { TrendingUp, TrendingDown, Users } from 'lucide-react';

export default function FunnelAnalyticsPage() {
  const [funnelData, setFunnelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    fetchFunnelData();
  }, [dateRange]);

  const fetchFunnelData = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const response = await fetch(`/api/analytics/funnel?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch funnel data');
      }

      const result = await response.json();
      setFunnelData(result.data);
    } catch (err) {
      console.error('Error fetching funnel data:', err);
      setError('Failed to load funnel analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
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
        <h1 className="text-3xl font-bold text-gray-900">Funnel Analytics</h1>
        <DateRangePicker onDateRangeChange={handleDateRangeChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Website → Store</CardTitle>
            {funnelData?.stages[1]?.conversionFromPrevious > 10 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {funnelData?.stages[1]?.conversionFromPrevious || 0}%
            </div>
            <p className="text-xs text-gray-500 mt-1">Conversion Rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Store → Signup</CardTitle>
            {funnelData?.stages[2]?.conversionFromPrevious > 20 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {funnelData?.stages[2]?.conversionFromPrevious || 0}%
            </div>
            <p className="text-xs text-gray-500 mt-1">Conversion Rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Overall Conversion</CardTitle>
            <Users className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {funnelData?.overall?.overallConversionRate || 0}%
            </div>
            <p className="text-xs text-gray-500 mt-1">End-to-End</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          {funnelData ? (
            <FunnelChart data={funnelData} />
          ) : (
            <p className="text-gray-500 text-center py-8">No funnel data available</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stage Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {funnelData?.stages?.map((stage, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{stage.name}</h3>
                  <span className="text-2xl font-bold text-indigo-600">{stage.count}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Percentage of Total:</span>
                    <span className="ml-2 font-medium">{stage.percentage}%</span>
                  </div>
                  {stage.conversionFromPrevious !== undefined && (
                    <div>
                      <span className="text-gray-600">Conversion from Previous:</span>
                      <span className="ml-2 font-medium">{stage.conversionFromPrevious}%</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}