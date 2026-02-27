'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  HeartIcon, 
  PillIcon, 
  ClipboardDocumentListIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';

interface PatientDashboardProps {
  token: string;
  patientId: string;
}

export const PatientDashboard = ({ token, patientId }: PatientDashboardProps) => {
  const [summary, setSummary] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'timeline' | 'entities'>('summary');

  useEffect(() => {
    fetchPatientData();
  }, [patientId, token]);

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      const [summaryRes, timelineRes] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/medical/patients/${patientId}/summary`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/medical/patients/${patientId}/timeline`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ),
      ]);

      const summaryData = await summaryRes.json();
      const timelineData = await timelineRes.json();

      setSummary(summaryData);
      setTimeline(timelineData);
    } catch (err) {
      console.error('Failed to fetch patient data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading patient data...</div>;
  }

  return (
    <div>
      <div className="flex space-x-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'summary'
              ? 'border-b-2 border-primary-500 text-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Summary
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'timeline'
              ? 'border-b-2 border-primary-500 text-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Timeline
        </button>
        <button
          onClick={() => setActiveTab('entities')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'entities'
              ? 'border-b-2 border-primary-500 text-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Entities
        </button>
      </div>

      {activeTab === 'summary' && summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SummaryCard
            title="Conditions"
            items={summary.conditions}
            icon={HeartIcon}
            color="red"
          />
          <SummaryCard
            title="Medications"
            items={summary.medications}
            icon={PillIcon}
            color="blue"
          />
          <SummaryCard
            title="Procedures"
            items={summary.procedures}
            icon={ClipboardDocumentListIcon}
            color="green"
          />
          <SummaryCard
            title="Allergies"
            items={summary.allergies}
            icon={HeartIcon}
            color="yellow"
          />
          <SummaryCard
            title="Lab Results"
            items={summary.labResults}
            icon={ClipboardDocumentListIcon}
            color="purple"
          />
          <SummaryCard
            title="Vital Signs"
            items={summary.vitalSigns}
            icon={ClockIcon}
            color="indigo"
          />
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="space-y-4">
          {timeline.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No timeline events found</p>
          ) : (
            timeline.map((event) => (
              <div
                key={event.id}
                className="border-l-4 border-primary-500 pl-4 py-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-600">{event.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(event.date), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {event.source}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'entities' && summary && (
        <div className="space-y-6">
          {Object.entries(summary).map(([key, items]: [string, any]) => (
            <div key={key}>
              <h3 className="font-semibold text-lg mb-2 capitalize">{key}</h3>
              {items && items.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {items.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="border rounded p-3 hover:bg-gray-50"
                    >
                      <p className="font-medium">{item.display || item.name}</p>
                      {item.code && (
                        <p className="text-sm text-gray-500">
                          Code: {item.code} ({item.codeSystem})
                        </p>
                      )}
                      {item.status && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mt-1 inline-block">
                          {item.status}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No {key} found</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({
  title,
  items,
  icon: Icon,
  color,
}: {
  title: string;
  items: any[];
  icon: any;
  color: string;
}) => {
  const colorClasses: Record<string, string> = {
    red: 'bg-red-100 text-red-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    indigo: 'bg-indigo-100 text-indigo-600',
  };

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <Icon className={`h-6 w-6 ${colorClasses[color]}`} />
      </div>
      <p className="text-3xl font-bold text-gray-900">{items?.length || 0}</p>
      {items && items.length > 0 && (
        <div className="mt-2 space-y-1">
          {items.slice(0, 3).map((item: any, index: number) => (
            <p key={index} className="text-sm text-gray-600 truncate">
              {item.display || item.name}
            </p>
          ))}
          {items.length > 3 && (
            <p className="text-xs text-gray-500">+{items.length - 3} more</p>
          )}
        </div>
      )}
    </div>
  );
};
