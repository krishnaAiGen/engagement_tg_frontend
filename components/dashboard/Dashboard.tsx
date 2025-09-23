// File: frontend/components/dashboard/Dashboard.tsx
'use client';

import { useAuth } from '@/lib/AuthContext';
import { useState, useEffect } from 'react';
import {
  getUserConfig,
  generatePersonas,
  getAllConnections,
  saveServiceKeys,
  deployTeam,
  updateDraftTeam,
  startBot,
  stopBot,
  saveBotConfiguration, // <-- NEWLY ADDED
  getConnectionsStatus, // <-- NEWLY ADDED
} from '@/lib/api';
import PersonaCard from '@/components/personas/PersonaCard';
import ApiKeyModal from '@/components/modals/ApiKeyModal';
import EditPersonaModal, { Persona } from '@/components/modals/EditPersonaModal';
import ConnectionsModal from '@/components/modals/ConnectionsModal';
import BotConfigModal from '@/components/modals/BotConfigModal'; // <-- NEWLY ADDED
// Add these with your other modal imports
import SlackSettingsModal from '@/components/modals/SlackSettingsModal';
import DiscordSettingsModal from '@/components/modals/DiscordSettingsModal';
import TelegramSettingsModal from '@/components/modals/TelegramSettingsModal';

export default function Dashboard() {
  const { token, email, logout } = useAuth();
  
  // --- Main Dashboard State ---
  const [draftTeam, setDraftTeam] = useState<Persona[]>([]);
  const [goalPrompt, setGoalPrompt] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const [isActive, setIsActive] = useState(false);
  const [botStatusLoading, setBotStatusLoading] = useState(true);
  // Add this to your block of state variables for modals
  const [isSlackModalOpen, setIsSlackModalOpen] = useState(false);
  const [isDiscordModalOpen, setIsDiscordModalOpen] = useState(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);


  // --- State for Modals ---
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  
  // --- NEW: State for the Deployment Wizard ---
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isConnectionsModalOpen, setIsConnectionsModalOpen] = useState(false);
  const [botConfigData, setBotConfigData] = useState<any>(null); // This will hold data for the config modal

  useEffect(() => {
    if (token) {
      const fetchInitialData = async () => {
        try {
          const userConfig = await getUserConfig(token);
          setDraftTeam(userConfig.draftTeam || []);
          setIsActive(userConfig.isActive || false);
        } catch (err) {
          if (err instanceof Error) setMessage(`Failed to load config: ${err.message}`);
        } finally {
          setLoading(false);
          setBotStatusLoading(false);
        }
      };
      fetchInitialData();
    }
  }, [token]);

  // --- Persona Generation Logic (Unchanged) ---
  const handleGenerateClick = async () => {
    setMessage('');
    if (!goalPrompt.trim() || !token) return;
    try {
      const connections = await getAllConnections(token);
      if (connections.openai && (connections.openai.api_key_encrypted || connections.openai.encrypted_key)) {
        await proceedToGeneration();
      } else {
        setIsApiKeyModalOpen(true);
      }
    } catch (err) {
      if (err instanceof Error) setMessage(err.message);
    }
  };
  const handleSaveApiKeyAndGenerate = async (apiKey: string) => {
    if (!token) return;
    try {
      await saveServiceKeys({ openai: { api_key: apiKey } }, token);
      setIsApiKeyModalOpen(false);
      await proceedToGeneration();
    } catch (err) {
      if (err instanceof Error) alert(`Failed to save key: ${err.message}`);
    }
  };
  const proceedToGeneration = async () => {
    if (!token) return;
    setGenerating(true);
    try {
      const result = await generatePersonas(goalPrompt, token);
      setDraftTeam(result.personas || []);
      setMessage(result.message || 'Personas generated successfully!');
      setMessageType('success');
    } catch (err) {
      if (err instanceof Error) setMessage(err.message);
    } finally {
      setGenerating(false);
    }
  };

  // --- Persona CRUD Logic (Unchanged) ---
  const handleEditClick = (persona: Persona) => {
    setEditingPersona(persona);
    setIsEditModalOpen(true);
  };
  const handleDeleteClick = async (personaId: string) => {
    if (!token || !window.confirm('Delete this persona?')) return;
    const newTeam = draftTeam.filter(p => p.id !== personaId);
    try {
      await updateDraftTeam(newTeam, token);
      setDraftTeam(newTeam);
    } catch (err) {
      if (err instanceof Error) setMessage(`Delete failed: ${err.message}`);
    }
  };
  const handleSavePersona = async (updatedPersona: Persona) => {
    if (!token) return;
    const newTeam = draftTeam.map(p => (p.id === updatedPersona.id ? updatedPersona : p));
    try {
      await updateDraftTeam(newTeam, token);
      setDraftTeam(newTeam);
      setIsEditModalOpen(false);
    } catch (err) {
      if (err instanceof Error) alert(`Failed to save: ${err.message}`);
    }
  };

  // --- NEW: Deployment Wizard Logic ---
  const handleDeploy = async () => {
    if (!token || draftTeam.length === 0) return;
    if (!window.confirm('This will deploy your draft and open the bot configuration. Continue?')) return;
    
    setDeploying(true);
    setMessage('');
    try {
      await deployTeam(token);
      
      const [behaviorConfig, keysConfig] = await Promise.all([
        getUserConfig(token),
        getAllConnections(token)
      ]);
      setBotConfigData({ behavior: behaviorConfig, keys: keysConfig });
      setIsConfigModalOpen(true); // Open the first modal
      
    } catch (err) {
      if (err instanceof Error) setMessage(`Deployment failed: ${err.message}`);
    } finally {
      setDeploying(false);
    }
  };

  const handleSaveConfiguration = async (payload: { keysPayload: any, behaviorPayload: any }) => {
    if (!token) return;
    try {
      const { keysPayload, behaviorPayload } = payload;
      const promises = [];
      if (Object.keys(keysPayload).length > 0) {
        promises.push(saveServiceKeys(keysPayload, token));
      }
      promises.push(saveBotConfiguration(behaviorPayload, token));
      await Promise.all(promises);

      // On success, close this modal and open the next one
      setIsConfigModalOpen(false);
      setIsConnectionsModalOpen(true);
      
    } catch (err) {
      if (err instanceof Error) alert(`Failed to save configuration: ${err.message}`);
    }
  };
  // Add this new handler function inside your Dashboard component
  const handleOpenSettings = (platform: string) => {
    // Close the main connections modal first
    setIsConnectionsModalOpen(false);
  
    if (platform === 'slack') {
      setIsSlackModalOpen(true);
    } else if (platform === 'discord') {
        setIsDiscordModalOpen(true);
    } else if (platform === 'telegram') {
        setIsTelegramModalOpen(true); // <-- THIS IS THE NEW LINE
      }
  };
  // Add this new handler function inside your Dashboard component
  const handleSettingsSaved = () => {
    // Re-open the connections modal to see the updated status
    setIsConnectionsModalOpen(true);
  };
  
  const handleBotStarted = () => {
    setIsActive(true);
    setMessage("Bot start signal sent successfully!");
    setMessageType('success');
  };

  // --- Bot Start/Stop Logic (Unchanged) ---
  const handleStartBot = () => {
    setIsConnectionsModalOpen(true);
  };

  const handleStopBot = async () => {
    if (!token || !window.confirm("Are you sure you want to stop the bot?")) return;
    setBotStatusLoading(true);
    try {
      await stopBot(token);
      setIsActive(false);
    } catch (err) {
      if (err instanceof Error) setMessage(`Failed to stop bot: ${err.message}`);
    } finally {
      setBotStatusLoading(false);
    }
  };

  if (loading) return <div>Loading your dashboard...</div>;

  return (
    <>
      <ApiKeyModal isOpen={isApiKeyModalOpen} onClose={() => setIsApiKeyModalOpen(false)} onSave={handleSaveApiKeyAndGenerate} />
      <EditPersonaModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} persona={editingPersona} onSave={handleSavePersona} />
      
      {/* --- WIZARD MODALS --- */}
      <BotConfigModal 
        isOpen={isConfigModalOpen} 
        onClose={() => setIsConfigModalOpen(false)} 
        onSave={handleSaveConfiguration}
        initialBehavior={botConfigData?.behavior}
        existingKeys={botConfigData?.keys}
      />
      <ConnectionsModal
        isOpen={isConnectionsModalOpen}
        token={token}
        onClose={() => setIsConnectionsModalOpen(false)}
        onBotStarted={handleBotStarted}
        onOpenSettings={handleOpenSettings} // <-- ADD THIS PROP
        />
      <SlackSettingsModal
        isOpen={isSlackModalOpen}
        onClose={() => setIsSlackModalOpen(false)}
        onSave={handleSettingsSaved}
        token={token}
        />
    <TelegramSettingsModal
    isOpen={isTelegramModalOpen}
    onClose={() => setIsTelegramModalOpen(false)}
    onSave={handleSettingsSaved}
    token={token}
    />
    <DiscordSettingsModal
    isOpen={isDiscordModalOpen}
    onClose={() => setIsDiscordModalOpen(false)}
    onSave={handleSettingsSaved}
    token={token}
    />
    
      <div className="container">
        <header className="dashboard-header">
          <h1>AI Persona Dashboard</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span>{email}</span>
            <div className={`status-indicator ${isActive ? 'running' : 'stopped'}`}>
              <span className="status-dot"></span>
              <span className="status-text">{isActive ? 'Running' : 'Stopped'}</span>
            </div>
            <button onClick={handleStartBot} className="btn btn-primary" disabled={botStatusLoading || isActive}>Start Bot</button>
            <button onClick={handleStopBot} className="btn btn-danger" disabled={botStatusLoading || !isActive}>
              {botStatusLoading ? 'Processing...' : 'Stop Bot'}
            </button>
            <button onClick={logout} className="btn btn-secondary">Logout</button>
          </div>
        </header>

        <div className="section">
          <div className="section-header"><h2>Create New Personas</h2></div>
          {message && ( <p style={{ color: messageType === 'error' ? 'var(--danger-color)' : 'var(--success-color)', marginBottom: '1rem' }}> {message} </p> )}
          <div className="form-group">
            <label htmlFor="goal-prompt">Describe your bot's high-level goal:</label>
            <textarea id="goal-prompt" value={goalPrompt} onChange={(e) => setGoalPrompt(e.target.value)} />
          </div>
          <button onClick={handleGenerateClick} className="btn btn-primary" disabled={generating}>{generating ? 'Generating...' : 'Generate AI Team'}</button>
        </div>

        <div className="section">
          <div className="section-header">
            <h2>Your Active Bot Team (Draft)</h2>
            <div className="actions">
              <button onClick={handleDeploy} className="btn btn-accent" disabled={deploying || draftTeam.length === 0}>{deploying ? 'Deploying...' : 'Deploy & Configure'}</button>
            </div>
          </div>
          {draftTeam.length > 0 ? (
            <div id="persona-grid">
              {draftTeam.map((persona) => ( <PersonaCard key={persona.id} persona={persona} onEdit={() => handleEditClick(persona)} onDelete={() => handleDeleteClick(persona.id)} /> ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🤖</div><p>Your team is empty.</p><span>Generate a new team to get started.</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}