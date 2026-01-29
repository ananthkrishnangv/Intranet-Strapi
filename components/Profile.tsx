import React, { useState } from 'react';
import { User } from '../types';
import { db } from '../services/db';
import { User as UserIcon, Mail, Briefcase, Phone, Save, Edit2, Shield } from 'lucide-react';

interface ProfileProps {
  user: User;
  onUpdate: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user.name,
    department: user.department || '',
    designation: user.designation || '',
    phone: user.phone || '',
    bio: user.bio || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        const updatedUser = { ...user, ...formData };
        await db.updateUser(updatedUser);
        onUpdate(updatedUser);
        setIsEditing(false);
        alert('Profile updated successfully.');
    } catch (err) {
        alert('Failed to update profile.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Cover Photo / Header */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
             <div className="absolute top-4 right-4 text-white/80 text-xs font-mono">ID: {user.id}</div>
        </div>
        
        <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-12 mb-6">
                <div className="flex items-end">
                    <img 
                        src={user.avatarUrl} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-white"
                    />
                    <div className="ml-4 mb-1">
                        <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
                        <p className="text-slate-500 text-sm flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {user.email}
                        </p>
                    </div>
                </div>
                <div>
                     {!isEditing ? (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="flex items-center px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Profile
                        </button>
                     ) : (
                        <button 
                            onClick={() => setIsEditing(false)}
                            className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2"
                        >
                            Cancel
                        </button>
                     )}
                </div>
            </div>

            {isEditing ? (
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Personal Details</h3>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Extension</label>
                            <input
                                name="phone"
                                type="text"
                                placeholder="e.g. +91 44 2254 9000"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Organization</h3>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Department / Division</label>
                            <input
                                name="department"
                                type="text"
                                value={formData.department}
                                onChange={handleChange}
                                className="w-full border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Designation</label>
                            <input
                                name="designation"
                                type="text"
                                value={formData.designation}
                                onChange={handleChange}
                                className="w-full border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Bio / Responsibilities</label>
                        <textarea
                            name="bio"
                            rows={3}
                            value={formData.bio}
                            onChange={handleChange}
                            className="w-full border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                        />
                    </div>

                    <div className="md:col-span-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                         <div className="flex items-start">
                             <Briefcase className="w-5 h-5 text-slate-400 mt-0.5 mr-3" />
                             <div>
                                 <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Designation</p>
                                 <p className="text-slate-900 font-medium">{user.designation || 'Not specified'}</p>
                             </div>
                         </div>
                         <div className="flex items-start">
                             <Shield className="w-5 h-5 text-slate-400 mt-0.5 mr-3" />
                             <div>
                                 <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Department</p>
                                 <p className="text-slate-900 font-medium">{user.department || 'Not specified'}</p>
                             </div>
                         </div>
                     </div>
                     <div className="space-y-4">
                          <div className="flex items-start">
                             <Phone className="w-5 h-5 text-slate-400 mt-0.5 mr-3" />
                             <div>
                                 <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Contact</p>
                                 <p className="text-slate-900 font-medium">{user.phone || 'Not specified'}</p>
                             </div>
                         </div>
                         <div className="flex items-start">
                             <UserIcon className="w-5 h-5 text-slate-400 mt-0.5 mr-3" />
                             <div>
                                 <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Role</p>
                                 <p className="text-slate-900 font-medium capitalize">{user.role}</p>
                             </div>
                         </div>
                     </div>
                     {user.bio && (
                         <div className="md:col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-700 text-sm leading-relaxed">
                             <h4 className="font-bold text-slate-900 mb-2">About</h4>
                             {user.bio}
                         </div>
                     )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Profile;