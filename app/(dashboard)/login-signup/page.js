'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DataTable from '@/components/DataTable';
import FilterBar from '@/components/FilterBar';
import ExportButton from '@/components/ExportButton';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginSignupPage() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ startDate: '', endDate: '', location: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    location: '',
    time: '',
    date: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, data]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/login-signup');
      
      if (!response.ok) {
        throw new Error('Failed to fetch login/signup events');
      }

      const result = await response.json();
      setData(result.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load login/signup events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...data];

    if (filters.startDate) {
      filtered = filtered.filter(item => item.date >= filters.startDate);
    }

    if (filters.endDate) {
      filtered = filtered.filter(item => item.date <= filters.endDate);
    }

    if (filters.location) {
      filtered = filtered.filter(item =>
        item.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    setFilteredData(filtered);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/login-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        setToast({ type: 'error', message: result.error || 'Failed to add login/signup event' });
        return;
      }

      setToast({ type: 'success', message: 'Login/signup event added successfully' });
      setShowAddModal(false);
      setFormData({
        username: '',
        email: '',
        location: '',
        time: '',
        date: ''
      });
      fetchData();
    } catch (err) {
      console.error('Error adding login/signup event:', err);
      setToast({ type: 'error', message: 'An error occurred' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this login/signup event?')) return;

    try {
      const response = await fetch(`/api/login-signup/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      setToast({ type: 'success', message: 'Login/signup event deleted successfully' });
      fetchData();
    } catch (err) {
      console.error('Error deleting login/signup event:', err);
      setToast({ type: 'error', message: 'Failed to delete login/signup event' });
    }
  };

  const columns = [
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email' },
    { key: 'location', label: 'Location' },
    { key: 'date', label: 'Date' },
    { key: 'time', label: 'Time' }
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Login & Signup Events</h1>
        <div className="flex gap-3">
          <ExportButton workflow="login-signup" />
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <FilterBar onFilterChange={handleFilterChange} />

      <DataTable
        data={filteredData}
        columns={columns}
        onDelete={handleDelete}
      />

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Login/Signup Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username*</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="johndoe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email*</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="location">Location*</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="San Francisco, USA"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date*</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time*</Label>
                <Input
                  id="time"
                  type="time"
                  step="1"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Event</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}