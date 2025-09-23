// File: frontend/components/modals/TelegramSettingsModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import TelegramLoginModal, { AccountType } from './TelegramLoginModal';
import { apiRequest } from '@/lib/api';

interface TelegramSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  token: string | null;
}

export default function TelegramSettingsModal({ isOpen, onClose, onSave, token }: TelegramSettingsModalProps) {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoginWizardOpen, setIsLoginWizardOpen] = useState(false);
  const [loginAccountType, setLoginAccountType] = useState<AccountType | null>(null);

  const fetchSettings = async () => {
    if (!token || !isOpen) return;
    setLoading(true);
    try {
      const data = await apiRequest('/api/connections/telegram', 'GET', token);
      setSettings(data || {});
    } catch (err) {
      console.error("Failed to fetch Telegram settings:", err);
      setSettings({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [isOpen, token]);

  const handleOpenLoginWizard = (type: AccountType) => {
    setLoginAccountType(type);
    setIsLoginWizardOpen(true);
  };

  const handleLoginSuccess = (accountData: any, type: AccountType, name?: string) => {
    const { session_string_encrypted, api_id, api_hash } = accountData;
    const newConfig = { session_string_encrypted, api_id, api_hash };

    setSettings((prev: any) => {
      const newSettings = { ...prev };
      if (type === 'ingestor') {
        newSettings.ingestor_config = newConfig;
      } else if (type === 'sender' && name) {
        if (!newSettings.senders_config) {
          newSettings.senders_config = {};
        }
        newSettings.senders_config[name] = newConfig;
      }
      return newSettings;
    });
  };
  
  const handleRemoveAccount = (type: AccountType, name?: string) => {
    if (!window.confirm(`Are you sure you want to remove this ${name || type}?`)) return;
    
    setSettings((prev: any) => {
      const newSettings = { ...prev };
      if (type === 'ingestor') {
        delete newSettings.ingestor_config;
      } else if (type === 'sender' && name && newSettings.senders_config) {
        delete newSettings.senders_config[name];
      }
      return newSettings;
    });
  };

  const handleSave = async () => {
    if (!token) return;
    setIsSaving(true);
    try {
      await apiRequest('/api/connections/telegram', 'PUT', token, settings);
      onSave();
      onClose();
    } catch (err) {
      alert(`Failed to save: ${err instanceof Error ? err.message : 'Unknown'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Telegram Settings" maxWidth="700px">
        <div className="modal-body">
          {loading ? ( <p>Loading...</p> ) : (
            <>
              <div className="form-group">
                <label>Target Group ID</label>
                <input type="text" value={settings.telegram_group_id || ''} onChange={e => handleChange('telegram_group_id', e.target.value)} />
              </div>
              
              <div className="connection-section">
                <label>Listener (Ingestor) Account</label>
                <div className="connection-status">
                  <span className={`status-badge ${settings.ingestor_config ? 'connected' : 'disconnected'}`}>{settings.ingestor_config ? 'Connected' : 'Not Connected'}</span>
                  <div>
                    {settings.ingestor_config && <button onClick={() => handleRemoveAccount('ingestor')} className="btn btn-danger btn-sm" style={{marginRight: '10px'}}>Remove</button>}
                    <button onClick={() => handleOpenLoginWizard('ingestor')} className="btn btn-secondary btn-sm">{settings.ingestor_config ? 'Reconnect' : 'Connect'}</button>
                  </div>
                </div>
              </div>
              
              <div className="connection-section">
                <label>Sender Accounts</label>
                {(Object.keys(settings.senders_config || {})).map(name => (
                  <div key={name} className="connection-status" style={{marginBottom: '10px'}}>
                    <span>{name}</span>
                    <div>
                      <span className="status-badge connected">Connected</span>
                      <button onClick={() => handleRemoveAccount('sender', name)} className="btn btn-danger btn-sm" style={{marginLeft: '10px'}}>Remove</button>
                    </div>
                  </div>
                ))}
                <button onClick={() => handleOpenLoginWizard('sender')} className="btn btn-secondary btn-sm" style={{marginTop: '10px'}}>+ Add Sender</button>
              </div>

              <div className="form-group">
                  <label>Known Bot IDs to Ignore (comma-separated)</label>
                  <textarea rows={2} value={(settings.known_bot_ids || []).join(', ')} onChange={e => handleChange('known_bot_ids', e.target.value.split(',').map(s=>s.trim()))}></textarea>
              </div>
            </>
          )}
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary" disabled={isSaving}>Cancel</button>
          <button onClick={handleSave} className="btn btn-primary" disabled={isSaving || loading}>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </Modal>

      <TelegramLoginModal
        isOpen={isLoginWizardOpen}
        onClose={() => setIsLoginWizardOpen(false)}
        onSuccess={handleLoginSuccess}
        token={token}
        accountType={loginAccountType}
      />
    </>
  );
}