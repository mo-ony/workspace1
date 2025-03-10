import { useState } from "react";

const ViewFileDialog = ({ file, onClose }) => {


    return (
        <div className="modal d-flex align-items-center justify-content-center" tabIndex="-1" role="dialog" style={{ display: 'block' }}>
            <div className="modal-dialog modal-custom" role="document">
                <div className="modal-content">
                    <div className="modal-header d-flex justify-content-between align-items-center">
                        <span className="modal-title">{file.name}</span>
                        <button type="button" className="close" onClick={onClose} aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body  d-flex justify-content-center align-items-center">
                         <img src={file.path} alt={file.name} style={{ maxWidth: '100%', maxHeight: '80vh' }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewFileDialog;