// dashboard-app/src/components/Modal.jsx
import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <div style={headerStyle}>
                    <h2>{title}</h2>
                    <button onClick={onClose} style={closeButtonStyle}>&times;</button>
                </div>
                <div style={contentStyle}>
                    {children}
                </div>
            </div>
        </div>
    );
};

// Estilos básicos para el modal
const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' };
const modalStyle = { background: 'white', padding: '20px', borderRadius: '8px', width: '500px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px' };
const closeButtonStyle = { background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' };
const contentStyle = { paddingTop: '20px' };

export default Modal;
