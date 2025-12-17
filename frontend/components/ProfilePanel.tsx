import React, { useEffect, useState } from 'react';
import * as users from '../services/usersService';
import * as docs from '../services/docsService';

interface ProfilePanelProps {
  onClose: () => void;
}

const ProfilePanel: React.FC<ProfilePanelProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<users.UserProfile | null>(null);
  const [docList, setDocList] = useState<docs.DocItem[]>([]);
  const [form, setForm] = useState<{ companyName: string; companyDomain?: string; contactName: string }>({ companyName: '', contactName: '', companyDomain: '' });

  useEffect(() => {
    (async () => {
      try {
        const me = await users.getMe();
        setProfile(me);
        setForm({ companyName: me.companyName, companyDomain: me.companyDomain, contactName: me.contactName });
        try {
          const docsList = await docs.listDocs();
          setDocList(docsList);
        } catch (e) {
          // If documents endpoint fails (e.g., 404 on older server), don't block profile display
          setDocList([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    try {
      setError(null);
      const updated = await users.updateMe(form);
      setProfile(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1" onClick={onClose} />
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 shadow-xl overflow-y-auto">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-200">Profile</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">Close</button>
        </div>
        <div className="p-4 space-y-6">
          {loading ? (
            <p className="text-slate-400">Loading...</p>
          ) : (
            <>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              {profile && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400">Email</label>
                    <p className="text-slate-200 text-sm">{profile.email}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <input className="p-2 bg-slate-800 border border-slate-700 rounded-md text-sm" placeholder="Company Name" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
                    <input className="p-2 bg-slate-800 border border-slate-700 rounded-md text-sm" placeholder="Company Domain" value={form.companyDomain || ''} onChange={(e) => setForm({ ...form, companyDomain: e.target.value })} />
                    <input className="p-2 bg-slate-800 border border-slate-700 rounded-md text-sm" placeholder="Contact Name" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
                  </div>
                  <div>
                    <button onClick={handleSave} className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md text-sm">Save Profile</button>
                  </div>
                </div>
              )}
              <div>
                <h3 className="text-md font-semibold text-slate-200 mb-2">Documents</h3>
                {docList.length === 0 ? (
                  <p className="text-slate-500 text-sm">No documents yet. Save extracted data as documents.</p>
                ) : (
                  <ul className="divide-y divide-slate-800">
                    {docList.map(d => (
                      <li key={d._id} className="py-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-200">{d.title}</p>
                            <p className="text-xs text-slate-500">{d.fileName ? `File: ${d.fileName} • ` : ''}Updated {new Date(d.updatedAt).toLocaleString()}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePanel;