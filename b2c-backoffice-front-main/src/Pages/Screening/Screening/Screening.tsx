import 'bootstrap/dist/css/bootstrap.min.css';
import "./Screening.css";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faDownload } from '@fortawesome/free-solid-svg-icons';
import ViewFileDialog from '../../../Components/ViewFileDialog/ViewFileDialog';
import { Link } from "react-router-dom";
import { useParams } from 'react-router-dom';
import { useAuth } from "../../auth/core/Auth";
import SuccessDialog from './ResultDialogs/SuccessDialog';
import ConfirmationDialog from "../../../Components/ConfirmationDialog/ConfirmationDialog";
import { useNavigate } from 'react-router-dom';

export default function Screening() {
    const navigate = useNavigate();

    const { auth } = useAuth();

    const { screeningId } = useParams();
    const [data, setData] = useState({
        nomAssure: '',
        prenomAssure: '',
        dateNaissance: '',
        telephoneAssure: '',
        emailAssure: '',
        sexeAssure: '',
        lieuNaissance: '',
        nationaliteAssure: '',
        villeAssure: '',
        communeAssure: '',
        codePostal: '',
        adresseAssure:'',
        numeroPassport: '',
        lieuDelivrance: '',
        dateDelivrance: '',
        dateExpiration: '',
        pourcentageHit: '',
        passportFilename: '',
        screeningStatusOpn: '',
        dateStatusOpn: '',
        opEmailOpn: '',
        motifStatusOpn: '',
    });
       
    const [file, setFile] = useState(
        { name: '', size: '0', path: '' }
    );

    const [viewFile, setViewFile] = useState(null);

    const [decision, setDecision] = useState('');
    const [motif, setMotif] = useState(''); 
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false); //used to disable button valider after submitting decision
    const [showSuccess, setShowSuccess] = useState(false);
    const [pending, setPending] = useState(false);

    const openViewModal = (file) => {
        setViewFile(file);
    };

    const closeViewModal = () => {
        setViewFile(null);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!screeningId) {
                    throw new Error('No screeningId parameter found');
                }

                // Fetch return data using the cancellationId
                const responseData = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL
                    }/v1/b2c/screening/screeningDetails?screeningId=${screeningId}`, {
                    headers: {
                        Authorization: `Bearer ${auth?.access_token}`
                    }
                });
                if (!responseData.ok) {
                    throw new Error('Failed to fetch return data');
                }
                const resultData = await responseData.json();
                setData(resultData);
                setMotif(resultData.motifStatusOpn);
                setDecision(resultData.screeningStatusOpn);
                console.log(resultData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        // Call the fetchData function
        fetchData();
    }, []); // Add cancellationId as a dependency

     useEffect(() => {
        const fetchFile = async () => {
            try {
                if (!screeningId) {
                    throw new Error('No cancellationId parameter found');
                }

                // Fetch return data using the cancellationId
                const responseFile = await fetch(`${
							import.meta.env.VITE_API_GATEWAY_URL
						}/v1/b2c/screening/screeningPassport?screeningId=${screeningId}`, {
                    headers: {
                        Authorization: `Bearer ${auth?.access_token}`
                    }
                });
                if (!responseFile.ok) {
                    throw new Error('Failed to fetch file');
                }

                let fileName = 'unknown';
                let fileSize = 'unknown';

                const dataFile = await responseFile.json(); 
                console.log("dataFile:" + dataFile.content);
                // Access fileName from data state
                fileName = data.passportFilename;
                console.log("filename:" + fileName);
                const contentLength = dataFile[0].content.length;
                fileSize = ((contentLength / 1024) / 1024).toFixed(2) + 'MB';
                console.log("filesize:" + fileSize)

                // Construct the file data object
                const fileData = {
                    name: fileName,
                    size: fileSize,
                    path: `data:application/octet-stream;base64,${dataFile[0].content}`
                };

               // Set the file data
                setFile(fileData);
            } catch (error) {
                console.error('Error fetching file:', error);
            }
        };

        // Call the fetchFile function whenever data changes
        fetchFile();
     }, [data]);


    // Function to handle form submission
    const handleSubmit = (event) => {
        event.preventDefault();
        setShowConfirmation(true); // Show the confirmation dialog
    };

    const handleDecisionChange = (event) => {
        setDecision(event.target.value);
    };

    // Function to handle change in motif input
    const handleMotifChange = (event) => {
        setMotif(event.target.value);
    };


    const handleClose = () => {
        setShowSuccess(false);
        setTimeout(() => {
            navigate('/');
        }, 1000);
    };


    // Function to handle confirmation
    const handleConfirm = () => {
        // Check if decision is not empty
        if (decision) {
          
            let submission;
            if (decision === 'accepte') {
                submission = {
                    MOTIF_STATUS: motif,  
                    SCREENING_ID: screeningId,
                    SCREENING_STATUS_ID: 1  // Setting SCREENING_STATUS_ID to 1 for 'accepte'
                };
            } else if (decision === 'refuse') {
                submission = {
                    MOTIF_STATUS: motif,  
                    SCREENING_ID: screeningId,
                    SCREENING_STATUS_ID: 2  // Setting SCREENING_STATUS_ID to 2 for 'refuse'
                };
            }

            // Log the submission object
            console.log('Form submitted:', submission);

            // Call the function to submit the cancellation request
            submitHitRequest(submission);

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


    const submitHitRequest = (payload) => {
        setPending(true);
        fetch(`${import.meta.env.VITE_API_GATEWAY_URL
            }/v1/b2c/TreatmentScreening/OPN/processTreatmentNRequest`
            , {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${auth?.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })
            .then(response => {
                setPending(false);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                else {
                    setIsButtonDisabled(true);
                    setShowSuccess(true);
                }
            })
            .then(data => {
                setPending(false);
                console.log('Response:', data);
                // Handle success response here if needed
            })
            .catch(error => {
                setPending(false);
                console.error('There was a problem with the fetch operation:', error.message);
                // Handle error here if needed
            });
    };

    return (
        <>
            <div className="container-fluid page-container">
                <h5>Controle de demande</h5>
                <br></br>
                <section >
                    <h6>Information sur le souscripteur</h6>


                    <div className="row mx-1">
                        <div className="col-md-6 mb-2" style={{ position: 'relative' }} >
                            <label htmlFor="numeroContrat" className="form-label">Pourcentage de correspondance</label>
                            <input type="text" className="form-control" id="numeroContrat" value={data.pourcentageHit} disabled />
                            <input type="text" className="form-control" id="numeroContrat" value="%" disabled style={{ position: 'absolute', width: '38px', right: '0', bottom: '0' , fontWeight:"bold"  }} />

                        </div>
                    </div>
                    <div className="row mx-1">
                        <div className="col-md-6 mb-2">
                            <label htmlFor="dateDepart" className="form-label">Sexe du souscripteur</label>
                            <div className="col-md-12">
                                <input
                                    type="radio"
                                    disabled="true"
                                    checked={data.sexeAssure == 'Homme'}
                                />
                                <label htmlFor="homme" className="form-label px-1"> Homme</label>

                                <input
                                    type="radio"
                                    disabled="true"
                                    checked={data.sexeAssure == 'Femme'}
                                />
                                <label htmlFor="femme" className="form-label px-1"> Femme</label>

                            </div>
                        </div>
                        <div className="col-md-6 mb-2">
                                <label htmlFor="dateRetour" className="form-label">Nationalit&eacute; du souscripteur</label>
                                <input type="text" className="form-control" id="dateRetour" value={data.nationaliteAssure} disabled />
                        </div>
                    </div>
                    <div className="row mx-1">
                        <div className="col-md-6 mb-2 ">
                            <label htmlFor="destination" className="form-label">Nom du souscripteur</label>
                            <input type="text" className="form-control" id="dateRetour" value={data.nomAssure} disabled />
                        </div>
                        <div className="col-md-6 mb-2 ">
                            <label htmlFor="destination" className="form-label">Pr&eacute;nom du souscripteur</label>
                            <input type="text" className="form-control" id="dateRetour" value={data.prenomAssure} disabled />
                        </div>
                    </div>
                    <div className="row mx-1">
                        <div className="col-md-6 mb-2 ">
                            <label htmlFor="destination" className="form-label">Date de naissance du souscripteur</label>
                            <input type="text" className="form-control" id="dateRetour" value={data.dateNaissance ? data.dateNaissance.substring(0, 10) : ''} disabled />
                        </div>
                        <div className="col-md-6 mb-2 ">
                            <label htmlFor="destination" className="form-label">Lieu de naissance du souscripteur</label>
                            <input type="text" className="form-control" id="dateRetour" value={data.lieuNaissance} disabled />
                        </div>
                    </div>
                    <div className="row mx-1">
                        <div className="col-md-6 mb-2 ">
                            <label htmlFor="destination" className="form-label">Email du souscripteur</label>
                            <input type="text" className="form-control" id="dateRetour" value={data.emailAssure} disabled />
                        </div>
                        <div className="col-md-6 mb-2 ">
                            <label htmlFor="destination" className="form-label">T&eacute;l&eacute;phone du souscripteur</label>
                            <input type="text" className="form-control" id="dateRetour" value={data.telephoneAssure} disabled />
                        </div>
                    </div>
                    <div className="row mx-1">
                        <div className="col-md-6 mb-2 ">
                            <label htmlFor="destination" className="form-label">Ville du souscripteur</label>
                            <input type="text" className="form-control" id="dateRetour" value={data.villeAssure} disabled />
                        </div>
                        <div className="col-md-6 mb-2 ">
                            <label htmlFor="destination" className="form-label">Commune du souscripteur</label>
                            <input type="text" className="form-control" id="dateRetour" value={data.communeAssure} disabled />
                        </div>
                    </div>
                    <div className="row mx-1">
                        <div className="col-md-6 mb-2 ">
                            <label htmlFor="destination" className="form-label">Code postal du souscripteur</label>
                            <input type="text" className="form-control" id="dateRetour" value={data.codePostal} disabled />
                        </div>
                        <div className="col-md-6 mb-2 ">
                            <label htmlFor="destination" className="form-label">Adresse du souscripteur</label>
                            <input type="text" className="form-control" id="dateRetour" value={data.adresseAssure} disabled />
                        </div>
                    </div>
                  

                </section>
                <br></br>
                <section >
                    <h6>Information sur le passeport du souscripteur</h6>
                    <div className="row mx-1">
                        <div className="col-md-6 mb-2 ">
                            <label htmlFor="destination" className="form-label">Num&eacute;ro de passeport</label>
                            <input type="text" className="form-control" id="dateRetour" value={data.numeroPassport} disabled />
                        </div>
                        <div className="col-md-6 mb-2 ">
                            <label htmlFor="destination" className="form-label">Lieu de d&eacute;livrance</label>
                            <input type="text" className="form-control" id="dateRetour" value={data.lieuDelivrance} disabled />
                        </div>
                    </div>
                    <div className="row mx-1">
                        <div className="col-md-6 mb-2 ">
                            <label htmlFor="destination" className="form-label">Date de d&eacute;livrance</label>
                            <input type="text" className="form-control" id="dateRetour" value={data.dateDelivrance ? data.dateDelivrance.substring(0, 10) : ''} disabled />
                        </div>
                        <div className="col-md-6 mb-2 ">
                            <label htmlFor="destination" className="form-label">Date de l&apos;expiration</label>
                            <input type="text" className="form-control" id="dateRetour" value={data.dateExpiration ? data.dateExpiration.substring(0, 10) : ''} disabled />
                        </div>
                    </div>
                     <div className="row mx-1">
                        <div className="col-md-12 mb-2 ">
                             <label htmlFor="justificatif" className="form-label">Le passeport du souscripteur</label>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th scope="col" className="form-label" >Nom de fichier</th>
                                                <th scope="col" className="form-label">Taille</th>
                                                <th scope="col" className="form-label">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>             
                                                <tr >
                                                <td className="form-label py-3" >{file.name}</td>
                                                <td className="form-label py-3">{file.size}</td>
                                                    <td>

                                                   
                                                 
                                                        <button type="button" className="bbtn custom-button1" onClick={() => openViewModal(file)}>
                                                          {/*   <FontAwesomeIcon icon={faEye} /> */} Visualiser
                                                        </button>


                                                        <Link className="btn btn-success btn-sm custom-icon"
                                                            to={file.path}
                                                            download={`${file.name}`}
                                                            target="_blank"
                                                            rel="noreferrer"

                                                        >
                                                             {/*<FontAwesomeIcon icon={faDownload} /> /> */} 
                                                             <button type="button" className="btn custom-button1">T&eacute;l&eacute;charger</button>
                                                        </Link>
                                                    </td>
                                                </tr>

                                        </tbody>
                                    </table>
                        </div>
                        
                    </div>


                </section>
                {data.pourcentageHit !== 0 && (
                    <form onSubmit={handleSubmit}>
                        <div className="row ">
                            <div className="col-md-12 px-2 ">
                                <div className="row ">
                                    <div className="col-md-12 " >
                                        <h6>D&eacute;cision</h6>
                                    </div>
                                </div>
                                <div className="row mx-1">
                                    <div className="col-md-6 mb-2">
                                        <label className="form-label">D&eacute;cision niveau N <span className="mandatory">*</span></label>
                                        <div className="col-md-12">
                                            <input
                                                type="radio"
                                                id="accepte"
                                                name="decision"
                                                value="accepte"
                                                disabled={isButtonDisabled || data.screeningStatusOpn}
                                                checked={decision === 'accepte' || decision == '1' }
                                                onChange={handleDecisionChange}
                                            />
                                            <label htmlFor="accepte" className="form-label px-1"> Hit positif whitelist&eacute;</label>
                                        </div>
                                        <div className="col-md-12 mb-2">
                                            <input
                                                type="radio"
                                                id="refuse"
                                                name="decision"
                                                value="refuse"
                                                disabled={isButtonDisabled || data.screeningStatusOpn}
                                                checked={decision === 'refuse' || decision == '2'}
                                                onChange={handleDecisionChange}

                                            />
                                            <label htmlFor="refuse" className="form-label px-1" > Hit positif bloqu&eacute;</label>
                                        </div>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <label htmlFor="motif" className="form-label">Motif </label>
                                        <textarea
                                            className="form-control p-3"
                                            id="motif"
                                            value={motif}
                                            disabled={isButtonDisabled || data.screeningStatusOpn}
                                            onChange={handleMotifChange}
                                        />
                                    </div>
                                </div>



                            </div>
                        </div>
                        <br></br>
                        <div className="row justify-content-center">
                            <div className="col-md-6 text-center">
                                <button type="submit" disabled={!decision || data.screeningStatusOpn || isButtonDisabled} className="btn custom-button">
                                    {pending ? 'Veuillez patienter...' : 'Valider'}
                                </button>
                            </div>
                        </div>
                    </form>
                )}

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

              

            <div className={`${viewFile ? "overlay" : ""}`}>
                    {viewFile && <ViewFileDialog file={viewFile} onClose={closeViewModal} />}
                </div>

            </div>
        </>
    );
}