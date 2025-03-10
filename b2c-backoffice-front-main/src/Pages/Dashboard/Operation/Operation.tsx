//@ts-nocheck
import 'bootstrap/dist/css/bootstrap.min.css';
import "./Operation.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useParams } from 'react-router-dom';
import { useAuth } from "../../auth/core/Auth";
import { useNavigate } from 'react-router-dom';
import downloadCSV from '../../../assets/icons/Downolad-csv-icon.svg';
import printIcon from '../../../assets/icons/print-icon.svg';
import jsPDF from 'jspdf';

export default function Operation() {
    const navigate = useNavigate();

    //const { auth, role } = useAuth();
    const { auth } = useAuth();



    const { operationId, operation } = useParams();

    const [decision, setDecision] = useState(''); 
    const [motif, setMotif] = useState(''); 
    const [data, setData] = useState({
 }); 
    const [buttonText, setButtonText] = useState('Renvoyer le contrat au souscripteur');


   

    useEffect(() => {
        const fetchTasks = async () => {
            try {
              
                console.log('Operation:', operation); // Ajoutez un log pour vérifier l'opération
                console.log('OperationId:', operationId); // Ajoutez un log pour vérifier l'ID d'opération

                let url;

                // Déterminer l'URL en fonction de l'opération
                if (operation === 'Souscription' || operation === 'Modification') {
                    url = `${import.meta.env.VITE_API_GATEWAY_URL}/v1/b2c/Dashboard/DetailsOperations?POLICY_VERSION_ID=${operationId}`;
                } else if (operation === 'Annulation') {
                    url = `${import.meta.env.VITE_API_GATEWAY_URL}/v1/b2c/Dashboard/DetailsOperationsA?POLICY_VERSION_ID=${operationId}`;
                } else {
                    console.log("operation=", operation);
                    console.log("state=", state);
                    throw new Error('Invalid operation type');
                }

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${auth?.access_token}`,
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {

                    throw new Error('Failed to fetch data');
                }

                const result = await response.json();

                if (result.operation === 'S') {
                    result.operation = 'Souscription';
                } else if (result.operation === 'A') {
                    result.operation = 'Annulation';
                } else if (result.operation === 'M') {
                    result.operation = 'Modification';
                }


                if (result.offre === 'I') {
                    result.offre = 'Individuelle';
                } else if (result.offre === 'F') {
                    result.offre = 'Famille';
                }

                setData(result);
                console.log(result);
            } catch (error) {
                console.error('Error fetching data:', error.message);
            }
        };

       
        fetchTasks();
    }, []);



    useEffect(() => {
        const fetchFiles = async () => {
            try {
                if (!operationId) {
                    throw new Error('No complaintId parameter found');
                }

                // Fetch return data using the cancellationId
                const responseFile = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL}/v1/b2c/complaints/policy/${data.numPolice}`,
                    {
                        headers: {
                            Authorization: `Bearer ${auth?.access_token}`,
                            'Content-Type': 'application/json',
                        }
                    }
                );

                if (!responseFile.ok) {
                    throw new Error('Failed to fetch file');
                }

                const fileResult = await responseFile.json();

                const contentLength = fileResult.content.length;
                const fileSize = ((contentLength / 1024) / 1024).toFixed(2) + 'MB';

                const byteCharacters = atob(fileResult.content);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/octet-stream' });

                setFiles({
                    name: fileResult.filename,
                    size: fileSize,
                    path: URL.createObjectURL(blob)
                });

            } catch (error) {
                console.error('Error fetching files:', error);
            }
        };

        // Call the fetchFiles function whenever complaintId or auth changes
        fetchFiles();

    }, [operationId, data]);


    const handleSendClick = async (requestId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL}/v1/b2c/subscription/resendPolicy?policyVersionId=${operationId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth?.access_token}`,
                }
               
            });

            if (response.ok) {
                console.log('Request sent successfully:');

                // Change button text to "contrat envoyé!" if response code is 200
                    setButtonText('           contrat envoye!         ');

                // Reset button text after 10 seconds
                setTimeout(() => {
                    setButtonText('Renvoyer le contrat au souscripteur');
                }, 10000);
            } else {
                throw new Error('Failed to send request');
            }
        } catch (error) {
            console.error('Error sending request:', error);
            // Handle error response
        }
    };



    const [files, setFiles] = useState(
        { name: '', size: '', path: '' }
    );

    console.log('la taille', files.size);

    const printPage = () => {
        const section = document.querySelector('.page-container');
        if (section) {
            const originalContent = document.body.innerHTML;
            document.body.innerHTML = section.innerHTML;
            window.print();

            document.body.innerHTML = originalContent;
            window.location.reload(); // To reload the original content
        }
    };

    const downloadAsPDF = () => {
        const section = document.querySelector('.page-container');
        if (section) {
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: 'a4',
            });

            const a4Width = pdf.internal.pageSize.getWidth();  // Get the A4 width from jsPDF
            const a4Height = pdf.internal.pageSize.getHeight();

            // Calculate the scale to fit the content within the A4 page width
            const contentWidth = section.scrollWidth;
            const scaleFactor = a4Width / contentWidth;


            // Add the HTML content to the PDF
            pdf.html(section, {
                callback: function (pdf) {

                    pdf.deletePage(2);  // Deletes the second page if present
                    pdf.save('operation.pdf'); // Save the PDF with the desired file name
                },
                x: 10,
                y: 10,
                html2canvas: {
                    scale: scaleFactor  // Automatically scale to fit A4 page width
                },
                width: a4Width - 20,  // Adjust width to fit content within A4 page (leave some margins)
                height: a4Height 
            });
        }
    };
    
    return (
        <>
        <div className="container-fluid page-container">
                <h5 className="col-md-12 d-flex justify-content-between align-items-center px-2">Details de l'op&eacute;ration
                    <div>
                        <button type="button" onClick={printPage} className="btn download-button mx-2" >
                            <img className="mx-1" src={printIcon} alt="" style={{ width: '1.5rem', height: '1.5rem' }} />
                                Impression
                        </button>
                        <button type="button" onClick={downloadAsPDF} className="btn download-button" >
                            <img className="mx-1" src={downloadCSV} alt="" style={{ width: '1.5rem', height: '1.5rem' }} />
                            Exporter en PDF
                        </button>
                    </div>
                </h5>
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
                                <input type="text" className="form-control" id="nomAssure" value={data.nom}  disabled />
                                </div>
                            <div className="col-md-6 mb-2">
                                <label htmlFor="prenomAssure" className="form-label">Pr&eacute;nom du souscripteur</label>
                                <input type="text" className="form-control" id="prenomAssure" value={data.prenom} disabled />
                            </div>
                        </div>
                        <div className="row mx-1  ">
                            <div className="col-md-6 mb-2">
                                <label htmlFor="dateNaissance" className="form-label">Date de naissance du souscripteur</label>
                                <input type="text" className="form-control" id="dateNaissance" value={data.dateNaissance ? data.dateNaissance.substring(0, 10) : ''}  disabled />
                                </div>
                            <div className="col-md-6 mb-2">
                                <label htmlFor="telephoneAssure" className="form-label">Sexe du souscripteur</label>
                                <input type="text" className="form-control" id="telephoneAssure" value={data.sexe} disabled />
                            </div>
                        </div>
                        <div className="row mx-1  ">
                            <div className="col-md-6 mb-2">
                                <label htmlFor="dateNaissance" className="form-label">Email du souscripteur</label>
                                <input type="text" className="form-control" id="dateNaissance" value={data.email ? data.email : ''} disabled />
                            </div>
                            <div className="col-md-6 mb-2">
                                <label htmlFor="telephoneAssure" className="form-label">T&eacute;l&eacute;phone du souscripteur</label>
                                <input type="text" className="form-control" id="telephoneAssure" value={data.telephone} disabled />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 px-2 ">
                        <div className="row ">
                            <div className="col-md-12 " >
                                <h6>Information sur le contrat d&apos;assurance</h6>
                            </div>
                        </div>
                            <div className="row mx-1">
                                <div className="col-md-6 mb-2" >
                                    <label htmlFor="numeroContrat" className="form-label">Num&eacute;ro de contrat de l&apos;assurance</label>
                                <input type="text" className="form-control" id="numeroContrat" value={data.numPolice} disabled />
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
                                    <label htmlFor="destination" className="form-label">Montant</label>
                                    <div className="card">
                                    <p className="card-text">{data.montant} DZD</p>
                                    </div>
                            </div>
                            <div className="col-md-6 mb-3 ">
                                <label htmlFor="destination" className="form-label">Operation</label>
                                <div className="card">
                                    <p className="card-text">{data.operation}</p>
                                </div>
                            </div>
                            </div>
                           

                </div>
                </div>

                <div className="row ">
                    <div className="col-md-6 px-2" >
                        <div className="row">
                            <div className="col-md-12 " >
                                <h6>Passeport du souscripteur</h6>
                            </div>
                        </div>

                        <div className="row mx-1  ">
                            <div className="col-md-6 mb-2 ">
                                <label htmlFor="numeroPassport" className="form-label">Num&eacute;ro de passeport</label>
                                <input type="text" className="form-control" id="numeroPassport" value={data.numPassport} disabled />
                            </div>
                            <div className="col-md-6 mb-2">
                                <label htmlFor="lieuDelivrance" className="form-label">Lieu de d&eacute;livrance</label>
                                <input type="text" className="form-control" id="lieuDelivrance" value={ data.listAssures ? data.listAssures[0].commune  : '' } disabled />
                            </div>
                        </div>
                        <div className="row mx-1  ">
                            <div className="col-md-6 mb-2 ">
                                <label htmlFor="dateDelivrance" className="form-label">Date de d&eacute;livrance</label>
                                <input type="text" className="form-control" id="dateDelivrance" value={data.listAssures ? data.listAssures[0].dateDelivrancepasseport.substring(0, 10) : ''} disabled />
                            </div>
                            <div className="col-md-6 mb-2 ">
                                <label htmlFor="dateExpiration" className="form-label">Date de l&apos;expiration</label>
                                <input type="text" className="form-control" id="dateExpiration" value={data.listAssures ? data.listAssures[0].dateDelivrancepasseport.substring(0, 10) : ''} disabled />
                            </div>
                        </div>

                    </div>
                    <div className="col-md-6 px-2 ">
                        <div className="row ">
                            
                        </div>
                        <div className="row mx-1">
                            <div className="col-md-6 mb-2" >
                                <label htmlFor="numeroContrat" className="form-label">Offre</label>
                                <input type="text" className="form-control" id="numeroContrat" value={data.zone} disabled />
                            </div>
                            <div className="col-md-6 mb-2 ">
                                <label htmlFor="dateSouscription" className="form-label">Formule</label>
                                <input type="text" className="form-control" id="dateSouscription" value={data.offre} disabled />
                            </div>
                        </div>
                        <div className="row mx-1">
                            <div className="col-md-6 mb-2">
                                <label htmlFor="dateDepart" className="form-label">Destination</label>
                                <input type="text" className="form-control" id="dateDepart" value={data.pays} disabled />
                            </div>
                            <div className="col-md-6 mb-2">
                                <label htmlFor="dateRetour" className="form-label">Partenaire</label>
                                <input type="text" className="form-control" id="dateRetour" value={data.partenaire} disabled />
                            </div>
                        </div>



                    </div>
                </div>
    
            <br></br>
              
                <form >
                    <div className="row operations">
                    <div className="col-md-12 px-2" >
                        <div className="row">
                            <div className="col-md-12 " >
                                    <h6>Contrat d'assrurance</h6>
                            </div>
                        </div>
                        <div className="row mx-1  ">
                            <div className="col-md-12">
                                  
                                    {files && (
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th scope="col" className="form-label" >Nom de fichier</th>
                                                    <th scope="col" className="form-label">Taille</th>
                                                    <th scope="col" className="form-label">Actions</th>
                                                </tr>
                                            </thead>
                                                <tr >
                                                    <td className="form-label py-3">{files.name}</td>
                                                    <td className="form-label py-3">{files.size}</td>
                                                    <td>
                                                       
                                                        <Link
                                                            to={files.path}
                                                            download={`${files.name}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            <button type="button" className="btn custom-button1">T&eacute;l&eacute;charger</button>
                                                    </Link>
                                                    <button type="button" className="btn custom-button1" onClick={() => handleSendClick(operationId)}> {buttonText}</button>
                                                    </td>
                                                </tr>
                                        </table>
                                    )}
                            </div>
                        </div>
                    </div>
                   
                </div>
                <br></br>
                <div className="row justify-content-center">
                </div>
                </form>
                


        </div>
        </>
    );

}