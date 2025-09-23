// File: frontend/components/modals/ApiKeyModal.tsx
'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => Promise<void>; // A function to handle the save logic
}

export default function ApiKeyModal({ isOpen, onClose, onSave }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(apiKey);
    setSaving(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="OpenAI API Key Required">
      <div className="modal-body">
        <p>To generate AI personas, this application needs your OpenAI API key.</p>
        <div className="form-group">
          <label htmlFor="openai-api-key">Your OpenAI API Key</label>
          <input
            type="password"
            id="openai-api-key"
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>
      </div>
      <div className="modal-footer">
        <button onClick={onClose} className="btn btn-secondary" disabled={saving}>Cancel</button>
        <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save and Continue'}
        </button>
      </div>
    </Modal>
  );
}