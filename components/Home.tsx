import React, { useEffect, useState, useMemo } from 'react';
import { db } from '../services/db';
import { MOCK_LINKS } from '../services/mockData';
import { JournalPost, Circular, OrgEvent, SearchResult, ArchiveStat, QuickLinkCategory } from '../types';
import { Pin, Calendar, FileText, Download, ExternalLink, ChevronRight, ArrowRight, Plus, Trash2, Filter, Search as SearchIcon, MapPin, Clock, Paperclip, Archive, Tag, X, Edit, Settings, LayoutGrid, Shield } from 'lucide-react';
import PostModal from './PostModal';
import LinkManagerModal from './LinkManagerModal';

interface HomeProps {
  onNavigate: (route: string) => void;
  userRole?: 'admin' | 'employee';
  searchQuery?: string;
}

const Home: React.FC<HomeProps> = ({ onNavigate, userRole, searchQuery }) => {
  const [journalPosts, setJournalPosts] = useState<JournalPost[]>([]);
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [events, setEvents] = useState<OrgEvent[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [archiveStats, setArchiveStats] = useState<ArchiveStat[]>([]);
  // Initialize with MOCK_LINKS to ensure sidebar is never empty on first load
  const [quickLinkCategories, setQuickLinkCategories] = useState<QuickLinkCategory[]>(MOCK_LINKS);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'All' | 'Circulars' | 'OMs' | 'Events' | 'News'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'journal' | 'circular'>('journal');
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
  const [isLinkManagerOpen, setIsLinkManagerOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    if (searchQuery) {
        const results = await db.searchContent(searchQuery);
        setSearchResults(results);
    } else {
        const fetchPosts = activeTab === 'All' || activeTab === 'News';
        const fetchCircs = activeTab === 'All' || activeTab === 'Circulars' || activeTab === 'OMs';
        const fetchEvents = activeTab === 'All' || activeTab === 'Events';

        try {
          const [posts, circs, evts, archives, linkCats] = await Promise.all([
            fetchPosts ? db.getJournalPosts(selectedCategory || undefined, selectedYear || undefined) : Promise.resolve([]),
            fetchCircs ? db.getCirculars(selectedCategory || undefined, selectedYear || undefined) : Promise.resolve([]),
            fetchEvents ? db.getOrgEvents() : Promise.resolve([]),
            db.getArchiveYears(),
            db.getQuickLinkCategories()
          ]);
          
          setJournalPosts(posts);
          setCirculars(circs);
          setEvents(evts);
          setArchiveStats(archives);
          // Only override mock links if we actually get data from DB
          if (linkCats && linkCats.length > 0) {
            setQuickLinkCategories(linkCats);
          }
        } catch (e) {
          console.error("Error fetching dashboard data", e);
        }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, searchQuery, selectedCategory, selectedYear]);

  const handlePostSubmit = async (data: any) => {
    if (modalType === 'journal') {
      await db.createJournalPost(data);
    } else {
      await db.createCircular(data);
    }
    await fetchData();
  };

  const openModal = (type: 'journal' | 'circular') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent, type: 'journal', id: number) => {
      e.stopPropagation();
      if(confirm('Are you sure you want to delete this post?')) {
          await db.deleteJournalPost(id);
          await fetchData();
      }
  };

  const handleDownload = (url: string | undefined, filename: string) => {
      if (!url || url === '#' || url === '') {
          alert('No attachment available.');
          return;
      }
      if (url.startsWith('data:')) {
          const a = document.createElement('a');
          a.href = url;
          a.download = filename || 'attachment';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
      } else {
          window.open(url, '_blank');
      }
  }

  // Unified Feed Logic
  const feedItems = useMemo(() => {
    if (loading && journalPosts.length === 0) return [];
    
    // Transform and tag items
    const posts = journalPosts.map(p => ({ ...p, contentType: 'journal' as const, sortDate: p.publishedAt }));
    const circs = circulars.map(c => ({ ...c, contentType: 'circular' as const, sortDate: c.issueDate }));
    const evts = events.map(e => ({ ...e, contentType: 'event' as const, sortDate: e.date }));

    return [...posts, ...circs, ...evts].sort((a, b) => 
      new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime()
    );
  }, [journalPosts, circulars, events, loading]);

  // Render Search Results View
  if (searchQuery) {
      return (
          <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                  <SearchIcon className="w-6 h-6 mr-2 text-blue-600" />
                  Search Results for "{searchQuery}"
              </h2>
              {loading ? <p>Searching...</p> : (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                      {searchResults.length === 0 ? (
                          <div className="p-8 text-center text-slate-500">No results found.</div>
                      ) : (
                          <div className="divide-y divide-slate-100">
                              {searchResults.map((res) => (
                                  <div key={`${res.type}-${res.id}`} className="p-5 hover:bg-slate-50">
                                      <div className="flex items-center space-x-2 mb-1">
                                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${res.type === 'journal' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                              {res.type}
                                          </span>
                                          <span className="text-xs text-slate-400">{new Date(res.date).toLocaleDateString()}</span>
                                      </div>
                                      <h3 className="text-lg font-semibold text-slate-900">{res.title}</h3>
                                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">{res.snippet}</p>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              )}
          </div>
      )
  }

  // Normal Dashboard View
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-8 relative">
      
      {/* Admin Actions Modal */}
      {isModalOpen && (
        <PostModal 
          type={modalType} 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={handlePostSubmit} 
        />
      )}

      {/* Link Manager Modal */}
      {isLinkManagerOpen && (
          <LinkManagerModal 
            onClose={() => setIsLinkManagerOpen(false)} 
            onUpdate={fetchData} 
          />
      )}

      {/* ================= LEFT COLUMN (70%) - Content Feed ================= */}
      <div className="space-y-6 min-w-0">
        
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
            <div className="flex space-x-1">
                {['All', 'News', 'Circulars', 'OMs', 'Events'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => {
                            setActiveTab(tab as any);
                            setSelectedCategory(null); // Clear specific category when switching main tabs
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                            activeTab === tab && !selectedCategory
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            {/* Quick Actions in Navbar - Optional but good for redundancy */}
            {userRole === 'admin' && (
                <div className="flex space-x-2 pl-4 border-l border-slate-200">
                     <button onClick={() => openModal('journal')} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Add Post">
                        <Plus className="w-5 h-5" />
                     </button>
                     <button onClick={() => openModal('circular')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Add Circular">
                        <FileText className="w-5 h-5" />
                     </button>
                </div>
            )}
        </div>

        {/* Filters Active State Display */}
        {(selectedCategory || selectedYear) && (
            <div className="flex items-center space-x-2">
                {selectedCategory && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                        Category: {selectedCategory}
                        <button onClick={() => setSelectedCategory(null)} className="ml-2 text-indigo-600 hover:text-indigo-900"><X className="w-4 h-4" /></button>
                    </span>
                )}
                {selectedYear && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                        Year: {selectedYear}
                        <button onClick={() => setSelectedYear(null)} className="ml-2 text-amber-600 hover:text-amber-900"><X className="w-4 h-4" /></button>
                    </span>
                )}
                <button 
                    onClick={() => { setSelectedCategory(null); setSelectedYear(null); }}
                    className="text-sm text-slate-500 hover:text-slate-700 underline"
                >
                    Clear All
                </button>
            </div>
        )}

        {/* Content Stream */}
        <div className="space-y-4">
            {loading && journalPosts.length === 0 && <div className="text-center py-10 text-slate-400">Loading content...</div>}
            
            {!loading && feedItems.length === 0 && (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
                    <p className="text-slate-500">No content found for the selected filters.</p>
                </div>
            )}
            
            {feedItems.map((item: any) => {
              // JOURNAL POST RENDER
              if (item.contentType === 'journal') {
                const isExpanded = expandedPostId === item.id;
                return (
                  <div key={`post-${item.id}`} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow group relative">
                      <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedCategory(item.category); }}
                                className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded border border-blue-100 hover:bg-blue-100 transition-colors"
                              >
                                  {item.category}
                              </button>
                              {item.priority && <Pin className="w-3 h-3 text-red-500 fill-current" />}
                              <span className="text-xs text-slate-400">• {new Date(item.publishedAt).toLocaleDateString()}</span>
                          </div>
                          {userRole === 'admin' && (
                              <button onClick={(e) => handleDelete(e, 'journal', item.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Trash2 className="w-4 h-4" />
                              </button>
                          )}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => setExpandedPostId(isExpanded ? null : item.id)}>
                          {item.title}
                      </h3>
                      
                      {/* Content Area */}
                      <div className={`text-slate-600 text-sm leading-relaxed mb-4 ${isExpanded ? '' : ''}`}>
                          {isExpanded && item.content ? (
                              <div className="prose prose-sm max-w-none animate-in fade-in" dangerouslySetInnerHTML={{ __html: item.content }} />
                          ) : (
                              <p>{item.excerpt}</p>
                          )}
                      </div>

                      <div className="flex items-center space-x-4">
                          <button 
                            onClick={() => setExpandedPostId(isExpanded ? null : item.id)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
                          >
                              {isExpanded ? 'Show Less' : 'Read More'} <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </button>
                           {item.attachmentUrl && (
                                <button onClick={() => handleDownload(item.attachmentUrl, item.slug)} className="text-xs flex items-center text-slate-500 hover:text-blue-600 bg-slate-50 px-2 py-1 rounded">
                                    <Paperclip className="w-3 h-3 mr-1" />
                                    Attachment
                                </button>
                           )}
                      </div>
                  </div>
                );
              }

              // CIRCULAR RENDER
              if (item.contentType === 'circular') {
                return (
                  <div key={`circ-${item.id}`} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex items-start">
                    <div className="flex-shrink-0 mr-4">
                        <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                            <FileText className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                {item.refNumber}
                            </span>
                            <span 
                                className="bg-slate-50 text-slate-600 text-[10px] uppercase font-bold px-2 py-0.5 rounded cursor-pointer hover:bg-slate-100"
                                onClick={(e) => { e.stopPropagation(); setSelectedCategory(item.category); }}
                            >
                                {item.category}
                            </span>
                            <span className="text-xs text-slate-400">• {new Date(item.issueDate).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1 truncate">{item.title}</h3>
                        <p className="text-sm text-slate-600 line-clamp-1 mb-2">{item.summary}</p>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                        <button 
                            onClick={() => handleDownload(item.attachmentUrl, item.slug)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            title="Download Attachment"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                 </div>
                );
              }

              // EVENT RENDER
              if (item.contentType === 'event') {
                return (
                  <div key={`evt-${item.id}`} className="bg-white rounded-xl border border-l-4 border-l-purple-500 border-slate-200 p-5 shadow-sm flex items-center">
                     <div className="flex-shrink-0 text-center px-4 border-r border-slate-100 mr-4">
                        <div className="text-2xl font-bold text-slate-800">{new Date(item.date).getDate()}</div>
                        <div className="text-xs text-slate-500 uppercase font-bold">{new Date(item.date).toLocaleString('default', { month: 'short' })}</div>
                     </div>
                     <div>
                        <h3 className="font-semibold text-slate-900">{item.title}</h3>
                        <div className="text-sm text-slate-500 flex items-center mt-1 space-x-3">
                             <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                             <span className="flex items-center"><MapPin className="w-3 h-3 mr-1"/> {item.location}</span>
                        </div>
                     </div>
                  </div>
                );
              }
              return null;
            })}
        </div>
      </div>

      {/* ================= RIGHT COLUMN (30%) - Widgets ================= */}
      <div className="space-y-6">

         {/* Admin Actions Widget (Sidebar) */}
         {userRole === 'admin' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-5 py-3 bg-slate-50/50 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-purple-600" />
                        Admin Actions
                    </h3>
                </div>
                <div className="p-3 space-y-2">
                    <button 
                        onClick={() => openModal('journal')}
                        className="w-full flex items-center p-2 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors group"
                    >
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center mr-3 group-hover:border-blue-200 group-hover:text-blue-600">
                            <Plus className="w-4 h-4" />
                        </div>
                        Add Journal Post
                    </button>
                    <button 
                        onClick={() => openModal('circular')}
                        className="w-full flex items-center p-2 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-green-50 hover:text-green-700 rounded-lg transition-colors group"
                    >
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center mr-3 group-hover:border-green-200 group-hover:text-green-600">
                            <FileText className="w-4 h-4" />
                        </div>
                        Add Circular / OM
                    </button>
                    <button 
                        onClick={() => setIsLinkManagerOpen(true)}
                        className="w-full flex items-center p-2 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group"
                    >
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center mr-3 group-hover:border-slate-300">
                            <Settings className="w-4 h-4" />
                        </div>
                        Manage Sidebar
                    </button>
                </div>
            </div>
         )}

        {/* Dynamic Quick Links Widgets */}
        {quickLinkCategories.map((category) => (
          <div key={category.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative group">
            <div className="px-5 py-3 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center">
                <LayoutGrid className="w-4 h-4 mr-2 text-slate-400" />
                {category.name}
              </h3>
              {userRole === 'admin' && (
                  <button onClick={() => setIsLinkManagerOpen(true)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 p-1">
                      <Edit className="w-3 h-3" />
                  </button>
              )}
            </div>
            <div className="p-2">
              {category.links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target={link.isExternal ? "_blank" : "_self"}
                  rel="noreferrer"
                  onClick={(e) => {
                      if(link.title === 'Holiday Calendar') {
                          e.preventDefault();
                          onNavigate('calendar');
                      }
                  }}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors group/link"
                >
                  <div className="flex items-center">
                    <ChevronRight className="w-4 h-4 text-slate-400 mr-2 group-hover/link:text-blue-500" />
                    {link.title}
                  </div>
                  {link.isExternal && <ExternalLink className="w-3 h-3 text-slate-400" />}
                </a>
              ))}
              {category.links.length === 0 && <p className="text-xs text-slate-400 p-2 text-center">No links yet</p>}
            </div>
          </div>
        ))}

        {/* Holiday Widget */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
             <h3 className="font-bold text-lg mb-4 flex items-center">
                 <Calendar className="w-5 h-5 mr-2" />
                 Upcoming Holidays
             </h3>
             <div className="space-y-3">
                 <div className="flex items-center bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                     <div className="text-center mr-3 min-w-[3rem]">
                         <div className="text-xl font-bold leading-none">02</div>
                         <div className="text-[10px] uppercase opacity-80">Oct</div>
                     </div>
                     <div>
                         <div className="font-medium text-sm">Gandhi Jayanti</div>
                         <div className="text-xs opacity-70">Gazetted Holiday</div>
                     </div>
                 </div>
                 <div className="flex items-center bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                     <div className="text-center mr-3 min-w-[3rem]">
                         <div className="text-xl font-bold leading-none">12</div>
                         <div className="text-[10px] uppercase opacity-80">Oct</div>
                     </div>
                     <div>
                         <div className="font-medium text-sm">Dussehra</div>
                         <div className="text-xs opacity-70">Gazetted Holiday</div>
                     </div>
                 </div>
             </div>
             <button 
                onClick={() => onNavigate('calendar')}
                className="w-full mt-4 py-2 bg-white text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors"
             >
                 View Full Calendar
             </button>
        </div>

        {/* Events Widget - As per wireframe */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 bg-slate-50/50 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Upcoming Events
                </h3>
            </div>
            <div className="divide-y divide-slate-50">
                {events.slice(0, 3).map(evt => (
                    <div key={evt.id} className="p-3 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 w-10 text-center bg-blue-50 rounded p-1 mr-3 border border-blue-100">
                                <span className="block text-xs font-bold text-blue-700 uppercase">{new Date(evt.date).toLocaleString('default', { month: 'short' })}</span>
                                <span className="block text-lg font-bold text-slate-900 leading-none">{new Date(evt.date).getDate()}</span>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-slate-900 line-clamp-1">{evt.title}</h4>
                                <p className="text-xs text-slate-500 mt-0.5 flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {new Date(evt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
                {events.length === 0 && <p className="text-xs text-slate-400 p-4 text-center">No upcoming events</p>}
            </div>
            <button onClick={() => onNavigate('calendar')} className="w-full text-center py-2 text-xs font-medium text-blue-600 bg-slate-50 hover:bg-slate-100 border-t border-slate-100">
                View All Events
            </button>
        </div>

        {/* Archives Widget */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="px-5 py-3 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center">
                <Archive className="w-4 h-4 mr-2" />
                Archives
              </h3>
            </div>
            <div className="p-3">
                <div className="flex flex-wrap gap-2">
                    {archiveStats.map(stat => (
                        <button
                            key={stat.year}
                            onClick={() => setSelectedYear(selectedYear === stat.year ? null : stat.year)}
                            className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                                selectedYear === stat.year 
                                ? 'bg-blue-600 text-white border-blue-600' 
                                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                            }`}
                        >
                            {stat.year} <span className="opacity-70 ml-1">({stat.count})</span>
                        </button>
                    ))}
                    {archiveStats.length === 0 && <span className="text-xs text-slate-400 p-2">No archives available</span>}
                </div>
            </div>
        </div>

        {/* Social Links Widget - As per wireframe footer note */}
        <div className="bg-slate-800 text-white rounded-xl shadow-sm p-4 text-center">
             <h3 className="text-xs font-bold uppercase tracking-wider mb-3 opacity-70">Follow CSIR-SERC</h3>
             <div className="flex justify-center space-x-4">
                 <a href="#" className="p-2 bg-slate-700 rounded-full hover:bg-blue-600 transition-colors" title="Twitter">
                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
                 </a>
                 <a href="#" className="p-2 bg-slate-700 rounded-full hover:bg-blue-800 transition-colors" title="Facebook">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                 </a>
                 <a href="#" className="p-2 bg-slate-700 rounded-full hover:bg-red-600 transition-colors" title="YouTube">
                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                 </a>
             </div>
        </div>

      </div>
    </div>
  );
};

export default Home;