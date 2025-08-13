import { Link } from 'wouter';
import { Eye, Trash2, Download, MessageSquare } from 'lucide-react';

const getGradeDescription = (grade: string): string => {
  switch (grade) {
    case 'F0': return 'no fibrosis';
    case 'F1': return 'mild fibrosis (portal fibrosis without septa)';
    case 'F2': return 'moderate fibrosis (portal fibrosis with few septa)';
    case 'F3': return 'severe fibrosis (numerous septa without cirrhosis)';
    case 'F4': return 'cirrhosis (advanced fibrosis with regenerative nodules)';
    default: return 'undetermined fibrosis level';
  }
};

export interface Record {
  id: string;
  displayId?: string;
  originalId?: string;
  patientName: string;
  date: string;
  grade: 'F0' | 'F1' | 'F2' | 'F3' | 'F4';
  confidence?: number;
}

interface RecordsTableProps {
  records: Record[];
  showConfidence?: boolean;
  title?: string;
  isSearchResult?: boolean;
  onViewRecord?: (id: string) => void;
  onDeleteRecord?: (id: string) => void;
  onDownloadRecord?: (id: string) => void;
}

export function RecordsTable({
  records,
  showConfidence = false,
  title = 'Recent Records',
  isSearchResult = false,
  onViewRecord,
  onDeleteRecord,
  onDownloadRecord
}: RecordsTableProps) {
  return (
    <div className="bg-primary-700 rounded-xl border border-primary-600 overflow-hidden shadow-lg">
      <div className="p-6 border-b border-primary-500 flex justify-between items-center bg-primary-800">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        {isSearchResult && (
          <span className="text-primary-200 text-sm font-medium bg-primary-700 px-3 py-1 rounded-full">{records.length} records found</span>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-primary-500">
          <thead className="bg-primary-900">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Patient ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Grade</th>
              {showConfidence && (
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Confidence</th>
              )}
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-primary-700 divide-y divide-primary-600">
            {records.length > 0 ? (
              records.map((record) => (
                <tr key={record.id} className="hover:bg-primary-600 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-white">{record.displayId || record.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{record.patientName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-primary-100">{record.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full grade-${record.grade.toLowerCase()}`}>
                      {record.grade}
                    </span>
                  </td>
                  {showConfidence && record.confidence && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-primary-100">{record.confidence}%</div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-3">
                      <button 
                        className="text-blue-400 hover:text-blue-300 transition-all duration-150 hover:scale-110 p-1 rounded"
                        onClick={() => onViewRecord && onViewRecord(record.originalId || record.id)}
                        title="View Record"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button 
                        className="text-red-400 hover:text-red-300 transition-all duration-150 hover:scale-110 p-1 rounded"
                        onClick={() => onDeleteRecord && onDeleteRecord(record.originalId || record.id)}
                        title="Delete Record"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                      <button 
                        className="text-green-400 hover:text-green-300 transition-all duration-150 hover:scale-110 p-1 rounded"
                        onClick={() => onDownloadRecord && onDownloadRecord(record.originalId || record.id)}
                        title="Download Record"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                      <button 
                        className="text-purple-400 hover:text-purple-300 transition-all duration-150 hover:scale-110 p-1 rounded"
                        onClick={() => {
                          const analysis = `Medical Analysis Report for ${record.patientName}

Patient ID: ${record.displayId || record.id}
Examination Date: ${record.date}
Fibrosis Grade: ${record.grade}
Confidence Level: ${record.confidence || 'N/A'}%

Clinical Assessment:
The liver imaging demonstrates findings consistent with ${record.grade} grade fibrosis. This represents ${getGradeDescription(record.grade)} level of hepatic fibrosis based on established staging criteria.

Recommendations:
- Clinical correlation with patient history and physical examination
- Laboratory studies including liver function tests
- Consider follow-up imaging based on clinical progression
- Patient counseling regarding findings and prognosis

This analysis should be interpreted within the full clinical context and correlated with other diagnostic findings.`;
                          const chatUrl = `/chat?patientId=${record.displayId || record.id}&patientName=${encodeURIComponent(record.patientName)}&grade=${record.grade}&confidence=${record.confidence || ''}&date=${record.date}&analysis=${encodeURIComponent(analysis)}`;
                          window.open(chatUrl, '_blank');
                        }}
                        title="Chat with Dr. Thompson about this case"
                      >
                        <MessageSquare className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={showConfidence ? 6 : 5} className="px-6 py-8 text-center">
                  <div className="text-primary-200 text-lg font-medium">No records found</div>
                  <div className="text-primary-400 text-sm mt-1">Try adjusting your search criteria</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {records.length > 0 && (
        <div className="bg-primary-800 px-6 py-4 border-t border-primary-500 flex items-center justify-between">
          <button className="text-sm font-semibold text-primary-200 hover:text-white transition-colors duration-150 px-3 py-1 rounded">
            Previous
          </button>
          <span className="text-sm text-white font-medium">Page 1 of 1</span>
          <button className="text-sm font-semibold text-primary-200 hover:text-white transition-colors duration-150 px-3 py-1 rounded">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
