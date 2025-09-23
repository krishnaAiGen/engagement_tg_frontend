// File: frontend/components/modals/TelegramLoginModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { apiRequest } from '@/lib/api';

type LoginStep = 'credentials' | 'code' | 'password';
export type AccountType = 'ingestor' | 'sender';

interface TelegramLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (accountData: any, type: AccountType, name?: string) => void; // Send back all necessary data
  token: string | null;
  accountType: AccountType | null; // 'ingestor' or 'sender'
}

export default function TelegramLoginModal({ isOpen, onClose, onSuccess, token, accountType }: TelegramLoginModalProps) {
  const [step, setStep] = useState<LoginStep>('credentials');
  const [phone, setPhone] = useState('');
  const [apiId, setApiId] = useState('');
  const [apiHash, setApiHash] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [senderName, setSenderName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Reset state whenever the modal is opened for a new purpose
  useEffect(() => {
    if (isOpen) {
      setStep('credentials');
      setPhone(''); setApiId(''); setApiHash(''); setCode(''); setPassword('');
      setSenderName(''); setError(''); setIsProcessing(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  const handleNext = async () => {
    if (!token || !accountType) return;
    if (accountType === 'sender' && !senderName.trim() && step === 'credentials') {
      setError("A unique sender name is required.");
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      let response;
      if (step === 'credentials') {
        const body = { api_id: apiId, api_hash: apiHash, phone_number: phone };
        response = await apiRequest('/api/connections/telegram/start_auth', 'POST', token, body);
      } else if (step === 'code') {
        response = await apiRequest('/api/connections/telegram/submit_code', 'POST', token, { code });
      } else { // password
        response = await apiRequest('/api/connections/telegram/submit_password', 'POST', token, { password });
      }

      if (response.status === 'code_needed') {
        setStep('code');
      } else if (response.status === 'password_needed') {
        setStep('password');
      } else if (response.status === 'success') {
        // --- THIS IS THE KEY CHANGE ---
        // We now pass all the data back up to the parent settings modal.
        onSuccess(response, accountType, senderName);
        handleClose();
      }
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const getTitle = () => {
    if (accountType === 'ingestor') return 'Connect Listener (Ingestor) Account';
    if (accountType === 'sender') return 'Connect Sender Account';
    return 'Connect Telegram Account';
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={getTitle()}>
      <div className="modal-body">
        {error && <p style={{ color: 'var(--danger-color)', marginBottom: '1rem' }}>{error}</p>}

        {step === 'credentials' && (
          <div>
            {accountType === 'sender' && (
              <div className="form-group">
                <label>Unique Sender Name</label>
                <input type="text" value={senderName} onChange={e => setSenderName(e.target.value)} placeholder="e.g., bot_sender_1, marketing_acct"/>
              </div>
            )}
            <div className="form-group"><label>API ID</label><input type="text" value={apiId} onChange={e => setApiId(e.target.value)} /></div>
            <div className="form-group"><label>API Hash</label><input type="text" value={apiHash} onChange={e => setApiHash(e.target.value)} /></div>
            <div className="form-group"><label>Phone Number</label><input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1234567890" /></div>
          </div>
        )}
        {step === 'code' && ( <div className="form-group"><label>Code from Telegram</label><input type="text" value={code} onChange={e => setCode(e.target.value)} /></div> )}
        {step === 'password' && ( <div className="form-group"><label>2FA Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} /></div> )}
      </div>
      <div className="modal-footer">
        <button onClick={handleClose} className="btn btn-secondary" disabled={isProcessing}>Cancel</button>
        <button onClick={handleNext} className="btn btn-primary" disabled={isProcessing}>
          {isProcessing ? 'Connecting...' : 'Next'}
        </button>
      </div>
    </Modal>
  );
}