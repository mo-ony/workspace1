//@ts-nocheck
import React from "react";
import "./SuccessDialog.css";

const FailDialog = ({ onClose, errorMessage ,refundStatusList , totalRefundedAmount, totalPendingAmount, numPolicy  }) => {

	return (
               <div className="confirmation-dialog-container">
            <div className="confirmation-text">Annulation echou&eacute;e</div>
            <div className="confirmation-message">{errorMessage}</div>
            {refundStatusList && (
                <div className="transaction-details">
                <div className="confirmation-message">le remboursement au titre d'annulation de contrat d'assurance num&eacute;ro de police <b> {numPolicy} </b> a &eacute;chou&eacute;. Voici un r&eacute;capitulatif :</div>
                    <table  className="transaction-details">
                        <thead>
                            <tr>
                                <th>Montant</th>
                                <th>N&deg; de commande</th>
                                <th>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {refundStatusList.map((refund, index) => (
                                <tr key={index}>
                                    <td>{refund.amount} da</td>
                                    <td>{refund.orderId}</td>
                                    <td>{refund.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     <br />
                    <div>
                        Total rembours&eacute; : {totalRefundedAmount} da
                    </div>
                    <div>
                        Total en attente de remboursement : {totalPendingAmount} da
                        <p></p>
                        </div>
                   
                </div>
            )}
            <div className="confirmation-btns-container">
                <button className="btn secondary-btn" onClick={onClose}>
                    Fermer
                </button>
            </div>
        </div>
	);
};

export default FailDialog;