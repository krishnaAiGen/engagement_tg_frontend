// File: frontend/components/modals/EditPersonaModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';

// This is the COMPLETE data structure for a persona, based on what you provided.
export interface Persona {
  id: string;
  persona_name?: string;
  role?: string;
  tagline?: string;
  key_traits?: string[];
  expertise?: string[];
  signature_voice?: {
    tone?: string;
    style?: string;
    language_habits?: string[];
  };
  allow_emojis?: boolean;
  interaction_rules?: string[];
  examples?: { user: string; assistant: string }[];
  knowledge_boundaries?: {
    will_defer_on?: string[];
    refusal_message?: string;
  };
}

interface EditPersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: Persona | null;
  onSave: (updatedPersona: Persona) => void;
}

export default function EditPersonaModal({ isOpen, onClose, persona, onSave }: EditPersonaModalProps) {
  const [activeTab, setActiveTab] = useState('core');
  // This state holds our local, editable copy of the FULL persona object.
  const [editablePersona, setEditablePersona] = useState<Persona | null>(null);

  // When the modal opens or the persona changes, update our local editable copy.
  useEffect(() => {
    if (persona) {
      // Use JSON.parse/stringify to create a deep copy. This is crucial to
      // ensure we don't accidentally modify the original state before saving.
      setEditablePersona(JSON.parse(JSON.stringify(persona)));
    }
  }, [persona]);

  if (!isOpen || !editablePersona) return null;

  // This is a generic helper to update fields in our local copy.
  const handleChange = (field: keyof Persona, value: any) => {
    setEditablePersona(prev => (prev ? { ...prev, [field]: value } : null));
  };
  
  // Specific helpers for nested objects to avoid errors.
  const handleVoiceChange = (field: string, value: any) => {
    setEditablePersona(prev => {
      if (!prev) return null;
      const updatedVoice = { ...(prev.signature_voice || {}), [field]: value };
      return { ...prev, signature_voice: updatedVoice };
    });
  };

  const handleBoundariesChange = (field: string, value: any) => {
    setEditablePersona(prev => {
      if (!prev) return null;
      const updatedBoundaries = { ...(prev.knowledge_boundaries || {}), [field]: value };
      return { ...prev, knowledge_boundaries: updatedBoundaries };
    });
  }

  // When the user clicks "Save", this function calls the 'onSave' prop
  // from the Dashboard, sending the complete, updated persona object back.
  const handleSave = () => {
    if (editablePersona) {
      onSave(editablePersona);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit: ${persona?.persona_name || ''}`}>
      <div className="modal-body">
        {/* --- TABS --- */}
        <div className="modal-tabs">
          <button className={`tab-button ${activeTab === 'core' ? 'active' : ''}`} onClick={() => setActiveTab('core')}>Core Identity</button>
          <button className={`tab-button ${activeTab === 'voice' ? 'active' : ''}`} onClick={() => setActiveTab('voice')}>Voice & Style</button>
          {/* --- NEW TAB --- */}
          <button className={`tab-button ${activeTab === 'rules' ? 'active' : ''}`} onClick={() => setActiveTab('rules')}>Knowledge & Rules</button>
        </div>
        
        {/* --- TAB 1: CORE IDENTITY --- */}
        {activeTab === 'core' && (
          <div className="tab-content active">
            <div className="form-group"><label>Persona Name</label><input type="text" value={editablePersona.persona_name || ''} onChange={e => handleChange('persona_name', e.target.value)} /></div>
            <div className="form-group"><label>Role</label><input type="text" value={editablePersona.role || ''} onChange={e => handleChange('role', e.target.value)} /></div>
            <div className="form-group"><label>Tagline</label><input type="text" value={editablePersona.tagline || ''} onChange={e => handleChange('tagline', e.target.value)} /></div>
            <div className="form-group"><label>Key Traits (comma-separated)</label><input type="text" value={(editablePersona.key_traits || []).join(', ')} onChange={e => handleChange('key_traits', e.target.value.split(',').map(s => s.trim()))} /></div>
          </div>
        )}

        {/* --- TAB 2: VOICE & STYLE --- */}
        {activeTab === 'voice' && (
          <div className="tab-content active">
            <div className="form-group"><label>Tone</label><input type="text" value={editablePersona.signature_voice?.tone || ''} onChange={e => handleVoiceChange('tone', e.target.value)} /></div>
            <div className="form-group"><label>Style</label><textarea value={editablePersona.signature_voice?.style || ''} onChange={e => handleVoiceChange('style', e.target.value)} /></div>
            <div className="form-group"><label>Language Habits (one per line)</label><textarea rows={3} value={(editablePersona.signature_voice?.language_habits || []).join('\n')} onChange={e => handleVoiceChange('language_habits', e.target.value.split('\n'))} /></div>
            <div className="form-group"><label><input type="checkbox" checked={editablePersona.allow_emojis || false} onChange={e => handleChange('allow_emojis', e.target.checked)} /> Allow use of Emojis</label></div>
          </div>
        )}

        {/* --- NEW TAB 3: KNOWLEDGE & RULES --- */}
        {activeTab === 'rules' && (
            <div className="tab-content active">
                <div className="form-group"><label>Expertise (comma-separated)</label><input type="text" value={(editablePersona.expertise || []).join(', ')} onChange={e => handleChange('expertise', e.target.value.split(',').map(s => s.trim()))} /></div>
                <div className="form-group"><label>Interaction Rules (one per line)</label><textarea rows={4} value={(editablePersona.interaction_rules || []).join('\n')} onChange={e => handleChange('interaction_rules', e.target.value.split('\n'))} /></div>
                <div className="form-group"><label>Knowledge Boundaries: Will Defer On (one per line)</label><textarea rows={3} value={(editablePersona.knowledge_boundaries?.will_defer_on || []).join('\n')} onChange={e => handleBoundariesChange('will_defer_on', e.target.value.split('\n'))} /></div>
                <div className="form-group"><label>Knowledge Boundaries: Refusal Message</label><input type="text" value={editablePersona.knowledge_boundaries?.refusal_message || ''} onChange={e => handleBoundariesChange('refusal_message', e.target.value)} /></div>
                <div className="form-group">
                    <label>Examples (JSON format)</label>
                    <p style={{fontSize: '12px', color: '#666', margin: '-5px 0 10px'}}>Warning: Editing this requires valid JSON.</p>
                    <textarea 
                        rows={6} 
                        style={{ fontFamily: 'monospace', fontSize: '14px' }}
                        value={JSON.stringify(editablePersona.examples || [], null, 2)}
                        onChange={e => {
                            try {
                                const parsedJson = JSON.parse(e.target.value);
                                handleChange('examples', parsedJson);
                            } catch (error) {
                                // If JSON is invalid, we don't update the state,
                                // but the user can still see and fix their typing.
                                console.error("Invalid JSON format");
                            }
                        }}
                    />
                </div>
            </div>
        )}
      </div>
      <div className="modal-footer">
        <button onClick={onClose} className="btn btn-secondary">Cancel</button>
        <button onClick={handleSave} className="btn btn-primary">Save Changes</button>
      </div>
    </Modal>
  );
}