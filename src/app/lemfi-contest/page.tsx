'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LemFiContestPage() {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    consentGiven: false,
  });
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{
    displayNumber: string;
    accessToken: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Only JPG, PNG, and WebP formats are allowed');
      return;
    }

    // Validate size (5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be smaller than 5 MB');
      return;
    }

    setScreenshot(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setScreenshotPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate
      if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
        throw new Error('Please fill in all fields');
      }

      if (!screenshot) {
        throw new Error('Please upload a screenshot');
      }

      if (!formData.consentGiven) {
        throw new Error('You must accept the conditions to participate');
      }

      // Create FormData
      const form = new FormData();
      form.append('firstName', formData.firstName);
      form.append('lastName', formData.lastName);
      form.append('email', formData.email);
      form.append('consentGiven', String(formData.consentGiven));
      form.append('screenshot', screenshot);

      // Submit
      const res = await fetch('/api/lemfi-contest/register', {
        method: 'POST',
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.isFull) {
          throw new Error('Inscriptions complètes');
        }
        throw new Error(data.error || 'Submission failed');
      }

      setSuccess(data);
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success' && success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-5xl mb-6">🎉</div>
            <h1 className="text-3xl font-bold text-orange-600 mb-4">
              Participation reçue !
            </h1>
            <div className="bg-orange-100 border-2 border-orange-500 rounded-lg p-6 mb-6">
              <p className="text-gray-700 mb-2">Votre numéro est</p>
              <p className="text-4xl font-bold text-orange-600">{success.displayNumber}</p>
            </div>
            <p className="text-gray-700 mb-6">
              Votre éligibilité au tirage sera confirmée après vérification de votre preuve.
            </p>
            <p className="text-gray-600 mb-6">
              Un e-mail de confirmation avec votre numéro a été envoyé à <strong>{formData.email}</strong>
            </p>
            <p className="text-gray-600 mb-8">
              Vous pouvez suivre votre participation via le lien sécurisé reçu par e-mail.
            </p>
            <a
              href="/"
              className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              Retour à l'accueil
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Level Up in Germany × LemFi
          </h1>
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-8 rounded">
            <p className="text-red-800 font-semibold">
              Concours réservé aux personnes qui participeront à Level Up in Germany.
            </p>
          </div>
          <div className="bg-orange-50 border border-orange-200 p-6 rounded-lg mb-8">
            <p className="text-gray-800 text-lg leading-relaxed">
              Level Up, c'est aussi reconnaître les efforts de nos parents et de celles et ceux qui ont
              toujours été là pour nous. Faites plaisir à votre personne préférée et tentez de gagner une
              tablette, des AirPods, des parapluies, des t-shirts et d'autres surprises le jour de Level Up
              in Germany !
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {/* Step 1 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="bg-orange-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mb-4">
              1
            </div>
            <h3 className="font-bold text-lg mb-2">Téléchargez LemFi</h3>
            <p className="text-gray-600 text-sm mb-4">
              Cliquez sur le bouton ci-dessous pour télécharger l'application LemFi.
            </p>
            <a
              href="[LIEN_PARTENAIRE_LEMFI]"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded transition text-sm"
            >
              Télécharger LemFi
            </a>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="bg-orange-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mb-4">
              2
            </div>
            <h3 className="font-bold text-lg mb-2">Effectuez un transfert</h3>
            <p className="text-gray-600 text-sm mb-2">
              Transférez au moins <strong>10 €</strong> avec le code <strong>LEVELUP</strong>.
            </p>
            <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
              <p className="text-green-800">
                <strong>💰 Recevez 25 % de cashback</strong>
              </p>
              <p className="text-gray-600 text-xs mt-1">
                (Conditions à confirmer)
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="bg-orange-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mb-4">
              3
            </div>
            <h3 className="font-bold text-lg mb-2">Inscrivez-vous</h3>
            <p className="text-gray-600 text-sm">
              Remplissez ce formulaire et envoyez votre capture de confirmation.
            </p>
            <p className="text-blue-600 text-xs mt-3">
              👉 Vous utilisez déjà LemFi ?<br />
              <strong>Passez directement aux étapes 2 et 3</strong>
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Formulaire d'inscription</h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse e-mail <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            {/* Screenshot upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capture de confirmation du transfert <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition cursor-pointer"
                onClick={() => fileInputRef.current?.click()}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {screenshotPreview ? (
                  <div className="space-y-4">
                    <img
                      src={screenshotPreview}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded"
                    />
                    <p className="text-sm text-gray-600">
                      {screenshot?.name} ({(screenshot!.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="text-orange-600 hover:text-orange-700 font-semibold text-sm"
                    >
                      Remplacer le fichier
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-2xl mb-2">📸</p>
                    <p className="text-gray-600 mb-1">Cliquez pour ajouter votre capture</p>
                    <p className="text-xs text-gray-500">JPG, PNG ou WebP - Max 5 MB</p>
                  </div>
                )}
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded p-4 mt-4 text-sm">
                <p className="text-blue-900 font-semibold mb-2">📋 Instructions:</p>
                <ul className="text-blue-800 space-y-1 text-xs">
                  <li>✅ Laissez visibles: montant, date, confirmation du transfert</li>
                  <li>❌ Masquez: solde et informations sensibles</li>
                </ul>
              </div>
            </div>

            {/* Consent */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="consentGiven"
                  checked={formData.consentGiven}
                  onChange={handleInputChange}
                  className="mt-1 rounded border-gray-300"
                  required
                />
                <span className="text-sm text-gray-700">
                  Je confirme ma présence prévue à l'événement Level Up in Germany, respecte les conditions du
                  concours et accepte l'utilisation de mes données pour gérer cette participation.{' '}
                  <a href="/privacy" className="text-orange-600 hover:underline" target="_blank">
                    Consulter la notice de confidentialité
                  </a>
                  . <span className="text-red-500">*</span>
                </span>
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              {loading ? 'Envoi en cours...' : 'Envoyer ma participation'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-600">À vous de jouer ! 🎮</p>
        </div>
      </div>
    </div>
  );
}
