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

export default function StoreVisitsPage() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ startDate: '', endDate: '', location: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    owner_contact: '',
    number_of_visits: 1,
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

      const response = await fetch('/api/store-visits');
      
      if (!response.ok) {
        throw new Error('Failed to fetch store visits');
      }

      const result = await response.json();
      setData(result.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load store visits. Please try again.');
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
      const response = await fetch('/api/store-visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        setToast({ type: 'error', message: result.error || 'Failed to add store visit' });
        return;
      }

      setToast({ type: 'success', message: 'Store visit added successfully' });
      setShowAddModal(false);
      setFormData({
        owner_contact: '',
        number_of_visits: 1,
        location: '',
        time: '',
        date: ''
      });
      fetchData();
    } catch (err) {
      console.error('Error adding store visit:', err);
      setToast({ type: 'error', message: 'An error occurred' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this store visit?')) return;

    try {
      const response = await fetch(`/api/store-visits/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      setToast({ type: 'success', message: 'Store visit deleted successfully' });
      fetchData();
    } catch (err) {
      console.error('Error deleting store visit:', err);
      setToast({ type: 'error', message: 'Failed to delete store visit' });
    }
  };

  const columns = [
    { key: 'owner_contact', label: 'Contact' },
    { key: 'number_of_visits', label: 'Visits' },
    { key: 'location', label: 'Store Location' },
    { key: 'date', label: 'Date' },
    { key: 'time', label: 'Time' }
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Store Visits</h1>
        <div className="flex gap-3">
          <ExportButton workflow="store-visits" />
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Visit
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
            <DialogTitle>Add Store Visit</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="owner_contact">Owner Contact*</Label>
                <Input
                  id="owner_contact"
                  value={formData.owner_contact}
                  onChange={(e) => setFormData({ ...formData, owner_contact: e.target.value })}
                  placeholder="contact@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="number_of_visits">Number of Visits*</Label>
                <Input
                  id="number_of_visits"
                  type="number"
                  min="1"
                  value={formData.number_of_visits}
                  onChange={(e) => setFormData({ ...formData, number_of_visits: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="location">Store Location*</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Main Street Store, Downtown"
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
              <Button type="submit">Add Store Visit</Button>
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