'use client';

import { formatDateTime } from '@/lib/utils';
import { MousePointer, Store, Calendar, Clock, MapPin } from 'lucide-react';

export default function ContactTimeline({ journey }) {
  if (!journey) {
    return (
      <div className="text-center py-8 text-gray-500">
        No journey data available
      </div>
    );
  }

  const allEvents = [
    ...(journey.websiteVisits || []).map(visit => ({
      type: 'website',
      ...visit
    })),
    ...(journey.storeVisits || []).map(visit => ({
      type: 'store',
      ...visit
    }))
  ].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600">Website Visits</p>
          <p className="text-2xl font-bold text-blue-600">{journey.totalWebsiteVisits}</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-gray-600">Store Visits</p>
          <p className="text-2xl font-bold text-green-600">{journey.totalStoreVisits}</p>
        </div>
        <div className="text-center p-4 bg-indigo-50 rounded-lg">
          <p className="text-sm text-gray-600">First Contact</p>
          <p className="text-sm font-medium text-indigo-600">
            {journey.firstTouchpoint ? formatDateTime(journey.firstTouchpoint) : 'N/A'}
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        <div className="space-y-6">
          {allEvents.map((event, index) => (
            <div key={index} className="relative pl-10">
              <div className={`absolute left-0 top-2 w-8 h-8 rounded-full flex items-center justify-center ${
                event.type === 'website' ? 'bg-blue-100' : 'bg-green-100'
              }`}>
                {event.type === 'website' ? (
                  <MousePointer className="h-4 w-4 text-blue-600" />
                ) : (
                  <Store className="h-4 w-4 text-green-600" />
                )}
              </div>
              
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">
                    {event.type === 'website' ? 'Website Visit' : 'Store Visit'}
                  </h4>
                  <span className="text-xs text-gray-500">
                    {formatDateTime(event.created_at)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {event.type === 'website' && event.ip && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="font-medium">IP:</span>
                      <span>{event.ip}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-3 w-3" />
                    <span>{event.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-3 w-3" />
                    <span>{event.date}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-3 w-3" />
                    <span>{event.time}</span>
                  </div>
                  
                  {event.number_of_visits && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="font-medium">Visits:</span>
                      <span>{event.number_of_visits}</span>
                    </div>
                  )}
                  
                  {event.website_duration !== undefined && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="font-medium">Duration:</span>
                      <span>{event.website_duration}s</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {allEvents.length === 0 && (
        <p className="text-center py-8 text-gray-500">
          No touchpoints recorded for this contact
        </p>
      )}
    </div>
  );
}