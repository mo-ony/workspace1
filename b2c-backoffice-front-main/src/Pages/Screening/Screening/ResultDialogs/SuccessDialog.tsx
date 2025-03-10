//@ts-nocheck
import React from "react";
import "./SuccessDialog.css";

const SuccessDialog = ({ onClose }) => {

	return (
        <div className="confirmation-dialog-container">
            <div className="confirmation-message">Votre d&eacute;cision a bien &eacute;t&eacute; enregistr&eacute;e </div>
            <div className="confirmation-btns-container">
                <button className="btn secondary-btn" onClick={onClose}>
                    fermer
                </button>
            </div>
        </div>
	);
};

export default SuccessDialog;