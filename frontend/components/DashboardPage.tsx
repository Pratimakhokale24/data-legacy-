
import React, { useState, useCallback, useEffect } from 'react';
import type { SchemaField, ExtractedRecord, HistoryItem } from '../types';
import { extractData } from '../services/extractorService';
import * as api from '../services/apiService';
import DataTable from './DataTable';
import ProfilePanel from './ProfilePanel';
import { PlusIcon, TrashIcon, LoaderIcon, LogOutIcon, LayersIcon, HistoryIcon, FilePlusIcon } from './icons';

interface DashboardPageProps {
  userEmail: string;
  onLogout: () => void;
}

const exampleLegacyData = `001-pratima-k-NEW delhi-In
002-A-B-C-In
003-P-J-E-IN`;

const initialSchema: SchemaField[] = [
  { id: crypto.randomUUID(), name: "userId", description: "The unique identifier for the user" },
  { id: crypto.randomUUID(), name: "firstName", description: "The user's first name" },
  { id: crypto.randomUUID(), name: "lastName", description: "The user's last name" },
  { id: crypto.randomUUID(), name: "city", description: "The city where the user lives" },
  { id: crypto.randomUUID(), name: "country", description: "The country where the user lives" }
];

const DashboardPage: React.FC<DashboardPageProps> = ({ userEmail, onLogout }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);

  const [schema, setSchema] = useState<SchemaField[]>(initialSchema);
  const [legacyData, setLegacyData] = useState<string>(exampleLegacyData);
  const [extractedData, setExtractedData] = useState<ExtractedRecord[] | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'table' | 'json'>('table');
  const [showProfile, setShowProfile] = useState<boolean>(false);

  const toCSV = useCallback((rows: ExtractedRecord[], headers?: string[]): string => {
    const cols = headers && headers.length > 0 ? headers : (rows[0] ? Object.keys(rows[0]) : []);
    const escapeCell = (val: any) => {
      if (val == null) return '';
      const s = String(val);
      if (/[",\n]/.test(s)) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    };
    const headerLine = cols.join(',');
    const bodyLines = rows.map(r => cols.map(c => escapeCell((r as any)[c])).join(','));
    const csv = [headerLine, ...bodyLines].join('\n');
    const bom = '\uFEFF';
    return bom + csv;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const items = await api.getHistory();
        setHistory(items);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [userEmail]);

  const resetToNew = () => {
    setSelectedHistoryId(null);
    setSchema(initialSchema);
    setLegacyData(exampleLegacyData);
    setExtractedData(null);
    setError(null);
  };

  const handleSelectHistoryItem = (itemId: string) => {
    const item = history.find(h => h.id === itemId);
    if (item) {
      setSelectedHistoryId(item.id);
      setLegacyData(item.legacyData);
      setSchema(item.schema);
      setExtractedData(item.extractedData);
      setError(null);
    }
  };
  
  const handleDeleteHistoryItem = async (itemId: string) => {
    try {
      await api.deleteHistoryItem(itemId);
      setHistory((prev) => prev.filter((h) => h.id !== itemId));
      if (selectedHistoryId === itemId) {
        resetToNew();
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to delete history item');
    }
  };


  const handleSchemaChange = <T,>(index: number, field: keyof SchemaField, value: T) => {
    const newSchema = [...schema];
    newSchema[index] = { ...newSchema[index], [field]: value };
    setSchema(newSchema);
    setSelectedHistoryId(null); // Editing means it's a new item now
  };

  const addSchemaField = () => {
    setSchema([...schema, { id: crypto.randomUUID(), name: '', description: '' }]);
    setSelectedHistoryId(null);
  };

  const removeSchemaField = (index: number) => {
    setSchema(schema.filter((_, i) => i !== index));
    setSelectedHistoryId(null);
  };

  const handleProcessData = useCallback(async () => {
    if (!legacyData.trim() || schema.length === 0 || schema.some(f => !f.name.trim())) {
      setError("Please provide legacy data and a complete schema with field names.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setExtractedData(null);
    try {
      const result = await extractData(legacyData, schema);
      setExtractedData(result);

      const newHistoryItem: HistoryItem = {
        id: crypto.randomUUID(),
        title: legacyData.substring(0, 40).split('\n')[0] + '...',
        timestamp: new Date().toISOString(),
        legacyData,
        schema,
        extractedData: result,
      };
      const created = await api.addHistoryItem(newHistoryItem);
      setHistory((prev) => [created, ...prev]);
      setSelectedHistoryId(created.id);

    } catch (e) {
      setError(e instanceof Error ? e.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [legacyData, schema, userEmail]);

  return (
    <div className="flex flex-col h-screen bg-slate-950">
      <header className="flex-shrink-0 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
             <LayersIcon className="w-7 h-7 text-sky-400"/>
             <span className="text-xl font-semibold text-slate-200">Legacy Data Extractor AI</span>
          </div>
          <div className="flex items-center space-x-4">
             <span className="text-sm text-slate-400 hidden sm:block">{userEmail}</span>
             <button onClick={() => setShowProfile(true)} className="flex items-center space-x-2 text-slate-400 hover:text-white transition">
                <span className="text-sm font-medium">Profile</span>
             </button>
             <button onClick={onLogout} className="flex items-center space-x-2 text-slate-400 hover:text-white transition">
                <LogOutIcon className="w-5 h-5"/>
                <span className="text-sm font-medium">Logout</span>
             </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
          {/* Left Panel: History */}
          <div className="lg:col-span-3 flex flex-col border-r border-slate-800 bg-slate-900/50">
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                    <HistoryIcon className="w-5 h-5 text-slate-400"/>
                    <h2 className="text-lg font-semibold text-slate-200">History</h2>
                </div>
                <button onClick={resetToNew} className="flex items-center space-x-2 text-sm font-medium text-sky-400 hover:text-sky-300 transition" title="Start a new extraction">
                    <FilePlusIcon className="w-5 h-5"/>
                    <span className="hidden xl:inline">New</span>
                </button>
            </div>
            <div className="flex-1 overflow-y-auto">
                {history.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 text-sm">No history yet. Process some data to save it here.</div>
                ) : (
                    <ul className="divide-y divide-slate-800">
                        {history.map(item => (
                            <li key={item.id} className={`p-4 cursor-pointer hover:bg-slate-800/60 ${selectedHistoryId === item.id ? 'bg-sky-900/30' : ''}`}>
                                <div className="flex items-start justify-between">
                                    <div onClick={() => handleSelectHistoryItem(item.id)} className="flex-1 pr-2">
                                        <p className="text-sm font-semibold text-slate-200 truncate">{item.title}</p>
                                        <p className="text-xs text-slate-500 mt-1">{new Date(item.timestamp).toLocaleString()}</p>
                                    </div>
                                    <button onClick={() => handleDeleteHistoryItem(item.id)} className="text-slate-500 hover:text-red-400 p-1 rounded-full">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
          </div>
          
          {/* Middle Panel: Inputs */}
          <div className="lg:col-span-4 flex flex-col p-6 overflow-y-auto border-r border-slate-800">
            <div className="mb-6">
              <label htmlFor="legacy-data" className="block text-lg font-semibold text-slate-200 mb-2">
                1. Paste Legacy Data
              </label>
              <textarea
                id="legacy-data"
                rows={8}
                value={legacyData}
                onChange={(e) => {setLegacyData(e.target.value); setSelectedHistoryId(null);}}
                placeholder="Paste your raw, unstructured, or legacy text data here..."
                className="w-full p-4 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition font-mono text-sm"
              />
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-200 mb-3">2. Define Extraction Schema</h3>
              <div className="space-y-3">
                {schema.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-3 items-center bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <input type="text" placeholder="field_name" value={field.name} onChange={(e) => handleSchemaChange(index, 'name', e.target.value)} className="col-span-4 p-2 bg-slate-800 border border-slate-700 rounded-md text-sm" />
                    <input type="text" placeholder="Description for AI" value={field.description} onChange={(e) => handleSchemaChange(index, 'description', e.target.value)} className="col-span-7 p-2 bg-slate-800 border border-slate-700 rounded-md text-sm" />
                    <button onClick={() => removeSchemaField(index)} className="col-span-1 flex justify-center items-center text-slate-500 hover:text-red-400 transition"> <TrashIcon className="w-5 h-5" /> </button>
                  </div>
                ))}
              </div>
              <button onClick={addSchemaField} className="mt-4 flex items-center space-x-2 text-sm font-medium text-sky-400 hover:text-sky-300 transition"> <PlusIcon className="w-5 h-5" /> <span>Add Field</span> </button>
            </div>
            
            <div>
              <button onClick={handleProcessData} disabled={isLoading} className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-sky-500 transition-all duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed">
                {isLoading && <LoaderIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />}
                {isLoading ? "Processing..." : "3. Extract Data with AI"}
              </button>
              {error && <p className="text-sm text-red-400 mt-3">{error}</p>}
            </div>
          </div>
          
          {/* Right Panel: Results */}
          <div className="lg:col-span-5 flex flex-col p-6 overflow-hidden">
            <div className="flex-shrink-0 mb-4">
              <h3 className="text-lg font-semibold text-slate-200">Extracted Results</h3>
               <div className="mt-2">
                <div className="inline-flex bg-slate-800 border border-slate-700 rounded-lg p-1">
                  <button onClick={() => setActiveView('table')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${activeView === 'table' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>Table View</button>
                  <button onClick={() => setActiveView('json')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${activeView === 'json' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>Raw JSON</button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-900 border border-slate-800 rounded-lg">
              {isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <LoaderIcon className="w-10 h-10 animate-spin text-sky-500 mb-4" />
                  <p className="text-lg">AI is processing the data...</p>
                  <p className="text-sm">This may take a moment.</p>
                </div>
              )}

              {!isLoading && !extractedData && (
                 <div className="flex items-center justify-center h-full text-center text-slate-500 p-8">
                  <div>
                    <p>Your extracted data will appear here.</p>
                    <p className="text-xs mt-2">
                      {selectedHistoryId ? "Viewing a past result." : "Fill out the form and click 'Extract' to begin."}
                    </p>
                  </div>
                </div>
              )}
              
              {!isLoading && extractedData && (
                activeView === 'table' ? (
                  <div className="p-4 space-y-4">
                    <DataTable data={extractedData} editable onChange={setExtractedData as any} />
                    <div className="flex items-center gap-3">
                      <button
                        onClick={async () => {
                          if (!selectedHistoryId) { return; }
                          try {
                            setError(null);
                            const updated = await api.updateHistoryItem(selectedHistoryId, {
                              extractedData: extractedData || [],
                              schema,
                              legacyData,
                              title: legacyData.substring(0, 40).split('\n')[0] + '...',
                              timestamp: new Date().toISOString(),
                            });
                            setHistory((prev) => prev.map(h => h.id === updated.id ? updated : h));
                          } catch (e) {
                            setError(e instanceof Error ? e.message : 'Failed to save changes');
                          }
                        }}
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md text-sm"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => {
                          if (!extractedData) return;
                          const blob = new Blob([JSON.stringify(extractedData, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'extracted-data.json';
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-sm"
                      >
                        Export JSON
                      </button>
                      <button
                        onClick={() => {
                          if (!extractedData) return;
                          const headers = schema.map(s => s.name);
                          const csv = toCSV(extractedData, headers);
                          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'extracted-data.csv';
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-md text-sm"
                      >
                        Export CSV
                      </button>
                      <button
                        onClick={async () => {
                          if (!extractedData) return;
                          try {
                            setError(null);
                            const title = legacyData.substring(0, 40).split('\n')[0] + '...';
                            const safeBase = title.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'extracted-data';
                            const headers = schema.map(s => s.name);
                            const csv = toCSV(extractedData, headers);
                            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${safeBase}.csv`;
                            a.click();
                            URL.revokeObjectURL(url);
                            const fileName = `${safeBase}.csv`;
                            await (await import('../services/docsService')).createDoc({
                              title,
                              content: extractedData,
                              keyPoints: schema.map(s => s.name),
                              fileName,
                            } as any);
                          } catch (e) {
                            setError(e instanceof Error ? e.message : 'Failed to save document');
                          }
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm"
                      >
                        Save as Document
                      </button>
                    </div>
                  </div>
                ) : (
                  <pre className="p-4 text-sm text-green-300 font-mono whitespace-pre-wrap break-all">
                    {JSON.stringify(extractedData, null, 2)}
                  </pre>
                )
              )}
            </div>
          </div>
        </div>
      </main>
    {showProfile && <ProfilePanel onClose={() => setShowProfile(false)} />}
    </div>
  );
};

export default DashboardPage;
