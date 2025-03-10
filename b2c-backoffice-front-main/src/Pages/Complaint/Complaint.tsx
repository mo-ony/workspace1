import 'bootstrap/dist/css/bootstrap.min.css';
import "./Complaint.css";
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
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function Complaint() {
    const filterCardRef = useRef(null);

    const scrollToFilterCard = () => {
        if (filterCardRef.current) {
            filterCardRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };
    const { auth } = useAuth();
    const navigate = useNavigate();

    const handleRowClick = (operationId) => {
        navigate(`/ComplaintDetails/${operationId}`);
    };


    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL
                    }/v1/b2c/complaints`, {
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

                    item.DateNaissance = item.DATENAISSANCE;
                    delete item.DATENAISSANCE;

                    item.DateOperation = item.DATEOPERATION ? item.DATEOPERATION.slice(0, 10) : '';
                    delete item.DATEOPERATION;

                    item.Partenaire = item.PARTENAIRE;
                    delete item.PARTENAIRE;

                    // Transform offre
                    if (item.FORMLE === 'F') {
                        item.Formle = 'Famille';
                    } else if (item.FORMLE === 'I') {
                        item.Formle = 'Individuelle';
                    }
                    delete item.FORMLE;

                    item.Nom = item.NOM;
                    delete item.NOM;

                    item.Prenom = item.PRENOM;
                    delete item.PRENOM;

                    item.NumPolice = item.NUMPOLICE;
                    delete item.NUMPOLICE;

                    item.Offre = item.OFFRE;
                    delete item.OFFRE;

                });
                setInitialTasks(data);
                setTasks(data);
                console.log(tasks);
            } catch (error) {
                console.error('Error fetching data:', error.message);
            }
        };

        fetchTasks();
    }, []);


   /* const initialTasks = [
        { IDOPERATION: 1, NumPolice: "46003A240430000209", Nom: "John", DateOperation: "2024-03-01", Offre: "Tunisie", Formle: "Individuelle", Prenom: "Doe", DateNaissance: "2003-07-16", Partenaire: "Djezzy" },
        { IDOPERATION: 2, NumPolice: "46003A240430000225", Nom: "Test", DateOperation: "2024-04-27", Offre: "Confort", Formle: "Famille", Prenom: "Test", DateNaissance: "1961-03-10", Partenaire: "CNEP" },
        { IDOPERATION: 3, NumPolice: "46003A240430000218", Nom: "Nom", DateOperation: "2024-06-04", Offre: "Classic", Formle: "Individuelle", Prenom: "Prenom", DateNaissance: "1997-11-22", Partenaire: "Djezzy" },
        { IDOPERATION: 4, NumPolice: "46003A240430000041", Nom: "Bouguerra", DateOperation: "2024-03-01", Offre: "Tunisie", Formle: "Individuelle", Prenom: "Fatima", DateNaissance: "1995-05-23", Partenaire: "Djezzy" },
        { IDOPERATION: 5, NumPolice: "46003A240430000112", Nom: "Test2", DateOperation: "2024-04-27", Offre: "Confort", Formle: "Famille", Prenom: "Prenom2", DateNaissance: "1964-03-15", Partenaire: "Djezzy" },
        { IDOPERATION: 6, NumPolice: "46003A240430000312", Nom: "Nom2", DateOperation: "2024-06-04", Offre: "Classic", Formle: "Individuelle", Prenom: "Prenom2", DateNaissance: "1998-01-13", Partenaire: "Djezzy" },
        { IDOPERATION: 7, NumPolice: "46003A240430000225", Nom: "Test", DateOperation: "2024-04-27", Offre: "Confort", Formle: "Famille", Prenom: "Test", DateNaissance: "1961-03-10", Partenaire: "CNEP" },
        { IDOPERATION: 8, NumPolice: "46003A240430000218", Nom: "Nom", DateOperation: "2024-06-04", Offre: "Classic", Formle: "Individuelle", Prenom: "Prenom", DateNaissance: "1997-11-22", Partenaire: "Djezzy" },
        { IDOPERATION: 9, NumPolice: "46003A240430000041", Nom: "Bouguerra", DateOperation: "2024-03-01", Offre: "Tunisie", Formle: "Individuelle", Prenom: "Fatima", DateNaissance: "1995-05-23", Partenaire: "Djezzy" },
        { IDOPERATION: 10, NumPolice: "46003A240430000112", Nom: "Test2", DateOperation: "2024-04-27", Offre: "Confort", Formle: "Famille", Prenom: "Prenom2", DateNaissance: "1964-03-15", Partenaire: "Djezzy" },
        { IDOPERATION: 11, NumPolice: "46003A240430000312", Nom: "Nom2", DateOperation: "2024-06-04", Offre: "Classic", Formle: "Individuelle", Prenom: "Prenom2", DateNaissance: "1998-01-13", Partenaire: "Djezzy" }

    ];*/

    const [initialTasks, setInitialTasks] = useState([]);

    const [tasks, setTasks] = useState(initialTasks);
    const [sortDirection, setSortDirection] = useState({
        NumPolice: 'asc',
        Nom: 'asc',
        DateOperation: 'asc',
        Offre: 'asc',
        Formle: 'asc',
        Prenom: 'asc',
        Partenaire: 'asc',
        DateNaissance: 'asc'
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const pages = Math.ceil(tasks.length / rowsPerPage);
        setTotalPages(pages > 0 ? pages : 1);
    }, [tasks.length, rowsPerPage]);


    const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(Number(event.target.value));
        setCurrentPage(1);
    };


    const [clickedColumn, setClickedColumn] = useState(null);
    const [filters, setFilters] = useState({
        Offre: [],
        Formle: [],
        Partenaire: [],
        DateOperation: { from: null, to: null },
    });


    const offre1Ref = useRef(null);
    const offre2Ref = useRef(null);
    const offre3Ref = useRef(null);
    const formule1Ref = useRef(null);
    const formule2Ref = useRef(null);
    const partenaire1Ref = useRef(null);
    const partenaire2Ref = useRef(null);
    const partenaire3Ref = useRef(null);


    // Ref for RangePicker
    const dateOperationRangePickerRef = useRef(null);


    // Function to reset checkboxes for Offre filter
    const resetCheckboxInputsOffre = () => {
        if (offre1Ref.current) {
            offre1Ref.current.checked = false;
        }
        if (offre2Ref.current) {
            offre2Ref.current.checked = false;
        }
        if (offre3Ref.current) {
            offre3Ref.current.checked = false;
        }
    };

    // Function to reset checkboxes for Formle filter
    const resetCheckboxInputsFormle = () => {
        if (formule1Ref.current) {
            formule1Ref.current.checked = false;
        }
        if (formule2Ref.current) {
            formule2Ref.current.checked = false;
        }
    };

    // Function to reset checkboxes for Partenaire filter
    const resetCheckboxInputsPartenaire = () => {
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

        if (dateOperationRangePickerRef.current) {
            const picker = dateOperationRangePickerRef.current.picker;
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




    const handleDateRangeChange = (name, startDate, endDate) => {
        const updatedFilters = { ...filters };
        updatedFilters[name] = { from: startDate, to: endDate };
        setFilters(updatedFilters);
        console.log('Selected Date Range:', updatedFilters[name]);
    };

    // Fonction pour réinitialiser tous les filtres
    const handleResetFilters = () => {
        console.log("resetting filters");
        setFilters({
            Offre: [],
            Formle: [],
            Partenaire: [],
            DateOperation: { from: null, to: null }
        });

        resetCheckboxInputsOffre();
        resetCheckboxInputsFormle();
        resetCheckboxInputsPartenaire();
        resetDateRangePicker();


        // Rétablir toutes les tâches initiales
        setTasks(initialTasks);

        // Réinitialiser le tri
        setSortDirection({
            NumPolice: 'asc',
            Nom: 'asc',
            DateOperation: 'asc',
            Offre: 'asc',
            Formle: 'asc',
            Prenom: 'asc',
            Partenaire: 'asc',
            DateNaissance: 'asc',
        });

        setClickedColumn(null); // Réinitialiser la colonne cliquée

        // Scroll to the top of the page
        scrollToFilterCard();
    };
    const handleApplyFilters = () => {
        // Apply filters logic here and update tasks accordingly
        console.log("Applying filters:", filters);
        // Example: Filter tasks based on selected filters
        const filteredTasks = initialTasks.filter(task => {
            if (filters.Partenaire.length > 0 && !filters.Partenaire.includes(task.Partenaire)) {
                return false;
            }
            if (filters.Offre.length > 0 && !filters.Offre.includes(task.Offre)) {
                return false;
            }
            if (filters.Formle.length > 0 && !filters.Formle.includes(task.Formle)) {
                return false;
            }
            // Add logic for date range filtering if necessary
            if (filters.DateOperation.from && filters.DateOperation.to) {
                const taskDate = new Date(task.DateOperation);
                const fromDate = new Date(filters.DateOperation.from);
                const toDate = new Date(filters.DateOperation.to);
                toDate.setDate(toDate.getDate() + 1);
                if (taskDate < fromDate || taskDate > toDate) {
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
        return tasks.slice(startIndex, endIndex).map(task => (
            <tr key={task.IDOPERATION} onClick={() => handleRowClick(task.IDOPERATION)}  className="row-hover1">
                <td style={{ width: "15%" }}>{task.NumPolice}</td>
                <td style={{ width: "10%" }}>{task.Nom}</td>
                <td style={{ width: "10%" }}>{task.Prenom}</td>
                <td style={{ width: "15%" }}>{task.DateOperation}</td>
                <td style={{ width: "10%" }}>{task.Offre}</td>
                <td style={{ width: "10%" }}>{task.Formle}</td>
                <td style={{ width: "6%" }}>{task.Partenaire}</td>
                <td style={{ width: "6%" }}>{task.DateNaissance}</td>
            </tr>
        ));
    };


    const downloadTasksCSV = () => {
        const headers = 'NumPolice;Nom;Prenom;DateOperation;Offre;Formle;Partenaire;DateNaissance';

        const csvContent = [
            headers,
            ...tasks.map(task => {
                return [
                    task.NumPolice,
                    task.Nom,
                    task.Prenom,
                    task.DateOperation,
                    task.Offre,
                    task.Formle,
                    task.Partenaire,
                    task.DateNaissance
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


    const [offreCollapsed, setOffreCollapsed] = useState(false);
    const [formuleCollapsed, setFormuleCollapsed] = useState(false);
    const [partenaireCollapsed, setPartenaireCollapsed] = useState(false);
    const [dateReclamationCollapsed, setDateReclamationCollapsed] = useState(false);
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
            case 'offre':
                setOffreCollapsed(!offreCollapsed);
                break;
            case 'formule':
                setFormuleCollapsed(!formuleCollapsed);
                break;
            case 'partenaire':
                setPartenaireCollapsed(!partenaireCollapsed);
                break;
            case 'dateReclamation':
                setDateReclamationCollapsed(!dateReclamationCollapsed);
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
            <div className="container-fluid page-container-dashboard">
                <div className="container" ref={filterCardRef}>
                    
                    <div className="row">
                        <div className="col-md-3">
                            {/* Filters */}
                            <div className="filter-card">
                                <div className="row filter-section">
                                    <div className="col-md-6 d-flex justify-content-left">
                                        <button className="btn clear-filter-button" onClick={handleResetFilters}>R&eacute;initialiser</button>
                                    </div>
                                    <div className="col-md-6" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <button className="btn filter-button" onClick={handleApplyFilters}>Filtrer</button>
                                    </div>
                                </div>
                                <div className="card-body-1">
                                    <div className="form-group">
                                        <label className="custom-label-1" onClick={() => toggleCollapse('offre')}>
                                            <i className={`indicator fa ${offreCollapsed ? 'fa-caret-right' : 'fa-caret-down'}`} aria-hidden="true"></i>
                                            <span className="mx-2">Offre</span>
                                        </label>
                                        {!offreCollapsed && (
                                            <div>
                                                <div className="form-check custom-form-check">
                                                    <input className="form-check-input" type="checkbox" id="offre1" value="Tunisie" ref={offre1Ref} onChange={() => handleCheckboxChange('Offre', 'Tunisie')} />
                                                    <label className="form-check-label" htmlFor="offre1">Tunisie</label>
                                                </div>
                                                <div className="form-check custom-form-check">
                                                    <input className="form-check-input" type="checkbox" id="offre2" value="Confort" ref={offre2Ref} onChange={() => handleCheckboxChange('Offre', 'Formule confort')} />
                                                    <label className="form-check-label" htmlFor="offre2">Confort</label>
                                                </div>
                                                <div className="form-check custom-form-check">
                                                    <input className="form-check-input" type="checkbox" id="offre3" value="Classic" ref={offre3Ref} onChange={() => handleCheckboxChange('Offre', 'Formule classique')} />
                                                    <label className="form-check-label" htmlFor="offre3">Classique</label>
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
                                                    <input className="form-check-input" type="checkbox" id="formule1" value="Individuelle" ref={formule1Ref} onChange={() => handleCheckboxChange('Formle', 'Individuelle')} />
                                                    <label className="form-check-label" htmlFor="formule1">Individuelle</label>
                                                </div>
                                                <div className="form-check custom-form-check">
                                                    <input className="form-check-input" type="checkbox" id="formule2" value="Famille" ref={formule2Ref} onChange={() => handleCheckboxChange('Formle', 'Famille')} />
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
                                                    <input className="form-check-input" type="checkbox" id="partenaire1" value="Djezzy" ref={partenaire1Ref} onChange={() => handleCheckboxChange('Partenaire', 'DJEZZY')} />
                                                    <label className="form-check-label" htmlFor="partenaire1">Djezzy</label>
                                                </div>
                                                <div className="form-check custom-form-check">
                                                    <input className="form-check-input" type="checkbox" id="partenaire2" value="BNP" ref={partenaire2Ref} onChange={() => handleCheckboxChange('Partenaire', 'BNPP ED')} />
                                                    <label className="form-check-label" htmlFor="partenaire2">BNP</label>
                                                </div>
                                                <div className="form-check custom-form-check">
                                                    <input className="form-check-input" type="checkbox" id="partenaire3" value="CNEP" ref={partenaire3Ref} onChange={() => handleCheckboxChange('Partenaire', 'CNEP')} />
                                                    <label className="form-check-label" htmlFor="partenaire3">CNEP</label>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                  
                                        {/* Date Souscription */}
                                        <div className="form-group">
                                            <label className="custom-label-1" onClick={() => toggleCollapse('dateReclamation')}>
                                                <i className={`indicator fa ${dateReclamationCollapsed ? 'fa-caret-right' : 'fa-caret-down'}`} aria-hidden="true"></i>
                                                <span className="mx-2">Date  R&eacute;clamation</span>
                                            </label>
                                            {!dateReclamationCollapsed && (
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <DatePicker
                                                        selected={filters.DateOperation.from}
                                                        onChange={dates => handleDateRangeChange('DateOperation', dates[0], dates[1])}
                                                        startDate={filters.DateOperation.from}
                                                        endDate={filters.DateOperation.to}
                                                        selectsRange
                                                        placeholderText=""
                                                        isClearable
                                                        dateFormat="yyyy/MM/dd"
                                                    />
                                                </div>
                                            )}
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
                                    <div className="col-md-6 d-flex justify-content-right">
                                        <button className="btn filter-button" onClick={handleApplyFilters}>Filtrer</button>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <div className="col-md-9">
                            {/* Table */}
                            <div className="row grey-underline">
                                <div className="total-rowss col-md-6 d-flex justify-content-start ">
                                    <span className="green-left-line"> Total: {tasks.length} </span>
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
                                            <span className="custoom-icon px-2" onClick={() => handleSort('NumPolice')}>
                                                <img src={sortDirection.NumPolice === 'asc' ? arrowUp : arrowDown} alt="sort icon" style={{ width: '12px', height: '14px' }} />
                                            </span>
                                        </th>
                                        <th scope="col">Nom
                                            <span className="custoom-icon px-2" onClick={() => handleSort('Nom')}>
                                                <img src={sortDirection.Nom === 'asc' ? arrowUp : arrowDown} alt="sort icon" style={{ width: '12px', height: '14px' }} />
                                            </span>
                                        </th>
                                        <th scope="col">Prenom
                                            <span className="custoom-icon px-2" onClick={() => handleSort('Prenom')}>
                                                <img src={sortDirection.Prenom === 'asc' ? arrowUp : arrowDown} alt="sort icon" style={{ width: '12px', height: '14px' }} />
                                            </span>
                                        </th>
                                        <th scope="col">Date r&eacute;clamation
                                            <span className="custoom-icon px-2" onClick={() => handleSort('DateOperation')}>
                                                <img src={sortDirection.DateOperation === 'asc' ? arrowUp : arrowDown} alt="sort icon" style={{ width: '12px', height: '14px' }} />
                                            </span>
                                        </th>
                                        <th scope="col">Offre
                                            <span className="custoom-icon px-2" onClick={() => handleSort('Offre')}>
                                                <img src={sortDirection.Offre === 'asc' ? arrowUp : arrowDown} alt="sort icon" style={{ width: '12px', height: '14px' }} />
                                            </span>
                                        </th>
                                        <th scope="col">Formule
                                            <span className="custoom-icon px-2" onClick={() => handleSort('Formle')}>
                                                <img src={sortDirection.Formle === 'asc' ? arrowUp : arrowDown} alt="sort icon" style={{ width: '12px', height: '14px' }} />
                                            </span>
                                        </th>
                                        <th scope="col">Partenaire
                                            <span className="custoom-icon px-2" onClick={() => handleSort('Partenaire')}>
                                                <img src={sortDirection.Partenaire === 'asc' ? arrowUp : arrowDown} alt="sort icon" style={{ width: '12px', height: '14px' }} />
                                            </span>
                                        </th>
                                        <th scope="col">Date de Naissance 
                                            <span className="custoom-icon px-2" onClick={() => handleSort('DateNaissance')}>
                                                <img src={sortDirection.DateNaissance === 'asc' ? arrowUp : arrowDown} alt="sort icon" style={{ width: '12px', height: '14px' }} />
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
        </>
    );
}
