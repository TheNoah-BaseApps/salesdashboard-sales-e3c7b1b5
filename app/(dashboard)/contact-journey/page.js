'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/LoadingSpinner';
import ContactTimeline from '@/components/ContactTimeline';
import { Search } from 'lucide-react';

export default function ContactJourneyPage() {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [journey, setJourney] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/analytics/contacts');
      
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }

      const result = await response.json();
      setContacts(result.data || []);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Failed to load contact data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchContactJourney = async (contact) => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/analytics/contacts?contact=${encodeURIComponent(contact)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch contact journey');
      }

      const result = await response.json();
      setJourney(result.data);
      setSelectedContact(contact);
    } catch (err) {
      console.error('Error fetching contact journey:', err);
      setError('Failed to load contact journey. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !contacts.length) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Contact Journey</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Contacts</CardTitle>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact, index) => (
                  <Button
                    key={index}
                    variant={selectedContact === contact.contact ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => fetchContactJourney(contact.contact)}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{contact.contact}</span>
                      <span className="text-xs text-gray-500">
                        {contact.websiteVisits} website | {contact.storeVisits} store
                      </span>
                    </div>
                  </Button>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No contacts found</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedContact ? `Journey: ${selectedContact}` : 'Select a Contact'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : journey ? (
              <ContactTimeline journey={journey} />
            ) : (
              <p className="text-gray-500 text-center py-8">
                Select a contact to view their journey
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}