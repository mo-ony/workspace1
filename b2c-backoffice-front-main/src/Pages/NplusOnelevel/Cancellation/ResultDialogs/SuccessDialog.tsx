//@ts-nocheck
import React from "react";
import "./SuccessDialog.css";

const SuccessDialog = ({ onClose }) => {

	return (
        <div className="confirmation-dialog-container">
            <div className="confirmation-text">Annulation accept&eacute;e</div>
            <div className="confirmation-message">La demande d'annulation a &eacute;t&eacute; accept&eacute;e et le remboursement a &eacute;t&eacute; effectu&eacute; avec succ&eacute;s</div>
            <div className="confirmation-btns-container">
                <button className="btn secondary-btn" onClick={onClose}>
                    fermer
                </button>
            </div>
        </div>
	);
};

export default SuccessDialog;