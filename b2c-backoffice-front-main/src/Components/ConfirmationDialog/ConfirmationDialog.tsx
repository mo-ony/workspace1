//@ts-nocheck
import React from "react";
import "./ConfirmationDialog.css";

const ConfirmationDialog = ({ onConfirm, onCancel }) => {
	return (
        <div className="confirmation-dialog-container">
            <div className="confirmation-text">Confirmation</div>
            <div className="confirmation-message">Voulez-vous vraiment envoyer votre d&eacute;cision?</div>
            <div className="confirmation-btns-container">
                <button className="btn secondary-btn" onClick={onCancel}>
                    Annuler
                </button>
                <button className="btn primary-btn" onClick={onConfirm}>
                    Confirmer
                </button>
            </div>
        </div>
	);
};

export default ConfirmationDialog;