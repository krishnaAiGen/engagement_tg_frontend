// File: frontend/components/modals/ConnectionsModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { apiRequest } from '@/lib/api';

interface ConnectionStatus {
  platform: 'telegram' | 'slack' | 'discord';
  isConnected: boolean;
  isActiveNow: boolean;
}

interface ConnectionsModalProps {
  isOpen: boolean;
  token: string | null;
  onClose: () => void;
  onBotStarted: () => void;
  onOpenSettings: (platform: string) => void; // <-- NEW PROP
}

export default function ConnectionsModal({ isOpen, token, onClose, onBotStarted, onOpenSettings }: ConnectionsModalProps) {
  const [connections, setConnections] = useState<ConnectionStatus[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (isOpen && token) {
      const fetchStatuses = async () => {
        setLoading(true);
        setError('');
        try {
          const statuses: ConnectionStatus[] = await apiRequest('/api/connections', 'GET', token);
          setConnections(statuses);
          const active = new Set(statuses.filter(s => s.isActiveNow).map(s => s.platform));
          setSelectedPlatforms(active);
        } catch (err) {
          if (err instanceof Error) setError(`Failed to load statuses: ${err.message}`);
        } finally {
          setLoading(false);
        }
      };
      fetchStatuses();
    }
  }, [isOpen, token]);

  const handleCheckboxChange = (platform: string, isConnected: boolean) => {
    if (!isConnected) return;
    setSelectedPlatforms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(platform)) newSet.delete(platform);
      else newSet.add(platform);
      return newSet;
    });
  };

  const handleStart = async () => {
    if (!token) return;
    setStarting(true);
    setError('');
    try {
      await apiRequest('/api/start', 'POST', token, { platforms: Array.from(selectedPlatforms) });
      onBotStarted();
      onClose();
    } catch (err) {
      if (err instanceof Error) setError(`Failed to start bot: ${err.message}`);
    } finally {
      setStarting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Connections & Start Bot">
      <div className="modal-body">
        <p>Select the platforms you want your bot to be active on. You must connect a platform before you can select it.</p>
        
        {loading && <p>Loading connection statuses...</p>}
        {error && <p style={{ color: 'var(--danger-color)' }}>{error}</p>}

        {!loading && (
          <div style={{ marginTop: '20px' }}>
            {connections.map(({ platform, isConnected }) => (
              <div key={platform} className="connection-item">
                <input
                  type="checkbox"
                  id={`select-${platform}`}
                  disabled={!isConnected}
                  checked={selectedPlatforms.has(platform)}
                  onChange={() => handleCheckboxChange(platform, isConnected)}
                />
                <label htmlFor={`select-${platform}`} style={{ textTransform: 'capitalize', color: !isConnected ? 'var(--text-light)' : 'inherit' }}>
                  {platform}
                </label>
                <span className={`status-badge ${isConnected ? 'connected' : 'disconnected'}`}>
                  {isConnected ? 'Connected' : 'Not Connected'}
                </span>
                {/* --- THIS BUTTON IS NOW FUNCTIONAL --- */}
                <button 
                  onClick={() => onOpenSettings(platform)} 
                  className="btn btn-secondary btn-sm"
                >
                  {isConnected ? 'Settings' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="modal-footer">
        <button onClick={onClose} className="btn btn-secondary" disabled={starting}>Cancel</button>
        <button onClick={handleStart} className="btn btn-primary" disabled={starting || selectedPlatforms.size === 0}>
          {starting ? 'Starting...' : 'Save and Start Bot'}
        </button>
      </div>
    </Modal>
  );
}