import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { QuickLinkCategory } from '../types';
import { X, Plus, Trash2, Link, ExternalLink, GripVertical, FolderPlus } from 'lucide-react';

interface LinkManagerModalProps {
  onClose: () => void;
  onUpdate: () => void;
}

const LinkManagerModal: React.FC<LinkManagerModalProps> = ({ onClose, onUpdate }) => {
  const [categories, setCategories] = useState<QuickLinkCategory[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [activeCatId, setActiveCatId] = useState<number | null>(null);
  
  // New Link Form State
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkExternal, setNewLinkExternal] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await db.getQuickLinkCategories();
    setCategories(data);
    if (!activeCatId && data.length > 0) setActiveCatId(data[0].id);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    await db.createLinkCategory(newCatName);
    setNewCatName('');
    await loadData();
  };

  const handleDeleteCategory = async (id: number) => {
      if(confirm('Delete this block and all its links?')) {
          await db.deleteLinkCategory(id);
          setActiveCatId(null);
          await loadData();
      }
  }

  const handleAddLink = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!activeCatId || !newLinkTitle || !newLinkUrl) return;
      await db.createQuickLink(activeCatId, newLinkTitle, newLinkUrl, newLinkExternal);
      setNewLinkTitle('');
      setNewLinkUrl('');
      setNewLinkExternal(true);
      await loadData();
  }

  const handleDeleteLink = async (id: number) => {
      await db.deleteQuickLink(id);
      await loadData();
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-slate-500 opacity-75" onClick={onClose}></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl w-full">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
                <h3 className="text-xl font-bold text-slate-800 flex items-center">
                    <GripVertical className="w-5 h-5 mr-2 text-slate-500" />
                    Manage Sidebar Links
                </h3>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="flex h-[600px]">
                {/* Left: Categories (Blocks) */}
                <div className="w-1/3 border-r border-slate-200 bg-slate-50 p-4 flex flex-col">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Link Blocks</h4>
                    <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                        {categories.map(cat => (
                            <div 
                                key={cat.id}
                                onClick={() => setActiveCatId(cat.id)}
                                className={`group flex justify-between items-center p-3 rounded-lg cursor-pointer transition-colors ${activeCatId === cat.id ? 'bg-white shadow-sm border border-blue-200 text-blue-700' : 'hover:bg-slate-200 text-slate-700'}`}
                            >
                                <span className="font-medium truncate">{cat.name}</span>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        {categories.length === 0 && <div className="text-sm text-slate-400 text-center py-4">No blocks created</div>}
                    </div>
                    <form onSubmit={handleAddCategory} className="mt-auto">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Create New Block</label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={newCatName}
                                onChange={(e) => setNewCatName(e.target.value)}
                                placeholder="Block Name..."
                                className="flex-1 text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button type="submit" className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right: Links in active Category */}
                <div className="w-2/3 p-6 flex flex-col bg-white">
                    {activeCatId ? (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-lg font-bold text-slate-800">
                                    {categories.find(c => c.id === activeCatId)?.name} Links
                                </h4>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                    {categories.find(c => c.id === activeCatId)?.links.length || 0} items
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto mb-6 space-y-2 pr-2">
                                {categories.find(c => c.id === activeCatId)?.links.map(link => (
                                    <div key={link.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                                        <div className="flex items-center min-w-0">
                                            <Link className="w-4 h-4 text-slate-400 mr-3 flex-shrink-0" />
                                            <div className="min-w-0">
                                                <div className="font-medium text-slate-800 text-sm truncate">{link.title}</div>
                                                <div className="text-xs text-slate-500 truncate">{link.url}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center ml-4">
                                            {link.isExternal && <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded mr-2 border border-slate-200">EXT</span>}
                                            <button 
                                                onClick={() => handleDeleteLink(link.id)}
                                                className="text-slate-300 hover:text-red-500 p-1"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {categories.find(c => c.id === activeCatId)?.links.length === 0 && (
                                    <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-xl">
                                        <FolderPlus className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                        <p className="text-slate-400">No links in this block yet</p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <h5 className="text-sm font-bold text-slate-700 mb-3">Add New Link</h5>
                                <form onSubmit={handleAddLink} className="grid grid-cols-1 gap-3">
                                    <input 
                                        type="text" 
                                        placeholder="Link Title"
                                        value={newLinkTitle}
                                        onChange={(e) => setNewLinkTitle(e.target.value)}
                                        className="text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            placeholder="URL (https://...)"
                                            value={newLinkUrl}
                                            onChange={(e) => setNewLinkUrl(e.target.value)}
                                            className="flex-1 text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                        <label className="flex items-center bg-white border border-slate-300 px-3 rounded-md cursor-pointer">
                                            <input 
                                                type="checkbox"
                                                checked={newLinkExternal}
                                                onChange={(e) => setNewLinkExternal(e.target.checked)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded mr-2"
                                            />
                                            <span className="text-xs text-slate-600 whitespace-nowrap">External Tab</span>
                                        </label>
                                    </div>
                                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                                        Add Link to Block
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <GripVertical className="w-12 h-12 mb-4 opacity-20" />
                            <p>Select or create a block to manage links</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
                <button onClick={() => { onUpdate(); onClose(); }} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-md hover:bg-slate-50">
                    Done
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LinkManagerModal;