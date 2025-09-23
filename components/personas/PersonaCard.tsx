// File: frontend/components/personas/PersonaCard.tsx
'use client';

// This component now needs to know about the onEdit and onDelete functions
interface PersonaCardProps {
  persona: {
    id: string;
    persona_name?: string;
    role?: string;
    tagline?: string;
    key_traits?: string[];
  };
  onEdit: () => void;
  onDelete: () => void;
}

export default function PersonaCard({ persona, onEdit, onDelete }: PersonaCardProps) {
  return (
    <div className="persona-card">
      <h3>{persona.persona_name || 'Unnamed Persona'}</h3>
      <p className="role">{persona.role || 'No role defined'}</p>
      <p className="tagline">"{persona.tagline || ''}"</p>
      <div className="tags">
        {(persona.key_traits || []).slice(0, 3).map(trait => (
          <span key={trait} className="tag">{trait}</span>
        ))}
      </div>
      {/* ADDED the actions div with onClick handlers */}
      <div className="card-actions">
        <button onClick={onEdit} className="btn btn-secondary btn-sm">Edit</button>
        <button onClick={onDelete} className="btn btn-danger btn-sm">Delete</button>
      </div>
    </div>
  );
}