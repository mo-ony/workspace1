//@ts-nocheck
import React from "react";
import "./SuccessDialog.css";

const RejectedDialog = ({ onClose }) => {

	return (
        <div className="confirmation-dialog-container">
            <div className="confirmation-text">Annulation rejet&eacute;e</div>
            <div className="confirmation-message">La demande d'annulation a &eacute;t&eacute; rejet&eacute;e.</div>
            <div className="confirmation-btns-container">
                <button className="btn secondary-btn" onClick={onClose}>
                    fermer
                </button>
            </div>
        </div>
	);
};

export default RejectedDialog;