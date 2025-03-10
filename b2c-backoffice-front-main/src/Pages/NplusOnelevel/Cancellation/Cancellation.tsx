//@ts-nocheck
import 'bootstrap/dist/css/bootstrap.min.css';
import "./Cancellation.css";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faDownload } from '@fortawesome/free-solid-svg-icons';
import ViewFileDialog from '../../../Components/ViewFileDialog/ViewFileDialog';
import { Link } from "react-router-dom";
import { useParams } from 'react-router-dom';
import ConfirmationDialog from "../../../Components/ConfirmationDialog/ConfirmationDialog";
import SuccessDialog from './ResultDialogs/SuccessDialog';
import RejectedDialog from './ResultDialogs/RejectedDialog';
import FailDialog from './ResultDialogs/FailDialog';
import { useAuth } from "../../auth/core/Auth";
import { useNavigate, useLocation } from 'react-router-dom';

export default function Cancellation() {

    const location = useLocation();
    const { status, status_ID } = location.state;

    const [decision, setDecision] = useState(
        status_ID === 7 ? 'accepte' : status_ID === 8 ? 'refuse' : ''
    );

    const navigate = useNavigate();

    //const { auth, role } = useAuth();
    const { auth} = useAuth();

    const { cancellationId } = useParams();
    const [motif, setMotif] = useState(''); 
    const [data, setData] = useState({
        nomAssure: '',
        prenomAssure: '',
        dateNaissance: '',
        telephoneAssure: '',
        numeroPassport: '',
        lieuDelivrance: '',
        dateDelivrance: '',
        dateExpiration: '',
        numeroContrat: '',
        dateSouscription: '',
        dateDepart: '',
        dateRetour: '',
        destination: '',
        motifAnnulation: '',
        fileName:''
    }); 
    const [files, setFiles] = useState(
        { name: '1.png', size: '120ko', path: '../../../public/1.png' }
    );
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showFail, setShowFail] = useState(false);
    const [showRejected, setShowRejected] = useState(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false); //used to disable button valider after submitting decision
     const [failMessage, setFailMessage] = useState(""); // For storing error messages
    const [refundStatusList, setRefundStatusList] = useState([]); // For storing refund status list
    const [totalRefundedAmount, setTotalRefundedAmount] = useState(0); // For storing total refunded amount
    const [totalPendingAmount, setTotalPendingAmount] = useState(0); // For storing total pending amount
    const [numPolicy, setNumPolicy] = useState(""); // For storing policy number
    const [error, setError] = useState("");
    const [pending, setPending] = useState(false);


    useEffect(() => {
        setIsButtonDisabled(status === 'treated');
    }, [status]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!cancellationId) {
                    throw new Error('No cancellationId parameter found');
                }

                // Fetch return data using the cancellationId
                const responseData = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL
                    }/v1/b2c/cancellation/cancellationRequestData?cancellationId=${cancellationId}`, {
                    headers: {
                        Authorization: `Bearer ${auth?.access_token}`
                    }
                });
                if (!responseData.ok) {
                    throw new Error('Failed to fetch return data');
                }
                const resultData = await responseData.json();
                setData(resultData);
                console.log(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        // Call the fetchData function
        fetchData();
    }, []); // Add cancellationId as a dependency

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                if (!cancellationId) {
                    throw new Error('No cancellationId parameter found');
                }

                // Fetch return data using the cancellationId
                const responseFile = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL}/v1/b2c/cancellation/cancellationRequestFile?cancellationId=${cancellationId}`, {
                    headers: {
                        Authorization: `Bearer ${auth?.access_token}`
                    }
                });

                if (!responseFile.ok) {
                    throw new Error('Failed to fetch file');
                }

                const resultFiles = await responseFile.json();
                const processedFiles = resultFiles.map(file => {
                    const contentLength = file.content.length;
                    const fileSize = ((contentLength / 1024) / 1024).toFixed(2) + 'MB';

                    const byteCharacters = atob(file.content);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: 'application/octet-stream' });


                    return {
                        name: file.filename,
                        size: fileSize,
                        path: URL.createObjectURL(blob)
                    };
                });

                setFiles(processedFiles);
                console.log(processedFiles);
            } catch (error) {
                console.error('Error fetching files:', error);
            }
        };

        // Call the fetchFiles function whenever data changes
        if (data) {
            fetchFiles();
        }
    }, [data, cancellationId, auth]);


    const [viewFile, setViewFile] = useState(null);

    const openViewModal = (file) => {
        setViewFile(file);
    };

    const closeViewModal = () => {
        setViewFile(null);
    };



    // Function to handle change in decision radio buttons
    const handleDecisionChange = (event) => {
        setDecision(event.target.value);
        if (event.target.value === 'accepte') {
            // Reset the motif if decision is changed to 'accepte'
            setMotif('');
        }
    };

    // Function to handle change in motif input
    const handleMotifChange = (event) => {
        setMotif(event.target.value);
    };


    // Function to handle form submission
    const handleSubmit = (event) => {
        event.preventDefault();
        setShowConfirmation(true); // Show the confirmation dialog
    };


  const submitCancellationRequest = (payload) => {
      setIsButtonDisabled(true);
      setPending(true);

    fetch(`${
							import.meta.env.VITE_API_GATEWAY_URL
						}/v1/b2c/cancellation/processCancellationNplusOneRequest`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${auth?.access_token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })
        .then(response => {
            setPending(false);
        console.log("code response is:" + response.status);
            if (response.status === 504) {
                setFailMessage('Echec de la creation de la tache de screening');
                setShowFail(true);
                throw new Error('Failed to create screening task');
            } else if (response.status === 505) {
                setFailMessage('Le souscripteur est identifie comme hit positif');
                setShowFail(true);
                throw new Error('The subscriber is screened as positif hit');
            } else if (response.status === 500) {
                setFailMessage('serrver error');
                setShowFail(true);
                throw new Error('erreur serveurt');
            } else if (response.status === 507) {
                setFailMessage('Echec de la sauvegarde de la demande d\'annulation acceptee dans la base de donnees');
                setShowFail(true);
                throw new Error('database error');
            }
            else if (response.status === 506) {
                return response.json(); // Parse JSON response for 506
            } else if (!response.ok) {
                throw new Error('Network response was not ok');
            } else if (response.status === 201) {
                setShowRejected(true); // rejected
            } else if (response.ok) {
                setShowSuccess(true); // Success
            }
        })
        .then(data => {
            setPending(false);
        if (data) { // Check if data is available for 506 response
            console.log('Response:', data);
            setShowFail(true);
            setFailMessage(error.message);
            setRefundStatusList(data.refundStatusList);
            setTotalRefundedAmount(data.totalRefundedAmount);
            setTotalPendingAmount(data.totalPendingAmount);
            setNumPolicy(data.numPolicy);
        } else {
            // Handle success response here if needed
        }
    })
        .catch(error => {
            setPending(false);
        console.error('There was a problem with the fetch operation:', error.message);
        // Show popup with error message
        // Replace this with your actual code to display a popup
        setShowFail(true);
        setFailMessage(error.message);
    });
};

    // Function to handle confirmation
    const handleConfirm = () => {
        // Check if decision is not empty
        if (decision) {
            // If decision is "Refusé", check if motif is not empty
            if (decision === 'refuse' && !motif) {
                console.log('Motif is required.');
                return; // Exit early if motif is required but not provided
            }

            // Form is valid, prepare submission object
            let submission;
            if (decision === 'accepte') {
                submission = { decision,motif, cancellationId };
            } else if (decision === 'refuse') {
                submission = { decision, motif, cancellationId };
            }

            // Log the submission object
            console.log('Form submitted:', submission);

            // Call the function to submit the cancellation request
            submitCancellationRequest(submission);

        } else {
            // Form is invalid, show error message or take appropriate action
            console.log('Decision is required.');
        }
        setShowConfirmation(false); // Hide the confirmation dialog after submission
    };

    // Function to handle cancellation
    const handleCancel = () => {
        setShowConfirmation(false); // Hide the confirmation dialog
    };

        // Function to handle cancellation
    const handleClose = () => {
        setShowSuccess(false);
        setShowFail(false); 
        setShowRejected(false); 
        setTimeout(() => {
            navigate('/Cancellation');
        }, 1000); 
    };

    const truncateFileName = (name, maxLength = 30) => {
        if (name.length > maxLength) {
            return name.slice(0, maxLength - 3) + '...';
        }
        return name;
    };


    return (
        <>
        <div className="container-fluid page-container">
                <h5>Controle de demande d&apos;annulation niveau N+1</h5>
                <br></br>

        <div  className="cards" >
              <div className="row ">
                    <div className="col-md-6 px-2" >
                        <div className="row">   
                                    <label className="form-label"><b>D&eacute;cision du niveau N</b> </label>
                                    <div className="col-md-12">
                                        <input 
                                            type="radio"
                                            disabled= "true"
                                            checked={data.statusId == '4'}
                                        />
                                        <label htmlFor="accepte" className="form-label px-1"> Demande d&apos;annulation accept&eacute;e</label>
                                    </div>
                                    <div className="col-md-12 mb-2">
                                        <input
                                            type="radio"
                                            disabled="true"
                                            checked={data.statusId =='5'}
                                           

                                        />
                                        <label htmlFor="refuse" className="form-label px-1" > Demande d&apos;annulation refus&eacute;e</label>
                                    </div>
                        </div>
                    </div>
                    <div className="col-md-6 px-2" >
                        <div className="row">
                                    <label htmlFor="motif" className="form-label"> <b>Motif </b></label>
                                    <textarea
                                        className="form-control p-3"
                                        value={data.motifStatus}
                                        disabled="true"
                          
                                    />
                        </div>
                    </div>
               </div>
         </div>
         <br></br>


            <div className="row ">
                    <div className="col-md-6 px-2" >
                        <div className="row">
                            <div className="col-md-12 " >
                                <h6>Information du souscripteur</h6>
                            </div>
                        </div>
                        <div className="row mx-1  ">
                            <div className="col-md-6 mb-2">
                                <label htmlFor="nomAssure" className="form-label ">Nom du souscripteur</label>
                                <input type="text" className="form-control" id="nomAssure" value={data.nomAssure}  disabled />
                                </div>
                            <div className="col-md-6 mb-2">
                                <label htmlFor="prenomAssure" className="form-label">Pr&eacute;nom du souscripteur</label>
                                <input type="text" className="form-control" id="prenomAssure" value={data.prenomAssure} disabled />
                            </div>
                        </div>
                        <div className="row mx-1  ">
                            <div className="col-md-6 mb-2">
                                <label htmlFor="dateNaissance" className="form-label">Date de naissance du souscripteur</label>
                                <input type="text" className="form-control" id="dateNaissance" value={data.dateNaissance ? data.dateNaissance.substring(0, 10) : ''}  disabled />
                                </div>
                            <div className="col-md-6 mb-2">
                                <label htmlFor="telephoneAssure" className="form-label">T&eacute;l&eacute;phone du souscripteur</label>
                                <input type="text" className="form-control" id="telephoneAssure" value={data.telephoneAssure} disabled />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 px-2 ">
                        <div className="row ">
                            <div className="col-md-12 " >
                                <h6>Passeport du souscripteur</h6>
                            </div>
                        </div>
                        <div className="row mx-1  ">
                            <div className="col-md-6 mb-2 ">
                                <label htmlFor="numeroPassport" className="form-label">Num&eacute;ro de passeport</label>
                                <input type="text" className="form-control" id="numeroPassport" value={data.numeroPassport} disabled />
                            </div>
                            <div className="col-md-6 mb-2">
                                <label htmlFor="lieuDelivrance" className="form-label">Lieu de d&eacute;livrance</label>
                                <input type="text" className="form-control" id="lieuDelivrance" value={data.lieuDelivrance} disabled />
                            </div>
                        </div>
                        <div className="row mx-1  ">
                            <div className="col-md-6 mb-2 ">
                                <label htmlFor="dateDelivrance" className="form-label">Date de d&eacute;livrance</label>
                                <input type="text" className="form-control" id="dateDelivrance" value={data.dateDelivrance ? data.dateDelivrance.substring(0, 10) : ''} disabled />
                            </div>
                            <div className="col-md-6 mb-2 ">
                                <label htmlFor="dateExpiration" className="form-label">Date de l&apos;expiration</label>
                                <input type="text" className="form-control" id="dateExpiration" value={data.dateExpiration ? data.dateExpiration.substring(0, 10) : ''} disabled />
                            </div>
                        </div>

                </div>
            </div>
            <br></br>
            <section >
                    <h6>Information sur le contrat d&apos;assurance</h6>
                    <div className="row mx-1">
                        <div className="col-md-6 mb-2" >
                            <label htmlFor="numeroContrat" className="form-label">Num&eacute;ro de contrat de l&apos;assurance</label>
                            <input type="text" className="form-control" id="numeroContrat" value={data.numeroContrat} disabled />
                    </div>
                        <div className="col-md-6 mb-2 ">
                        <label htmlFor="dateSouscription" className="form-label">Date de souscription</label>
                            <input type="text" className="form-control" id="dateSouscription" value={data.dateSouscription ? data.dateSouscription.substring(0, 10) : ''} disabled />
                    </div>
                </div>
                <div className="row mx-1">
                        <div className="col-md-6 mb-2">
                            <label htmlFor="dateDepart" className="form-label">Date de d&eacute;part</label>
                            <input type="text" className="form-control" id="dateDepart" value={data.dateDepart ? data.dateDepart.substring(0, 10) : ''} disabled />
                    </div>
                        <div className="col-md-6 mb-2">
                        <label htmlFor="dateRetour" className="form-label">Date de retour</label>
                            <input type="text" className="form-control" id="dateRetour" value={data.dateRetour ? data.dateRetour.substring(0, 10) : ''} disabled />
                    </div>
                </div>
                <div className="row mx-1">
                        <div className="col-md-6 mb-3 ">
                        <label htmlFor="destination" className="form-label">Destination</label>
                            <div className="card">
                                <p className="card-text">{data.destination}</p>
                            </div>
                    </div>
                    </div>
                </section>
                <br></br>
                <form onSubmit={handleSubmit}>
                <div className="row ">
                    <div className="col-md-6 px-2" >
                        <div className="row">
                            <div className="col-md-12 " >
                                    <h6>Demande d&apos;annulation</h6>
                            </div>
                        </div>
                        <div className="row mx-1  ">
                            <div className="col-md-12 mb-2">
                                    <label htmlFor="motifAnnulation" className="form-label ">Le motif d&apos;annulation</label>
                                    <input type="text" className="form-control" id="motifAnnulation" value={data.motifAnnulation} disabled />
                            </div>
                        </div>
                        <div className="row mx-1  ">
                            <div className="col-md-12">
                                    <label htmlFor="justificatif" className="form-label">Justificatif d&apos;annulation</label>
                                    {files.length > 0 && (
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th scope="col" className="form-label" >Nom de fichier</th>
                                                    <th scope="col" className="form-label">Taille</th>
                                                    <th scope="col" className="form-label">Actions</th>
                                                </tr>
                                            </thead>
                                            {files.map((file, index) => (
                                                <tr key={index}>
                                                    <td className="form-label py-3">{truncateFileName(file.name)}</td>
                                                    <td className="form-label py-3">{file.size}</td>
                                                    <td>
                                                        <button type="button" className="btn custom-button1" onClick={() => openViewModal(file)}>
                                                            Visualiser
                                                        </button>
                                                        <Link
                                                            to={file.path}
                                                            download={`${file.name}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            <button type="button" className="btn custom-button1">T&eacute;l&eacute;charger</button>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </table>
                                    )}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 px-2 ">
                        <div className="row ">
                            <div className="col-md-12 " >
                                <h6>D&eacute;cision</h6>
                            </div>
                        </div>
                            <div className="row mx-1">
                                <div className="col-md-12 mb-2">
                                    <label className="form-label">D&eacute;cision niveau N+1 <span className="mandatory">*</span></label>
                                    <div className="col-md-12">
                                        <input
                                            type="radio"
                                            id="accepte"
                                            name="decision"
                                            value="accepte"
                                            disabled={isButtonDisabled}
                                            checked={decision === 'accepte'}
                                            onChange={handleDecisionChange}
                                        />
                                        <label htmlFor="accepte" className="form-label px-1"> Demande d&apos;annulation accept&eacute;e</label>
                                    </div>
                                    <div className="col-md-12 mb-2">
                                        <input
                                            type="radio"
                                            id="refuse"
                                            name="decision"
                                            value="refuse"
                                            disabled={isButtonDisabled}
                                            checked={decision === 'refuse'}
                                            onChange={handleDecisionChange}

                                        />
                                        <label htmlFor="refuse" className="form-label px-1" > Demande d&apos;annulation refus&eacute;e</label>
                                    </div>
                                </div>
                            </div>
                            {decision === 'refuse' && (
                            <div className="row mx-1">
                                <div className="col-md-12">
                                    <label htmlFor="motif" className="form-label">Motif <span className="mandatory">*</span></label>
                                    <textarea
                                        className="form-control p-3"
                                        id="motif"
                                        value={motif}
                                        disabled={isButtonDisabled}
                                        onChange={handleMotifChange}
                                        required
                                    />
                                </div>
                            </div>
                            )}

                    </div>
                </div>
                    <br></br>
                    {status === 'inprogress' && (
                        <div className="row justify-content-center">
                            <div className="col-md-6 text-center">
                                    <button type="submit" disabled={!decision || (decision === 'refuse' && !motif) || isButtonDisabled} className="btn custom-button">
                                        {pending ? 'Veuillez patienter...' : 'Valider'}
                                    </button>
                            </div>
                                </div>
                    )}
                </form>
                <div className={`${showConfirmation ? "overlay" : ""}`}>
                    {showConfirmation && (
                        <ConfirmationDialog
                            onConfirm={handleConfirm}
                            onCancel={handleCancel}
                        />
                    )}
                </div>
                 <div className={`${showSuccess ? "overlay" : ""}`}>
                    {showSuccess && (
                        <SuccessDialog
                            onClose={handleClose}
                        />
                    )}
                </div>
                 <div className={`${showRejected ? "overlay" : ""}`}>
                    {showRejected && (
                        <RejectedDialog
                            onClose={handleClose}
                        />
                    )}
                </div>

                <div className={`${showFail ? "overlay" : ""}`}>
                    {showFail && (
                        <FailDialog
                            onClose={handleClose}
                            errorMessage={error}
                            refundStatusList={refundStatusList}
                            totalRefundedAmount={totalRefundedAmount}
                            totalPendingAmount={totalPendingAmount}
                            numPolicy={numPolicy}
                        />
                    )}
                </div>

                <div className={`${viewFile ? "overlay" : ""}`}>
                    {viewFile && <ViewFileDialog file={viewFile} onClose={closeViewModal} />}
                </div>
        </div>
        </>
    );

}

