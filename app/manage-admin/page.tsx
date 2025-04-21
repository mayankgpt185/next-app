'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Upload } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';

export default function ManageAdminPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clientId, setClientId] = useState('');
  const [address, setAddress] = useState('');
  const [dateJoined, setDateJoined] = useState('');
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [newClient, setNewClient] = useState({
    clientName: '',
    clientLogo: '',
    clientWebsite: '',
    clientDescription: ''
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  // Fetch clients for dropdown
  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };
  
  useEffect(() => {
    fetchClients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          firstName,
          lastName, 
          email, 
          password,
          clientId,
          address,
          dateJoined: dateJoined || new Date().toISOString(),
          role: 'ADMIN'
        }),
      });

      if (response.ok) {
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setClientId('');
        setAddress('');
        setDateJoined('');
        toast.success('Admin created successfully');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to create admin');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while creating admin');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    try {
      // Compress the image
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true
      };
      
      setUploadingLogo(true);
      const compressedFile = await imageCompression(file, options);

      // Create preview and store base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogoPreview(base64String);
        setLogoBase64(base64String);
        setUploadingLogo(false);
      };
      
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Error processing logo:', error);
      toast.error('Failed to process logo');
      setUploadingLogo(false);
    }
  };

  const handleAddClient = async () => {
    if (!newClient.clientName) {
      toast.error('Client name is required');
      return;
    }

    if (!logoBase64) {
      toast.error('Logo is required');
      return;
    }

    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientName: newClient.clientName,
          clientLogo: logoBase64,
          clientWebsite: newClient.clientWebsite || '',
          clientDescription: newClient.clientDescription || '',
          isActive: true
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setClients(prevClients => [...prevClients, data as typeof prevClients[0]]);
        setNewClient({
          clientName: '',
          clientLogo: '',
          clientWebsite: '',
          clientDescription: ''
        });
        setLogoPreview(null);
        setLogoBase64(null);
        setShowClientForm(false);
        toast.success('Client created successfully');
        
        // Set the newly created client as the selected client
        setClientId(data._id);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to create client');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while creating client');
    }
  };

  if (isLoading && !clients.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-base-content">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full p-6 bg-base-100 min-h-screen">
      <div className="card bg-base-200 shadow-xl max-w-4xl mx-auto">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold text-base-content mb-6">Create Admin</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Row 1: Name fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-base-content">First Name*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input input-bordered w-full bg-base-100 text-base-content"
                  placeholder="Enter First Name"
                  required
                />
              </div>
              
              {/* Last Name */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-base-content">Last Name*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input input-bordered w-full bg-base-100 text-base-content"
                  placeholder="Enter Last Name"
                  required
                />
              </div>
            </div>
            
            {/* Row 2: Email and Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-base-content">Email*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input input-bordered w-full bg-base-100 text-base-content"
                  placeholder="Enter Email"
                  required
                />
              </div>
              
              {/* Password */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-base-content">Password*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input input-bordered w-full bg-base-100 text-base-content"
                  placeholder="Enter Password"
                  required
                />
              </div>
            </div>
            
            {/* Row 3: Client and Date Joined */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Client with Add button */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-base-content">Client*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="select select-bordered flex-1 bg-base-100 text-base-content"
                    required
                  >
                    <option value="">Select Client</option>
                    {clients.map((client: any) => (
                      <option key={client._id} value={client._id}>
                        {client.clientName}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-primary btn-square"
                    onClick={() => setShowClientForm(true)}
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Date Joined */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-base-content">Date Joined</span>
                </label>
                <input
                  type="date"
                  value={dateJoined}
                  onChange={(e) => setDateJoined(e.target.value)}
                  className="input input-bordered w-full bg-base-100 text-base-content"
                />
                <p className="text-xs text-base-content/70 mt-1">If not specified, current date will be used</p>
              </div>
            </div>
            
            {/* Row 4: Address */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text text-base-content">Address</span>
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="textarea textarea-bordered w-full bg-base-100 text-base-content"
                placeholder="123 Main St, City, Country"
                rows={2}
              />
            </div>
            
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="error"
                outline
                onClick={() => router.push('/')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                outline
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Admin'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal for adding new client */}
      {showClientForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 p-8 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-6 text-base-content">Add New Client</h3>
            
            <div className="grid grid-cols-1 gap-6">
              {/* Row 1: Name and Logo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Client Name */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-base-content">Client Name*</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered bg-base-100 text-base-content"
                    value={newClient.clientName}
                    onChange={(e) => setNewClient({ ...newClient, clientName: e.target.value })}
                    placeholder="Enter Client Name"
                    required
                  />
                </div>

                {/* Logo Upload */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-base-content">Logo*</span>
                  </label>
                  
                  {/* File Input */}
                  <div className="relative group h-[42px]">
                    <div 
                      className="flex items-center justify-center w-full h-full border rounded-lg cursor-pointer bg-base-200 border-base-300 hover:bg-base-300"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2 text-base-content" />
                      <span className="text-sm">Upload</span>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                    {uploadingLogo && (
                      <div className="absolute inset-0 bg-base-300/50 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Logo Preview */}
              {logoPreview && (
                <div className="relative w-full h-32 bg-base-300 rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="max-w-full max-h-full object-contain p-2"
                  />
                </div>
              )}
              
              {/* Row 2: Website */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-base-content">Website</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered bg-base-100 text-base-content"
                  value={newClient.clientWebsite}
                  onChange={(e) => setNewClient({ ...newClient, clientWebsite: e.target.value })}
                  placeholder="Enter Website URL"
                />
              </div>

              {/* Description */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-base-content">Description</span>
                </label>
                <textarea
                  className="textarea textarea-bordered bg-base-100 text-base-content"
                  value={newClient.clientDescription}
                  onChange={(e) => setNewClient({ ...newClient, clientDescription: e.target.value })}
                  placeholder="Enter Description"
                  rows={2}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-4 mt-6">
              <Button
                type="button"
                variant="error"
                outline
                onClick={() => {
                  setShowClientForm(false);
                  setLogoPreview(null);
                  setLogoBase64(null);
                  setNewClient({
                    clientName: '',
                    clientLogo: '',
                    clientWebsite: '',
                    clientDescription: ''
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                outline
                onClick={handleAddClient}
                disabled={uploadingLogo}
              >
                {uploadingLogo ? 'Uploading...' : 'Add Client'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}