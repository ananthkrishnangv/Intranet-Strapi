import React from 'react';
import { MOCK_ALBUMS } from '../services/mockData';
import { Image, Layers } from 'lucide-react';

const Gallery: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center">
          <Image className="w-6 h-6 mr-2 text-blue-600" />
          Media Gallery
        </h1>
        <p className="text-slate-500 mt-1">Photos from recent events, exhibitions, and campus life.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_ALBUMS.map((album) => (
          <div key={album.id} className="group bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300">
            <div className="relative aspect-[4/3] overflow-hidden">
              <img 
                src={album.coverImage} 
                alt={album.title}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                 <button className="bg-white/90 text-slate-900 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm backdrop-blur-sm w-full">View Album</button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                 <h3 className="font-semibold text-slate-900 line-clamp-1 text-lg group-hover:text-blue-600 transition-colors">{album.title}</h3>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>{new Date(album.date).toLocaleDateString()}</span>
                <span className="flex items-center bg-slate-100 px-2 py-1 rounded-full text-xs font-medium">
                  <Layers className="w-3 h-3 mr-1" />
                  {album.photoCount} Photos
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;