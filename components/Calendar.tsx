import React, { useMemo, useState, useEffect } from 'react';
import { db } from '../services/db';
import { Holiday } from '../types';
import { Calendar as CalendarIcon, Info, Upload, Download } from 'lucide-react';

const CalendarView: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [view, setView] = useState<'holidays' | 'org'>('holidays');
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    loadHolidays();
  }, []);

  const loadHolidays = async () => {
      const h = await db.getHolidays();
      setHolidays(h);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
          const csvText = event.target?.result as string;
          setIsImporting(true);
          try {
              await db.importHolidaysCSV(csvText);
              alert('Holidays imported successfully!');
              loadHolidays();
          } catch (err) {
              alert('Failed to import CSV. Ensure format: Name,Date(YYYY-MM-DD),Type,Notes');
          } finally {
              setIsImporting(false);
          }
      };
      reader.readAsText(file);
  };

  // Group holidays by month
  const holidaysByMonth = useMemo(() => {
    const groups: Record<string, Holiday[]> = {};
    holidays.forEach(holiday => {
      const date = new Date(holiday.date);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(holiday);
    });
    return groups;
  }, [holidays]);

  const monthKeys = Object.keys(holidaysByMonth);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                    <CalendarIcon className="w-6 h-6 mr-2 text-blue-600" />
                    {view === 'holidays' ? 'Holiday Calendar 2024' : 'Organizational Events'}
                </h1>
                <p className="text-slate-500 mt-1">
                    {view === 'holidays' ? 'Official list of Gazetted and Restricted holidays.' : 'Upcoming institutional events and conferences.'}
                </p>
            </div>
            <div className="flex space-x-2">
                 <button 
                    onClick={() => setView('holidays')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${view === 'holidays' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                 >
                     Holidays
                 </button>
                 <button 
                    onClick={() => setView('org')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${view === 'org' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                 >
                     Events
                 </button>
            </div>
        </div>
        
        {view === 'holidays' && (
            <div className="flex flex-col md:flex-row justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex flex-wrap gap-3 text-sm mb-4 md:mb-0">
                    <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                        <span className="text-slate-700">Gazetted</span>
                    </div>
                    <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                        <span className="text-slate-700">Restricted</span>
                    </div>
                    <div className="flex items-center">
                        <span className="px-1.5 py-0.5 rounded bg-slate-200 text-xs font-bold text-slate-600 mr-1 border border-slate-300">T</span>
                        <span className="text-slate-700">Tentative</span>
                    </div>
                </div>
                
                <div className="flex items-center">
                    <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-white border border-slate-300 rounded-md font-medium text-slate-700 text-sm hover:bg-slate-50 shadow-sm transition-colors">
                        <Upload className="w-4 h-4 mr-2 text-slate-500" />
                        {isImporting ? 'Importing...' : 'Import CSV'}
                        <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={isImporting} />
                    </label>
                    <button className="ml-2 p-2 text-slate-400 hover:text-slate-600" title="Download Template">
                        <Download className="w-5 h-5" />
                    </button>
                </div>
            </div>
        )}
      </div>

      {view === 'holidays' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {monthKeys.map(month => (
            <div key={month} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                <h3 className="font-semibold text-slate-800">{month}</h3>
                </div>
                <div className="divide-y divide-slate-100">
                {holidaysByMonth[month].map(holiday => (
                    <div key={holiday.id} className="p-4 hover:bg-slate-50 transition-colors group relative">
                    <div className="flex justify-between items-start mb-1">
                        <div className={`text-2xl font-bold ${holiday.holidayType === 'gazetted' ? 'text-red-500' : 'text-yellow-600'}`}>
                        {new Date(holiday.date).getDate()}
                        </div>
                        <div className="flex flex-col items-end">
                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                                holiday.holidayType === 'gazetted' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                                {holiday.holidayType === 'gazetted' ? 'GH' : 'RH'}
                            </span>
                            {holiday.isTentative && (
                                <span className="text-[10px] mt-1 text-slate-500 flex items-center">
                                    (T) Tentative
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="text-sm font-medium text-slate-800">{holiday.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{new Date(holiday.date).toLocaleDateString('en-US', { weekday: 'long' })}</div>
                    {holiday.notes && (
                        <div className="mt-2 text-xs text-blue-600 flex items-start bg-blue-50 p-1.5 rounded">
                            <Info className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                            {holiday.notes}
                        </div>
                    )}
                    </div>
                ))}
                </div>
            </div>
            ))}
        </div>
      ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
              <p>Organizational Events Calendar View is under construction.</p>
          </div>
      )}
    </div>
  );
};

export default CalendarView;