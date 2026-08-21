import type { ReactNode } from 'react';

type ModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export const Modal = ({ title, onClose, children }: ModalProps) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h3>{title}</h3>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Cerrar">
          ×
        </button>
      </div>
      <div className="modal-body">{children}</div>
    </div>
  </div>
);
