'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Entry {
  id: string;
  sequentialNumber: number;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
  validatedAt: string | null;
  screenshotUrl: string;
  consentGiven: boolean;
}

interface Stats {
  pending: number;
  validated: number;
  rejected: number;
  total: number;
}

export default function LemFiAdminPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<'validate' | 'reject'>('validate');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [screenshotFullscreen, setScreenshotFullscreen] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter && filter !== 'all') params.append('status', filter);
      if (search) params.append('search', search);
      params.append('limit', String(limit));
      params.append('offset', String(offset));

      const res = await fetch(`/api/admin/lemfi-contest?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/admin/login');
          return;
        }
        throw new Error(data.error || 'Failed to fetch entries');
      }

      setEntries(data.entries);
      setStats(data.stats);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filter, search, offset, router]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleAction = async () => {
    if (!selectedEntry) return;

    if (actionType === 'reject' && !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/admin/lemfi-contest/${selectedEntry.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          reason: actionType === 'reject' ? rejectionReason : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Action failed');
      }

      // Update entry in list
      setEntries((prev) =>
        prev.map((e) =>
          e.id === selectedEntry.id
            ? {
                ...e,
                status: data.entry.status,
                rejectionReason: data.entry.rejectionReason,
                validatedAt: actionType === 'validate' ? new Date().toISOString() : e.validatedAt,
              }
            : e
        )
      );

      setShowModal(false);
      setSelectedEntry(null);
      setRejectionReason('');

      // Refresh stats
      await fetchEntries();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const displayNumber = (num: number) => `LU${num}`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR');

  const total = stats?.total || 0;
  const hasMore = total > offset + limit;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Concours Level Up × LemFi
          </h1>
          <p className="text-gray-600 mt-2">Gestion des inscriptions</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-4xl font-bold text-blue-600">{stats.pending}</div>
              <p className="text-gray-600 mt-2">En attente</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-4xl font-bold text-green-600">{stats.validated}</div>
              <p className="text-gray-600 mt-2">Validées</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-4xl font-bold text-red-600">{stats.rejected}</div>
              <p className="text-gray-600 mt-2">Refusées</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-4xl font-bold text-gray-900">{stats.total} / 151</div>
              <p className="text-gray-600 mt-2">Total</p>
              {stats.total >= 151 && (
                <p className="text-red-600 text-sm font-semibold mt-2">Complet !</p>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filter by status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setOffset(0);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Tous</option>
                <option value="pending">En attente</option>
                <option value="validated">Validées</option>
                <option value="rejected">Refusées</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher
              </label>
              <input
                type="text"
                placeholder="Nom, email ou numéro LU..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setOffset(0);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Reset */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilter('');
                  setSearch('');
                  setOffset(0);
                }}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <p className="text-gray-600 mt-4">Chargement...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">Aucune inscription trouvée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Numéro
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-bold text-orange-600">
                        {displayNumber(entry.sequentialNumber)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {entry.firstName} {entry.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <a
                          href={`mailto:${entry.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {entry.email}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(entry.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            entry.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : entry.status === 'validated'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {entry.status === 'pending'
                            ? 'En attente'
                            : entry.status === 'validated'
                            ? 'Validée'
                            : 'Refusée'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedEntry(entry);
                            setShowModal(true);
                            setActionType('validate');
                          }}
                          className="text-blue-600 hover:text-blue-800 font-semibold text-sm mr-3"
                        >
                          Détails
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {entries.length > 0 && (
            <div className="px-6 py-4 border-t flex justify-between items-center">
              <button
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
                className="disabled:opacity-50 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition"
              >
                Précédent
              </button>
              <p className="text-gray-600">
                {offset + 1} - {Math.min(offset + limit, total)} sur {total}
              </p>
              <button
                onClick={() => setOffset(offset + limit)}
                disabled={!hasMore}
                className="disabled:opacity-50 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition"
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {displayNumber(selectedEntry.sequentialNumber)} - {selectedEntry.firstName} {selectedEntry.lastName}
            </h2>

            {/* Screenshot */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Capture d'écran</h3>
              <button
                onClick={() => setScreenshotFullscreen(selectedEntry.screenshotUrl)}
                className="max-w-full max-h-48 rounded border border-gray-300 hover:opacity-75 transition"
              >
                <img
                  src={selectedEntry.screenshotUrl}
                  alt="Screenshot"
                  className="max-w-full max-h-48 rounded"
                />
              </button>
            </div>

            {/* Info */}
            <div className="mb-6 bg-gray-50 p-4 rounded">
              <p className="text-sm mb-2">
                <span className="font-semibold">Email:</span> {selectedEntry.email}
              </p>
              <p className="text-sm mb-2">
                <span className="font-semibold">Inscrit le:</span> {formatDate(selectedEntry.createdAt)}
              </p>
              {selectedEntry.status === 'rejected' && selectedEntry.rejectionReason && (
                <p className="text-sm text-red-600">
                  <span className="font-semibold">Motif du refus:</span> {selectedEntry.rejectionReason}
                </p>
              )}
            </div>

            {/* Actions */}
            {selectedEntry.status === 'pending' && (
              <div className="space-y-4">
                {/* Validate */}
                <button
                  onClick={() => {
                    setActionType('validate');
                    handleAction();
                  }}
                  disabled={submitting}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition"
                >
                  {submitting && actionType === 'validate' ? 'Validation...' : 'Valider'}
                </button>

                {/* Reject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ou refuser avec motif:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Motif du refus..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                    <button
                      onClick={() => {
                        setActionType('reject');
                        handleAction();
                      }}
                      disabled={submitting || !rejectionReason.trim()}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition"
                    >
                      {submitting && actionType === 'reject' ? 'Refus...' : 'Refuser'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {selectedEntry.status !== 'pending' && (
              <div className="bg-gray-100 p-4 rounded text-center">
                <p className="text-gray-600 font-semibold">
                  Cette participation a déjà été {selectedEntry.status === 'validated' ? 'validée' : 'refusée'}.
                </p>
              </div>
            )}

            {/* Close */}
            <button
              onClick={() => {
                setShowModal(false);
                setSelectedEntry(null);
                setRejectionReason('');
              }}
              className="w-full mt-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen screenshot */}
      {screenshotFullscreen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50"
          onClick={() => setScreenshotFullscreen(null)}
        >
          <button
            onClick={() => setScreenshotFullscreen(null)}
            className="absolute top-4 right-4 bg-white text-black font-bold px-4 py-2 rounded"
          >
            Fermer (ESC)
          </button>
          <img
            src={screenshotFullscreen}
            alt="Screenshot full"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}
