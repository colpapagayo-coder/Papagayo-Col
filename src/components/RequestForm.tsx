import React, { useState, FormEvent } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, Send } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface RequestFormProps {
  initialProduct?: string;
}

export const RequestForm: React.FC<RequestFormProps> = ({ initialProduct = '' }) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [requestedProduct, setRequestedProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Create unique local request object for instant UX
    const newRequest = {
      id: 'req-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now(),
      name,
      email,
      requestedProduct,
      createdAt: new Date().toISOString()
    };

    try {
      let localRequests: any[] = [];
      const saved = localStorage.getItem('papagayo_local_suggestions');
      if (saved) {
        try {
          localRequests = JSON.parse(saved);
        } catch {}
      }
      localRequests.unshift(newRequest);
      localStorage.setItem('papagayo_local_suggestions', JSON.stringify(localRequests));
    } catch (err) {
      console.warn("Could not cache request locally:", err);
    }

    try {
      await addDoc(collection(db, 'product_requests'), {
        name,
        email,
        requestedProduct,
        createdAt: serverTimestamp()
      });

      setSuccess(true);
      setName('');
      setEmail('');
      setRequestedProduct('');
    } catch (error) {
      console.warn("Firestore insertion failed, saved locally instead:", error);
      setSuccess(true);
      setName('');
      setEmail('');
      setRequestedProduct('');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white/60 backdrop-blur-3xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/80 text-center">
        <h3 className="text-2xl font-medium text-[#23493C] mb-4">{t('formSuccessTitle')}</h3>
        <p className="text-[#76736A]">{t('formSuccessDesc')}</p>
        <button onClick={() => setSuccess(false)} className="mt-6 text-[#8B5E34] hover:underline font-medium">{t('formAnother')}</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/60 backdrop-blur-3xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/80">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[#302B27] mb-2">{t('formTitle')}</h2>
        <p className="text-[#76736A] text-sm leading-relaxed">{t('formSubtitle')}</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#76736A] mb-1">{t('formName')}</label>
          <input 
            type="text" 
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#23493C]/20 focus:border-[#23493C] transition-all bg-white/50"
            disabled={loading}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-[#76736A] mb-1">{t('formEmail')}</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#23493C]/20 focus:border-[#23493C] transition-all bg-white/50"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#76736A] mb-1">{t('formDesiredProduct')}</label>
          <textarea 
            required
            value={requestedProduct}
            onChange={(e) => setRequestedProduct(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#23493C]/20 focus:border-[#23493C] transition-all bg-white/50 resize-none"
            placeholder={t('formPlaceholder')}
            disabled={loading}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full mt-2 py-4 rounded-xl bg-[#302B27] text-white font-medium hover:bg-black active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>{t('formSubmit')}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
