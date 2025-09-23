// File: frontend/components/modals/SlackSettingsModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { apiRequest } from '@/lib/api';

interface SlackSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void; // Function to tell the parent to refresh
  token: string | null;
}

export default function SlackSettingsModal({ isOpen, onClose, onSave, token }: SlackSettingsModalProps) {
  const [botToken, setBotToken] = useState('');
  const [appToken, setAppToken] = useState('');
  const [channelId, setChannelId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch existing settings when the modal opens
  useEffect(() => {
    if (isOpen && token) {
      const fetchSlackConfig = async () => {
        try {
          const config = await apiRequest('/api/connections/slack', 'GET', token);
          if (config) {
            setChannelId(config.channel_id || '');
            // We don't pre-fill tokens for security
          }
        } catch (err) {
          console.error("No existing Slack config found, which is okay.");
        }
      };
      fetchSlackConfig();
    }
  }, [isOpen, token]);

  const handleSave = async () => {
    if (!botToken || !appToken || !channelId) {
      setError('All fields are required.');
      return;
    }
    if (!token) return;

    setIsSaving(true);
    setError('');
    try {
      const body = {
        bot_token: botToken,
        app_token: appToken,
        channel_id: channelId,
      };
      await apiRequest('/api/connections/slack', 'PUT', token, body);
      onSave(); // Tell the parent we've saved successfully
      onClose();
    } catch (err) {
      if (err instanceof Error) setError(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Slack Settings">
      <div className="modal-body">
        <p>Enter your Slack app credentials. These will be stored securely.</p>
        {error && <p style={{ color: 'var(--danger-color)' }}>{error}</p>}
        <div className="form-group">
          <label>Bot Token (starts with 'xoxb-')</label>
          <input type="password" value={botToken} onChange={e => setBotToken(e.target.value)} />
        </div>
        <div className="form-group">
          <label>App-Level Token (starts with 'xapp-')</label>
          <input type="password" value={appToken} onChange={e => setAppToken(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Target Channel ID</label>
          <input type="text" value={channelId} onChange={e => setChannelId(e.target.value)} placeholder="e.g., C012345XYZ" />
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