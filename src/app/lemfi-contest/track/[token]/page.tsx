'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Entry {
  displayNumber: string;
  firstName: string;
  lastName: string;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
  validatedAt: string | null;
  rejectedAt: string | null;
}

export default function TrackContestPage() {
  const params = useParams();
  const token = params.token as string;

  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        if (!token) {
          setError('Invalid access link');
          return;
        }

        const res = await fetch(`/api/lemfi-contest/track/${token}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Could not find entry');
          return;
        }

        setEntry(data.entry);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <p className="text-gray-600 mt-4">Chargement de votre participation...</p>
        </div>
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-5xl mb-6">❌</div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Participation introuvable
            </h1>
            <p className="text-gray-700 mb-8">
              {error || 'Nous n\'avons pas pu trouver votre participation. Vérifiez votre lien de suivi.'}
            </p>
            <Link
              href="/lemfi-contest"
              className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              Retour au formulaire d'inscription
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Suivi de votre participation
          </h1>

          {/* Participant Info */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <p className="text-gray-700 mb-2">
              <span className="font-semibold">Participant:</span> {entry.firstName} {entry.lastName}
            </p>
            <p className="text-gray-700 mb-2">
              <span className="font-semibold">Numéro:</span> <span className="text-2xl font-bold text-orange-600">{entry.displayNumber}</span>
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Inscrit le:</span> {new Date(entry.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>

          {/* Status */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">État de votre participation</h2>

            {entry.status === 'pending' && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded">
                <div className="flex items-start">
                  <div className="text-2xl mr-4">⏳</div>
                  <div>
                    <h3 className="font-bold text-yellow-800 mb-2">En attente de vérification</h3>
                    <p className="text-yellow-700 text-sm mb-3">
                      Votre participation est en cours de vérification. Notre équipe examinera votre preuve de transfert.
                    </p>
                    <p className="text-yellow-700 text-xs">
                      Nous vous enverrons un e-mail de confirmation dès que votre participation sera validée.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {entry.status === 'validated' && (
              <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded">
                <div className="flex items-start">
                  <div className="text-2xl mr-4">✅</div>
                  <div>
                    <h3 className="font-bold text-green-800 mb-2">Participation validée !</h3>
                    <p className="text-green-700 text-sm">
                      Felicitations ! Vous êtes éligible au tirage au sort. Le tirage aura lieu le jour de Level Up in Germany.
                    </p>
                    {entry.validatedAt && (
                      <p className="text-green-700 text-xs mt-2">
                        Validée le: {new Date(entry.validatedAt).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {entry.status === 'rejected' && (
              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded">
                <div className="flex items-start">
                  <div className="text-2xl mr-4">❌</div>
                  <div>
                    <h3 className="font-bold text-red-800 mb-2">Participation refusée</h3>
                    {entry.rejectionReason && (
                      <p className="text-red-700 text-sm mb-3">
                        <span className="font-semibold">Raison:</span> {entry.rejectionReason}
                      </p>
                    )}
                    <p className="text-red-700 text-sm">
                      Si vous avez des questions, veuillez nous contacter.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="border-t pt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Historique</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-orange-600 rounded-full mt-2"></div>
                  <div className="w-1 h-12 bg-gray-300"></div>
                </div>
                <div className="ml-6">
                  <p className="font-semibold text-gray-900">Inscription reçue</p>
                  <p className="text-gray-600 text-sm">{new Date(entry.createdAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>

              {entry.validatedAt && (
                <div className="flex items-start">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-green-600 rounded-full mt-2"></div>
                  </div>
                  <div className="ml-6">
                    <p className="font-semibold text-gray-900">Participation validée</p>
                    <p className="text-gray-600 text-sm">{new Date(entry.validatedAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              )}

              {entry.rejectedAt && (
                <div className="flex items-start">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-red-600 rounded-full mt-2"></div>
                  </div>
                  <div className="ml-6">
                    <p className="font-semibold text-gray-900">Participation refusée</p>
                    <p className="text-gray-600 text-sm">{new Date(entry.rejectedAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center pt-8 border-t">
            <p className="text-gray-600 text-sm mb-4">
              Avez-vous des questions ?
            </p>
            <a
              href="mailto:levelupdiaspo@gmail.com"
              className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-lg transition"
            >
              Nous contacter
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
