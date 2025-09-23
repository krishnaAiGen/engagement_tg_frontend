// File: frontend/components/ui/Modal.tsx
'use client';
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  // We'll pass both width and maxWidth for maximum flexibility
  width?: string;
  maxWidth?: string; 
}

export default function Modal({ isOpen, onClose, title, children, width, maxWidth }: ModalProps) {
  if (!isOpen) return null;

  // This style object will apply the width and maxWidth we pass in.
  const modalStyle = {
    width: width || '90%', // Default to 90% of the parent if no width is given
    maxWidth: maxWidth || '600px', // Default to 600px max-width
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="modal-close">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}