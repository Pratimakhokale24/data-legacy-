
import React from 'react';
import type { ExtractedRecord } from '../types';

interface DataTableProps {
  data: ExtractedRecord[];
  editable?: boolean;
  onChange?: (data: ExtractedRecord[]) => void;
}

const DataTable: React.FC<DataTableProps> = ({ data, editable = false, onChange }) => {
  if (!data || data.length === 0) {
    return <p className="p-4 text-center text-slate-500">No data to display.</p>;
  }

  const headers = Object.keys(data[0]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-800">
        <thead className="bg-slate-800/50">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-slate-900 divide-y divide-slate-800">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-slate-800/50 transition-colors">
              {headers.map((header) => (
                <td
                  key={`${rowIndex}-${header}`}
                  className="px-6 py-4 whitespace-nowrap text-sm text-slate-300"
                >
                  {editable ? (
                    <input
                      className="w-full bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-slate-200 text-sm"
                      value={String(row[header] ?? '')}
                      onChange={(e) => {
                        const next = data.map((r, i) => i === rowIndex ? { ...r, [header]: e.target.value } : r);
                        onChange?.(next);
                      }}
                    />
                  ) : (
                    row[header]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
