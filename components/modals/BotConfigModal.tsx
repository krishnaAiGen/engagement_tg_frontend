// File: frontend/components/modals/BotConfigModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';

// Define the shape of the data this modal will handle
interface BehaviorConfig {
  triage_model?: string;
  random_response_rate?: number;
  min_initiate_hours?: number;
  response_context_messages?: number;
}
interface KeysConfig {
  openai?: { api_key_encrypted?: boolean; encrypted_key?: boolean };
  grok?: { api_key_encrypted?: boolean; encrypted_key?: boolean };
  mem0?: { api_key_encrypted?: boolean; encrypted_key?: boolean };
}

interface BotConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  // This function will be called with the data when the user saves
  onSave: (payload: { keysPayload: any, behaviorPayload: any }) => Promise<void>;
  // We pass the existing config down from the dashboard
  initialBehavior: BehaviorConfig | null;
  existingKeys: KeysConfig | null;
}

export default function BotConfigModal({ isOpen, onClose, onSave, initialBehavior, existingKeys }: BotConfigModalProps) {
  // --- State for each form input ---
  const [openaiKey, setOpenaiKey] = useState('');
  const [grokKey, setGrokKey] = useState('');
  const [mem0Key, setMem0Key] = useState('');
  const [triageModel, setTriageModel] = useState('gpt-3.5-turbo');
  const [responseRate, setResponseRate] = useState(1.0);
  const [initiateHours, setInitiateHours] = useState(3);
  const [contextMessages, setContextMessages] = useState(6);
  const [isSaving, setIsSaving] = useState(false);

  // This effect runs when the modal opens or the initial data changes.
  // It pre-fills the form with the user's saved settings.
  useEffect(() => {
    if (initialBehavior) {
      setTriageModel(initialBehavior.triage_model || 'gpt-3.5-turbo');
      setResponseRate(initialBehavior.random_response_rate || 1.0);
      setInitiateHours(initialBehavior.min_initiate_hours || 3);
      setContextMessages(initialBehavior.response_context_messages || 6);
    }
    // Clear the key fields every time the modal opens so placeholders are visible
    setOpenaiKey('');
    setGrokKey('');
    setMem0Key('');
  }, [initialBehavior, isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    
    // 1. Prepare the payload for API keys
    const keysPayload: any = {};
    if (openaiKey) keysPayload.openai = { api_key: openaiKey };
    if (grokKey) keysPayload.grok = { api_key: grokKey };
    if (mem0Key) keysPayload.mem0 = { api_key: mem0Key };

    // 2. Prepare the payload for behavior settings
    const behaviorPayload = {
      triage_model: triageModel,
      random_response_rate: Number(responseRate),
      min_initiate_hours: Number(initiateHours),
      response_context_messages: Number(contextMessages),
    };

    // 3. Call the onSave function passed down from the dashboard
    await onSave({ keysPayload, behaviorPayload });
    setIsSaving(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bot Configuration" maxWidth="700px">
      <div className="modal-body">
        <p style={{ marginBottom: '20px', color: '#64748B' }}>
          Configure bot behavior and connect AI services. Saved keys appear as '********'. To change a key, enter a new one.
        </p>
        
        <div className="section" style={{ padding: '20px', background: '#F8FAFC' }}>
          <h3>AI Service Keys</h3>
          <div className="form-group">
            <label>OpenAI API Key (Required)</label>
            <input type="password" value={openaiKey} onChange={e => setOpenaiKey(e.target.value)} placeholder={(existingKeys?.openai?.api_key_encrypted || existingKeys?.openai?.encrypted_key) ? '********' : 'sk-...'} />
          </div>
          <div className="form-group">
            <label>Grok (X.AI) API Key</label>
            <input type="password" value={grokKey} onChange={e => setGrokKey(e.target.value)} placeholder={(existingKeys?.grok?.api_key_encrypted || existingKeys?.grok?.encrypted_key) ? '********' : ''} />
          </div>
          <div className="form-group">
            <label>Mem0 API Key</label>
            <input type="password" value={mem0Key} onChange={e => setMem0Key(e.target.value)} placeholder={(existingKeys?.mem0?.api_key_encrypted || existingKeys?.mem0?.encrypted_key) ? '********' : ''} />
          </div>
        </div>

        <div className="section" style={{ padding: '20px', background: '#F8FAFC', marginTop: '20px' }}>
          <h3>Behavior Settings</h3>
          <div className="form-group">
            <label>Triage Model</label>
            <select className='w-full p-2 border rounded' value={triageModel} onChange={e => setTriageModel(e.target.value)}>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-4-turbo-preview">GPT-4 Turbo</option>
            </select>
          </div>
          <div className="form-group">
            <label>Response Rate (0.1 to 1.0)</label>
            <input type="number" value={responseRate} onChange={e => setResponseRate(Number(e.target.value))} min="0.1" max="1.0" step="0.1" />
          </div>
          <div className="form-group">
            <label>Topic Initiation (Hours)</label>
            <input type="number" value={initiateHours} onChange={e => setInitiateHours(Number(e.target.value))} min="1" step="1" />
          </div>
          <div className="form-group">
            <label>Conversation Context (Messages)</label>
            <input type="number" value={contextMessages} onChange={e => setContextMessages(Number(e.target.value))} min="1" max="20" step="1" />
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button onClick={onClose} className="btn btn-secondary" disabled={isSaving}>Cancel</button>
        <button onClick={handleSave} className="btn btn-primary" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save & Continue to Connections'}
        </button>
      </div>
    </Modal>
  );
}