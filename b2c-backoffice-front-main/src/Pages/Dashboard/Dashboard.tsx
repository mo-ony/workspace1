import 'bootstrap/dist/css/bootstrap.min.css';
import "./Dashboard.css";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../auth/core/Auth";
import { useNavigate } from 'react-router-dom';
import arrowUp from '../../assets/icons/faArrowUpAZ.svg';
import arrowDown from '../../assets/icons/faArrowDownAZ.svg';
import arrowNext from '../../assets/icons/next-icon.svg';
import arrowPrevious from '../../assets/icons/previous-icon.svg';
import arrowFirstPage from '../../assets/icons/first-page-icon.svg';
import arrowLastPage from '../../assets/icons/last-page-icon.svg';
import downloadCSV from '../../assets/icons/Downolad-csv-icon.svg';
import '@fortawesome/fontawesome-free/css/all.min.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function Dashboard() {

    const { auth } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);


    const filterCardRef = useRef(null);

    const scrollToFilterCard = () => {
        if (filterCardRef.current) {
            filterCardRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const navigate = useNavigate();


    const handleRowClick = (operationId, operation) => {
        navigate(`/Operation/${operationId}/${operation}`);
    };

    const [initialTasks, setInitialTasks] = useState([]);
    const [tasks, setTasks] = useState(initialTasks);


    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL
                    }/v1/b2c/Dashboard/AllOperations`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${auth?.access_token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }

                const data = await response.json();
                data.forEach(item => { 

                    const [day, month, year] = item.dateSouscription.split('/');
                    item.dateSouscription = `${year}-${month}-${day}`;

                    const [day1, month1, year1] = item.dateDepart.split('/');
                    item.dateDepart = `${year1}-${month1}-${day1}`;

                    const [day2, month2, year2] = item.dateRetour.split('/');
                    item.dateRetour = `${year2}-${month2}-${day2}`;

                    if (item.operation === 'S') {
                        item.operation = 'Souscription';
                    } else if (item.operation === 'A') {
                        item.operation = 'Annulation';
                    } else if (item.operation === 'M') {
                        item.operation = 'Modification';
                    }

                    // Transform offre
                    if (item.offre === 'F') {
                        item.offre = 'Famille';
                    } else if (item.offre === 'I') {
                        item.offre = 'Individuelle';
                    }

                });
                setInitialTasks(data);
                setTasks(data);
                console.log(tasks);
            } catch (error) {
                console.error('Error fetching data:', error.message);
            } finally {
                setLoading(false); // Set loading to false after fetch is complete
            }
        };

        fetchTasks();
    }, []);

    const [totalSubscriptions, setTotalSubscriptions] = useState(0);
    const [totalModifications, setTotalModifications] = useState(0);
    const [totalCancellations, setTotalCancellations] = useState(0);
    const [totalClients, setTotalClients] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // State pour compter les filtres sélectionnés
    const [selectedFiltersCount, setSelectedFiltersCount] = useState(0);

    useEffect(() => {
        // Calcul des totaux à partir de tasks
        const souscriptions = tasks.filter(task => task.operation === 'Souscription').length;
        const modifications = tasks.filter(task => task.operation === 'Modification').length;
        const annulations = tasks.filter(task => task.operation === 'Annulation').length;
        const clients = new Set(tasks.map(task => task.email)).size; // Nombre unique de clients
        const pages = Math.ceil(tasks.length / rowsPerPage);
        setTotalPages(pages > 0 ? pages : 1);
        setTotalSubscriptions(souscriptions);
        setTotalModifications(modifications);
        setTotalCancellations(annulations);
        setTotalClients(clients);
    }, [tasks]);


    const [sortDirection, setSortDirection] = useState({
        numPolice: 'asc',
        operation: 'asc',
        dateSouscription: 'asc',
        zone: 'asc',
        offre: 'asc',
        montant: 'asc',
        partenaire: 'asc',
        email: 'asc'
    });


    const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(Number(event.target.value));
        setCurrentPage(1);
    };


    const [clickedColumn, setClickedColumn] = useState(null);
    const [dateRange, setDateRange] = useState([]);
    const [filters, setFilters] = useState({
        operation: [],
        zone: [],
        offre: [],
        partenaire: [],
        DateSouscription: { from: null, to: null },
        DateDepart: { from: null, to: null },
        DateRetour: { from: null, to: null }
    });

    const operation1Ref = useRef(null);
    const operation2Ref = useRef(null);
    const operation3Ref = useRef(null);
    const zone1Ref = useRef(null);
    const zone2Ref = useRef(null);
    const zone3Ref = useRef(null);
    const formule1Ref = useRef(null);
    const formule2Ref = useRef(null);
    const partenaire1Ref = useRef(null);
    const partenaire2Ref = useRef(null);
    const partenaire3Ref = useRef(null);


    // Ref for RangePicker
    const dateoperationRangePickerRef = useRef(null);
    const dateDepartPickerRef = useRef(null);
    const dateRetourPickerRef = useRef(null);

    const resetCheckboxInputs = () => {
        operation1Ref.current.checked = false;
        operation2Ref.current.checked = false;
        operation3Ref.current.checked = false;
    };

    // Function to reset checkboxes for zone filter
    const resetCheckboxInputszone = () => {
        if (zone1Ref.current) {
            zone1Ref.current.checked = false;
        }
        if (zone2Ref.current) {
            zone2Ref.current.checked = false;
        }
        if (zone3Ref.current) {
            zone3Ref.current.checked = false;
        }
    };

    // Function to reset checkboxes for offre filter
    const resetCheckboxInputsoffre = () => {
        if (formule1Ref.current) {
            formule1Ref.current.checked = false;
        }
        if (formule2Ref.current) {
            formule2Ref.current.checked = false;
        }
    };

    // Function to reset checkboxes for partenaire filter
    const resetCheckboxInputspartenaire = () => {
        if (partenaire1Ref.current) {
            partenaire1Ref.current.checked = false;
        }
        if (partenaire2Ref.current) {
            partenaire2Ref.current.checked = false;
        }
        if (partenaire3Ref.current) {
            partenaire3Ref.current.checked = false;
        }
    };


    const resetDateRangePicker = () => {

        if (dateoperationRangePickerRef.current) {
            const picker = dateoperationRangePickerRef.current.picker;
            if (picker && picker.clearUncontrolledValue) {
                picker.clearUncontrolledValue();
            } else {
                console.error('Picker or clearUncontrolledValue method is not available');
            }
        } else {
            console.error('RangePicker ref is not available');
        }
    };

    // Function to reset date picker inputs
   // const resetDatePickerInputs = () => {
   //     if (dateDepartPickerRef.current) {
    //        dateDepartPickerRef.current.picker.clearUncontrolledValue();
   //     }
   //     if (dateRetourPickerRef.current) {
   //         dateRetourPickerRef.current.picker.clearUncontrolledValue();
   //     }
  //  };


    const handleCheckboxChange = (filterType, value) => {
        const updatedFilters = { ...filters };
        if (updatedFilters[filterType].includes(value)) {
            updatedFilters[filterType] = updatedFilters[filterType].filter(item => item !== value);
        } else {
            updatedFilters[filterType] = [...updatedFilters[filterType], value];
        }
        setFilters(updatedFilters);
    };

    const handleDateRangeChangee = (dates, dateStrings) => {
        const updatedFilters = { ...filters };
        updatedFilters.DateSouscription = { from: dateStrings[0], to: dateStrings[1] };
        setFilters(updatedFilters);
        console.log('Selected Date Range:', updatedFilters.DateSouscription);
    };

    const handleDateRangeChange = (name, startDate, endDate) => {
        const updatedFilters = { ...filters };
        updatedFilters[name] = { from: startDate, to: endDate };
        setFilters(updatedFilters);
        console.log('Selected Date Range:', updatedFilters[name]);
    };

    // Fonction pour réinitialiser tous les filtres
    const handleResetFilters = () => {
        console.log("resetting filters");
        setCurrentPage(1);
        setFilters({
            operation: [],
            zone: [],
            offre: [],
            partenaire: [],
            DateSouscription: { from: null, to: null },
            DateDepart: { from: null, to: null },
            DateRetour: { from: null, to: null }
        });

        resetCheckboxInputs();
        resetCheckboxInputszone();
        resetCheckboxInputsoffre();
        resetCheckboxInputspartenaire();
        resetDateRangePicker();


        // Rétablir toutes les tâches initiales
        setTasks(initialTasks);

        // Réinitialiser le tri
        setSortDirection({
            numPolice: 'asc',
            operation: 'asc',
            dateSouscription: 'asc',
            zone: 'asc',
            offre: 'asc',
            montant: 'asc',
            partenaire: 'asc',
            email: 'asc',
        });

        setClickedColumn(null); // Réinitialiser la colonne cliquée

        // Scroll to the top of the page
        scrollToFilterCard();
    };
    const handleApplyFilters = () => {
        // Apply filters logic here and update tasks accordingly
        console.log("Applying filters:", filters);

        setCurrentPage(1);
        // Example: Filter tasks based on selected filters
        const filteredTasks = initialTasks.filter(task => {


            if (filters.operation.length > 0 && !filters.operation.includes(task.operation)) {
                return false;
            }
            if (filters.zone.length > 0 && !filters.zone.includes(task.zone)) {
                return false;
            }
            if (filters.offre.length > 0 && !filters.offre.includes(task.offre)) {
                return false;
            }
            if (filters.partenaire.length > 0 && !filters.partenaire.includes(task.partenaire)) {
                return false;
            }
           
            // Add logic for date range filtering if necessary
            if (filters.DateSouscription.from && filters.DateSouscription.to) {
                const taskDate = new Date(task.dateSouscription);
                const fromDate = new Date(filters.DateSouscription.from);
                const toDate = new Date(filters.DateSouscription.to);
                toDate.setDate(toDate.getDate() + 1);

                if (taskDate < fromDate || taskDate > toDate) {
                    return false;
                }


            }
            // Add logic for date range filtering if necessary
            if (filters.DateDepart.from && filters.DateDepart.to) {
                console.log("hereee");
                const taskDate1 = new Date(task.dateDepart);
                const fromDate1 = new Date(filters.DateDepart.from);
                const toDate1 = new Date(filters.DateDepart.to);
                toDate1.setDate(toDate1.getDate() + 1);
                console.log("datestart:", taskDate1);
                console.log("date from:", fromDate1);
                console.log("date to:", toDate1);
                if (taskDate1 < fromDate1 || taskDate1 > toDate1) {
                    return false;
                }
            }

            // Add logic for date range filtering if necessary
            if (filters.DateRetour.from && filters.DateRetour.to) {
                const taskDate2 = new Date(task.dateRetour);
                const fromDate2 = new Date(filters.DateRetour.from);
                const toDate2 = new Date(filters.DateRetour.to);
                toDate2.setDate(toDate2.getDate() + 1);
                if (taskDate2 < fromDate2 || taskDate2 > toDate2) {
                    return false;
                }
            }

            return true;
        });
        setTasks(filteredTasks);

        // Scroll to the top of the page
        scrollToFilterCard();
    };

    const handleSort = (columnName) => {
        const sortedTasks = [...tasks].sort((a, b) => {
            let aValue = a[columnName];
            let bValue = b[columnName];

            // Special case for "montant" column
            if (columnName === 'montant') {
                aValue = parseFloat(aValue.replace(' DZD', ''));
                bValue = parseFloat(bValue.replace(' DZD', ''));
            }

            if (sortDirection[columnName] === 'asc') {
                return aValue < bValue ? -1 : 1;
            } else {
                return aValue > bValue ? -1 : 1;
            }
        });
        setTasks(sortedTasks);

        setSortDirection(prevState => ({
            ...prevState,
            [columnName]: prevState[columnName] === 'asc' ? 'desc' : 'asc'
        }));

        setClickedColumn(columnName);
    };

    const renderTableRows = () => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return tasks.slice(startIndex, endIndex).map((task, index) => (
            <tr key={`${task.index}`} onClick={() => handleRowClick(task.POLICY_VERSION_ID, task.operation)} className="row-hover1">
                <td style={{ width: "15%" }}>{task.numPolice}</td>
                <td style={{ width: "10%" }}>{task.operation}</td>
                <td style={{ width: "15%" }}>{task.dateSouscription}</td>
                <td style={{ width: "10%" }}>{task.zone}</td>
                <td style={{ width: "10%" }}>{task.offre}</td>
                <td style={{ width: "10%" }}>{task.montant}</td>
                <td style={{ width: "6%" }}>{task.partenaire}</td>
                <td style={{ width: "14%" }}>
                    {task.email && task.email.length > 30 ? `${task.email.substring(0, 30)}...` : task.email}
                </td>
            </tr>
        ));
    };

    const downloadTasksCSV = () => {
        const headers = 'idclient;numPolice;dateNaissance;dateSouscription;paymentNumAutorisation;sexe;nom;prenom;adresse;codePostal;njf;ville;nationalite;telephone;dateDepart;dateRetour;operation;pays;montant;naturePersonne;offre;partenaire;zone;nom1;prenom1;datenaissance1;nom2;prenom2;datenaissance2;nom3;prenom3;datenaissance3;nom4;prenom4;datenaissance4;nom5;prenom5;datenaissance5;nom6;prenom6;datenaissance6;nom7;prenom7;datenaissance7;nom8;prenom8;datenaissance8;nom9;prenom9;datenaissance9;nom10;prenom10;datenaissance10';

        const csvContent = [
            headers,
            ...tasks.map(task => {
                return [
                    task.idclient, task.numPolice, task.dateNaissance, task.dateSouscription, task.paymentNumAutorisation,
                    task.sexe, task.nom, task.prenom, task.adresse, task.codePostal, task.njf, task.ville, task.nationalite,
                    task.telephone, task.dateDepart, task.dateRetour, task.operation, task.pays, task.montant, task.naturePersonne,
                    task.offre, task.partenaire, task.zone, task.nom1, task.prenom1, task.datenaissance1, task.nom2, task.prenom2,
                    task.datenaissance2, task.nom3, task.prenom3, task.datenaissance3, task.nom4, task.prenom4, task.datenaissance4,
                    task.nom5, task.prenom5, task.datenaissance5, task.nom6, task.prenom6, task.datenaissance6, task.nom7, task.prenom7,
                    task.datenaissance7, task.nom8, task.prenom8, task.datenaissance8, task.nom9, task.prenom9, task.datenaissance9,
                    task.nom10, task.prenom10, task.datenaissance10
                ].join(';');
            })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'tasks.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    const [operationCollapsed, setoperationCollapsed] = useState(false);
    const [zoneCollapsed, setzoneCollapsed] = useState(false);
    const [formuleCollapsed, setFormuleCollapsed] = useState(false);
    const [partenaireCollapsed, setpartenaireCollapsed] = useState(false);
    const [dateSouscriptionCollapsed, setdateSouscriptionCollapsed] = useState(false);
    const [dateDepartCollapsed, setDateDepartCollapsed] = useState(false);
    const [dateRetourCollapsed, setDateRetourCollapsed] = useState(false);
    const [destinationCollapsed, setDestinationCollapsed] = useState(false);

    const countries = [
        { value: 'espagne', label: 'Espagne' },
        { value: 'france', label: 'France' },
        { value: 'italie', label: 'Italie' },
        { value: 'tunisie', label: 'Tunisie' },
        // Add more countries as needed
    ];

    const handleDestinationChange = (selectedCountry) => {
        setDestination(selectedCountry);
        // Perform any additional filtering logic or state updates here
    };

    const toggleCollapse = (section) => {
        switch (section) {
            case 'operation':
                setoperationCollapsed(!operationCollapsed);
                break;
            case 'zone':
                setzoneCollapsed(!zoneCollapsed);
                break;
            case 'formule':
                setFormuleCollapsed(!formuleCollapsed);
                break;
            case 'partenaire':
                setpartenaireCollapsed(!partenaireCollapsed);
                break;
            case 'dateSouscription':
                setdateSouscriptionCollapsed(!dateSouscriptionCollapsed);
                break;
            case 'dateDepart':
                setDateDepartCollapsed(!dateDepartCollapsed);
                break;
            case 'dateRetour':
                setDateRetourCollapsed(!dateRetourCollapsed);
                break;
            case 'destination':
                setDestinationCollapsed(!destinationCollapsed);
                break;
            default:
                break;
        }
    };

    return (
        <>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    Loading...
                </div>
            ) : (
                <div className="container-fluid page-container-dashboard">
                    <div className="container" ref={filterCardRef}>
                        <div className="row ">
                            <div className="col-md-3">
                                <div className="custom-green-card bg-c-green order-card">
                                    <div className="">
                                        <h2 className="text-center">
                                            <span>{totalSubscriptions}</span>
                                        </h2>
                                        <p className="text-center text-card">
                                            Nombre de souscriptions
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="custom-green-card bg-c-green order-card">
                                    <div className="card-block">
                                        <h2 className="text-center">
                                            <span>{totalModifications}</span>
                                        </h2>
                                        <p className="text-center text-card">
                                            Nombre de modifications
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="custom-green-card bg-c-green order-card">
                                    <div className="card-block">
                                        <h2 className="text-center">
                                            <span>{totalCancellations}</span>
                                        </h2>
                                        <p className="text-center text-card">
                                            Nombre d'annulations
                                        </p>
                                    </div>
                                </div>
                            </div>


                            <div className="col-md-3">
                                <div className="custom-green-card bg-c-green order-card">
                                    <div className="card-block">
                                        <h2 className="text-center">
                                            <span>{totalClients}</span>
                                        </h2>
                                        <p className="text-center text-card">
                                            Nombre des clients
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="row">
                            <div className="col-md-3">
                                {/* Filters */}
                                {/* <div className="row">
                                <div className="col-md-12">
                                    <span className="green-line">Filtrer</span>
                                </div> 
                        </div>  */}
                                <div className="filter-card">

                                    <div className="row filter-section">
                                        <div className="col-md-6 d-flex justify-content-left">
                                            <button className="btn clear-filter-button" onClick={handleResetFilters}>R&eacute;initialiser</button>
                                        </div>
                                        <div className="col-md-6" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <button className="btn filter-button" onClick={handleApplyFilters}>Filtrer</button>
                                        </div>
                                    </div>
                                    <div className=" card-body-1" >
                                        <div className="form-group" >
                                            <label className="custom-label-1" onClick={() => toggleCollapse('operation')}>
                                                <i className={`indicator fa ${operationCollapsed ? 'fa-caret-right' : 'fa-caret-down'}`} aria-hidden="true"></i>
                                                <span className="mx-2">Op&eacute;ration</span>
                                            </label>
                                            {!operationCollapsed && (
                                                <div>
                                                    <div className="form-check custom-form-check">
                                                        <input className="form-check-input" type="checkbox" id="operation1" value="Souscription" ref={operation1Ref} onChange={() => handleCheckboxChange('operation', 'Souscription')} />
                                                        <label className="form-check-label" htmlFor="operation1">Souscription</label>
                                                    </div>
                                                    <div className="form-check custom-form-check">
                                                        <input className="form-check-input" type="checkbox" id="operation2" value="Modification" ref={operation2Ref} onChange={() => handleCheckboxChange('operation', 'Modification')} />
                                                        <label className="form-check-label" htmlFor="operation2">Modification</label>
                                                    </div>
                                                    <div className="form-check custom-form-check">
                                                        <input className="form-check-input" type="checkbox" id="operation3" value="Annulation" ref={operation3Ref} onChange={() => handleCheckboxChange('operation', 'Annulation')} />
                                                        <label className="form-check-label" htmlFor="operation3">Annulation</label>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="form-group">
                                            <label className="custom-label-1" onClick={() => toggleCollapse('zone')}>
                                                <i className={`indicator fa ${zoneCollapsed ? 'fa-caret-right' : 'fa-caret-down'}`} aria-hidden="true"></i>
                                                <span className="mx-2">Zone</span>
                                            </label>
                                            {!zoneCollapsed && (
                                                <div>
                                                    <div className="form-check custom-form-check">
                                                        <input className="form-check-input" type="checkbox" id="zone1" value="Tunisie" ref={zone1Ref} onChange={() => handleCheckboxChange('zone', 'Tunisie')} />
                                                        <label className="form-check-label" htmlFor="zone1">Tunisie</label>
                                                    </div>
                                                    <div className="form-check custom-form-check">
                                                        <input className="form-check-input" type="checkbox" id="zone2" value="Formule confort" ref={zone2Ref} onChange={() => handleCheckboxChange('zone', 'Formule confort')} />
                                                        <label className="form-check-label" htmlFor="zone2">Confort</label>
                                                    </div>
                                                    <div className="form-check custom-form-check">
                                                        <input className="form-check-input" type="checkbox" id="zone3" value="Formule classique" ref={zone3Ref} onChange={() => handleCheckboxChange('zone', 'Formule classique')} />
                                                        <label className="form-check-label" htmlFor="zone3">Classique</label>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="form-group">
                                            <label className="custom-label-1" onClick={() => toggleCollapse('formule')}>
                                                <i className={`indicator fa ${formuleCollapsed ? 'fa-caret-right' : 'fa-caret-down'}`} aria-hidden="true"></i>
                                                <span className="mx-2">Formule</span>
                                            </label>
                                            {!formuleCollapsed && (
                                                <div>
                                                    <div className="form-check custom-form-check">
                                                        <input className="form-check-input" type="checkbox" id="formule1" value="Individuelle" ref={formule1Ref} onChange={() => handleCheckboxChange('offre', 'Individuelle')} />
                                                        <label className="form-check-label" htmlFor="formule1">Individuelle</label>
                                                    </div>
                                                    <div className="form-check custom-form-check">
                                                        <input className="form-check-input" type="checkbox" id="formule2" value="Famille" ref={formule2Ref} onChange={() => handleCheckboxChange('offre', 'Famille')} />
                                                        <label className="form-check-label" htmlFor="formule2">Famille</label>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="form-group">
                                            <label className="custom-label-1" onClick={() => toggleCollapse('partenaire')}>
                                                <i className={`indicator fa ${partenaireCollapsed ? 'fa-caret-right' : 'fa-caret-down'}`} aria-hidden="true"></i>
                                                <span className="mx-2">Partenaire</span>
                                            </label>
                                            {!partenaireCollapsed && (
                                                <div>
                                                    <div className="form-check custom-form-check">
                                                        <input className="form-check-input" type="checkbox" id="partenaire1" value="Djezzy" ref={partenaire1Ref} onChange={() => handleCheckboxChange('partenaire', 'DJEZZY')} />
                                                        <label className="form-check-label" htmlFor="partenaire1">Djezzy</label>
                                                    </div>
                                                    <div className="form-check custom-form-check">
                                                        <input className="form-check-input" type="checkbox" id="partenaire2" value="BNP" ref={partenaire2Ref} onChange={() => handleCheckboxChange('partenaire', 'BNPP ED')} />
                                                        <label className="form-check-label" htmlFor="partenaire2">BNP</label>
                                                    </div>
                                                    <div className="form-check custom-form-check">
                                                        <input className="form-check-input" type="checkbox" id="partenaire3" value="CNEP" ref={partenaire3Ref} onChange={() => handleCheckboxChange('partenaire', 'CNEP')} />
                                                        <label className="form-check-label" htmlFor="partenaire3">CNEP</label>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                            <div>
                                                {/* Date Souscription */}
                                                <div className="form-group">
                                                    <label className="custom-label-1" onClick={() => toggleCollapse('dateSouscription')}>
                                                        <i className={`indicator fa ${dateSouscriptionCollapsed ? 'fa-caret-right' : 'fa-caret-down'}`} aria-hidden="true"></i>
                                                        <span className="mx-2">Date Operation</span>
                                                    </label>
                                                    {!dateSouscriptionCollapsed && (
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <DatePicker
                                                                selected={filters.DateSouscription.from}
                                                                onChange={dates => handleDateRangeChange('DateSouscription', dates[0], dates[1])}
                                                                startDate={filters.DateSouscription.from}
                                                                endDate={filters.DateSouscription.to}
                                                                selectsRange
                                                                placeholderText=""
                                                                isClearable
                                                                dateFormat="yyyy/MM/dd"
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Date Depart */}
                                                <div className="form-group">
                                                    <label className="custom-label-1" onClick={() => toggleCollapse('dateDepart')}>
                                                        <i className={`indicator fa ${dateDepartCollapsed ? 'fa-caret-right' : 'fa-caret-down'}`} aria-hidden="true"></i>
                                                        <span className="mx-2">Date Depart</span>
                                                    </label>
                                                    {!dateDepartCollapsed && (
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <DatePicker
                                                                selected={filters.DateDepart.from}
                                                                onChange={dates => handleDateRangeChange('DateDepart', dates[0], dates[1])}
                                                                startDate={filters.DateDepart.from}
                                                                endDate={filters.DateDepart.to}
                                                                selectsRange
                                                                placeholderText=""
                                                                isClearable
                                                                dateFormat="yyyy/MM/dd"
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Date Retour */}
                                                <div className="form-group">
                                                    <label className="custom-label-1" onClick={() => toggleCollapse('dateRetour')}>
                                                        <i className={`indicator fa ${dateRetourCollapsed ? 'fa-caret-right' : 'fa-caret-down'}`} aria-hidden="true"></i>
                                                        <span className="mx-2">Date Retour</span>
                                                    </label>
                                                    {!dateRetourCollapsed && (
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <DatePicker
                                                                selected={filters.DateRetour.from}
                                                                onChange={dates => handleDateRangeChange('DateRetour', dates[0], dates[1])}
                                                                startDate={filters.DateRetour.from}
                                                                endDate={filters.DateRetour.to}
                                                                selectsRange
                                                                placeholderText=""
                                                                isClearable
                                                                dateFormat="yyyy/MM/dd"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {/* 
                                        <div className="form-group">
                                            <label className="custom-label-1" onClick={() => toggleCollapse('destination')}>
                                                <i className={`indicator fa ${destinationCollapsed ? 'fa-caret-right' : 'fa-caret-down'}`} aria-hidden="true"></i>
                                                <span className="mx-2">Destination</span>
                                            </label>
                                            {!destinationCollapsed && (
                                                <div>
                                                    <select
                                                        className="form-select-custom "

                                                        onChange={(e) => handleDestinationChange(e.target.value)}
                                                    >
                                                        <option value="">Selectionnez une destination</option>
                                                        {countries.map(country => (
                                                            <option key={country.value} value={country.value}>{country.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                            </div>
                                         */}
                                    </div>
                                    <div className="row filter-section">
                                        <div className="col-md-6 d-flex justify-content-left">
                                            <button className="btn clear-filter-button" onClick={handleResetFilters}>R&eacute;initialiser</button>
                                        </div>
                                        <div className="col-md-6" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <button className="btn filter-button" onClick={handleApplyFilters}>Filtrer</button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div className="col-md-9">
                                {/* Table */}
                                <div className="row grey-underline">
                                    <div className="total-rowss col-md-6 d-flex justify-content-start ">
                                            <span className="green-left-line"> Total op&eacute;rations: {tasks.length} </span>
                                    </div>
                                    <div className="total-rowss col-md-6 d-flex justify-content-end align-items-center">
                                        <button type="button" className="btn download-button" onClick={downloadTasksCSV} >
                                            <img className="mx-1" src={downloadCSV} alt="" style={{ width: '1.5rem', height: '1.5rem' }} />
                                            Exporter en CSV
                                        </button>


                                    </div>
                                </div>


                                <table className="table custom-table-dashboard">
                                    <thead>
                                        <tr>
                                            <th scope="col">Num&eacute;ro de Police
                                                <span className="custoom-icon px-2" onClick={() => handleSort('numPolice')}>
                                                    <img src={sortDirection.numPolice === 'asc' ? arrowUp : arrowDown} alt="sort icon" style={{ width: '12px', height: '14px' }} />
                                                </span>
                                            </th>
                                            <th scope="col">Op&eacute;ration
                                                <span className="custoom-icon px-2" onClick={() => handleSort('operation')}>
                                                    <img src={sortDirection.operation === 'asc' ? arrowUp : arrowDown} alt="sort icon" style={{ width: '12px', height: '14px' }} />
                                                </span>
                                            </th>
                                            <th scope="col">Date d'op&eacute;ration
                                                <span className="custoom-icon px-2" onClick={() => handleSort('dateSouscription')}>
                                                    <img src={sortDirection.dateSouscription === 'asc' ? arrowUp : arrowDown} alt="sort icon" style={{ width: '12px', height: '14px' }} />
                                                </span>
                                            </th>
                                            <th scope="col">Zone
                                                <span className="custoom-icon px-2" onClick={() => handleSort('zone')}>
                                                    <img src={sortDirection.zone === 'asc' ? arrowUp : arrowDown} alt="sort icon" style={{ width: '12px', height: '14px' }} />
                                                </span>
                                            </th>
                                            <th scope="col">Formule
                                                <span className="custoom-icon px-2" onClick={() => handleSort('offre')}>
                                                    <img src={sortDirection.offre === 'asc' ? arrowUp : arrowDown} alt="sort icon" style={{ width: '12px', height: '14px' }} />
                                                </span>
                                            </th>
                                            <th scope="col">Montant
                                                <span className="custoom-icon px-2" onClick={() => handleSort('montant')}>
                                                    <img src={sortDirection.montant === 'asc' ? arrowUp : arrowDown} alt="sort icon" style={{ width: '12px', height: '14px' }} />
                                                </span>
                                            </th>
                                            <th scope="col">partenaire
                                                <span className="custoom-icon px-2" onClick={() => handleSort('partenaire')}>
                                                    <img src={sortDirection.partenaire === 'asc' ? arrowUp : arrowDown} alt="sort icon" style={{ width: '12px', height: '14px' }} />
                                                </span>
                                            </th>
                                            <th scope="col">email souscripteur
                                                <span className="custoom-icon px-2" onClick={() => handleSort('email')}>
                                                    <img src={sortDirection.email === 'asc' ? arrowUp : arrowDown} alt="sort icon" style={{ width: '12px', height: '14px' }} />
                                                </span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {renderTableRows()}
                                    </tbody>
                                </table>

                                <div className="row">
                                    <div className="col-md-7 d-flex justify-content-end align-items-center">
                                        <div className="pagination-controls">
                                            <span onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                                                <img src={arrowFirstPage} alt="First page" style={{ width: '2rem', height: '2.2rem' }} />
                                            </span>
                                            <span onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                                                <img src={arrowPrevious} alt="Previous" style={{ width: '2rem', height: '2.2rem' }} />
                                            </span>
                                            <span>{currentPage} / {totalPages}</span>
                                            <span onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                                                <img src={arrowNext} alt="Next" style={{ width: '2rem', height: '2.2rem' }} />
                                            </span>
                                            <span onClick={() => setCurrentPage(totalPages)}>
                                                <img src={arrowLastPage} alt="Last page" style={{ width: '2rem', height: '2.2rem' }} />
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col d-flex justify-content-end">
                                        <div className="pagination-controls">
                                            <select
                                                value={rowsPerPage}
                                                onChange={handleRowsPerPageChange}
                                                className="form-select-custom"
                                            >
                                                <option value={10}>10 lignes par page</option>
                                                <option value={15}>15 lignes par page</option>
                                                <option value={20}>20 lignes par page</option>
                                                <option value={25}>25 lignes par page</option>
                                                <option value={30}>30 lignes par page</option>
                                                <option value={50}>50 lignes par page</option>
                                                <option value={100}>100 lignes par page</option>
                                                {/* Add more options as needed */}
                                            </select>
                                        </div>
                                    </div>
                                </div>


                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
