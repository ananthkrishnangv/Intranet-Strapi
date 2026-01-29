import React, { useState } from 'react';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';
import RichTextEditor from './RichTextEditor';

interface PostModalProps {
  type: 'journal' | 'circular';
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

const PostModal: React.FC<PostModalProps> = ({ type, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState('');
  const [fileName, setFileName] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'General',
    // Journal fields
    excerpt: '',
    content: '',
    priority: false,
    // Circular fields
    refNumber: '',
    summary: '',
    issueDate: new Date().toISOString().split('T')[0],
    attachmentUrl: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type: inputType } = e.target;
    // Handle Checkbox
    if (inputType === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: checked }));
        return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (html: string) => {
    setFormData(prev => ({ ...prev, content: html }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError('');
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setFileError('File size must be less than 5MB.');
        return;
      }
      setFileName(file.name);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, attachmentUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fileError) return;
    setLoading(true);
    
    // Auto-fill excerpt from content if empty (strip HTML)
    let submitData = { ...formData };
    if (type === 'journal' && !submitData.excerpt && submitData.content) {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = submitData.content;
        submitData.excerpt = (tmp.textContent || tmp.innerText || "").substring(0, 150) + "...";
    }

    await onSubmit(submitData);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-slate-500 opacity-75" onClick={onClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg leading-6 font-medium text-slate-900 capitalize">
                New {type} Post
              </h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form id="post-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Title</label>
                <input
                  name="title"
                  type="text"
                  required
                  className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Category</label>
                <select
                  name="category"
                  className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option>General</option>
                  <option>HR</option>
                  <option>Finance</option>
                  <option>Events</option>
                  <option>Research</option>
                  <option>Safety</option>
                  <option>Campus Life</option>
                  <option>Administration</option>
                  <option>Notices</option>
                </select>
              </div>

              {type === 'journal' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Content (Rich Text)</label>
                    <RichTextEditor 
                        value={formData.content} 
                        onChange={handleContentChange} 
                        label="Article Body"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Excerpt (Optional)</label>
                    <p className="text-xs text-slate-500 mb-1">Short summary for the dashboard feed. If left blank, will be generated from content.</p>
                    <textarea
                      name="excerpt"
                      rows={2}
                      className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={formData.excerpt}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      id="priority"
                      name="priority"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                      checked={formData.priority}
                      onChange={handleChange}
                    />
                    <label htmlFor="priority" className="ml-2 block text-sm text-slate-900">
                      Mark as Priority (Pin to top)
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Reference Number</label>
                    <input
                      name="refNumber"
                      type="text"
                      required
                      placeholder="e.g. ADM/2024/001"
                      className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={formData.refNumber}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Summary</label>
                    <textarea
                      name="summary"
                      required
                      rows={2}
                      className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={formData.summary}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Issue Date</label>
                    <input
                      name="issueDate"
                      type="date"
                      required
                      className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={formData.issueDate}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              {/* Attachment Upload Field */}
              <div className="pt-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Attachment</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md hover:bg-slate-50 transition-colors relative">
                    <div className="space-y-1 text-center">
                        {fileName ? (
                             <div className="flex flex-col items-center text-blue-600">
                                <FileText className="h-8 w-8 mb-2" />
                                <span className="text-sm font-medium">{fileName}</span>
                                <span className="text-xs text-slate-500 mt-1">Ready to upload</span>
                             </div>
                        ) : (
                            <>
                                <Upload className="mx-auto h-8 w-8 text-slate-400" />
                                <div className="flex text-sm text-slate-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                        <span>Upload a file</span>
                                        <input 
                                            id="file-upload" 
                                            name="file-upload" 
                                            type="file" 
                                            className="sr-only" 
                                            onChange={handleFileChange} 
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png" 
                                        />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-slate-500">PDF, Office Docs, Images (Max 5MB)</p>
                            </>
                        )}
                    </div>
                </div>
                {fileError && (
                    <div className="mt-2 flex items-center text-red-500 text-xs">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {fileError}
                    </div>
                )}
              </div>

            </form>
          </div>
          <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              form="post-form"
              disabled={loading || !!fileError}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {loading ? 'Publishing...' : 'Publish'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostModal;