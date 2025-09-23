// File: frontend/components/modals/DiscordSettingsModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { apiRequest } from '@/lib/api';

interface DiscordSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  token: string | null;
}

export default function DiscordSettingsModal({ isOpen, onClose, onSave, token }: DiscordSettingsModalProps) {
  const [botToken, setBotToken] = useState('');
  const [channelId, setChannelId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && token) {
      const fetchDiscordConfig = async () => {
        try {
          const config = await apiRequest('/api/connections/discord', 'GET', token);
          if (config) {
            setChannelId(config.channel_id || '');
          }
        } catch (err) {
           console.error("No existing Discord config found, which is okay.");
        }
      };
      fetchDiscordConfig();
    }
  }, [isOpen, token]);

  // --- THIS IS THE CORRECTED FUNCTION ---
  const handleSave = async () => {
    if (!botToken || !channelId) {
      setError('Both fields are required.');
      return;
    }
    if (!token) return;

    setIsSaving(true);
    setError('');
    try {
      const body = { bot_token: botToken, channel_id: channelId };
      await apiRequest('/api/connections/discord', 'PUT', token, body);
      onSave();
      onClose();
    } catch (err) {
      if (err instanceof Error) setError(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Discord Settings">
      <div className="modal-body">
        <p>Enter your Discord bot credentials.</p>
        {error && <p style={{ color: 'var(--danger-color)' }}>{error}</p>}
        <div className="form-group">
          <label>Bot Token</label>
          <input type="password" value={botToken} onChange={e => setBotToken(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Target Channel ID</label>
          <input type="text" value={channelId} onChange={e => setChannelId(e.target.value)} placeholder="e.g., 10987654321" />
        </div>
      </div>
      <div className="modal-footer">
        <button onClick={onClose} className="btn btn-secondary" disabled={isSaving}>Cancel</button>
        <button onClick={handleSave} className="btn btn-primary" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save & Connect'}
        </button>
      </div>
    </Modal>
  );
}