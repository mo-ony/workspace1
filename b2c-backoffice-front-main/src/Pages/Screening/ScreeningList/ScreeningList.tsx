import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import "./ScreeningList.css";
import { useAuth } from "../../auth/core/Auth";
import arrowNext from '../../../assets/icons/next-icon.svg';
import arrowPrevious from '../../../assets/icons/previous-icon.svg';
import arrowFirstPage from '../../../assets/icons/first-page-icon.svg';
import arrowLastPage from '../../../assets/icons/last-page-icon.svg';
import arrowUp from '../../../assets/icons/faArrowUpAZ.svg';
import arrowDown from '../../../assets/icons/faArrowDownAZ.svg';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
export default function ScreeningList() {
    const filterCardRef = useRef(null);

    const scrollToFilterCard = () => {
        if (filterCardRef.current) {
            filterCardRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const { auth } = useAuth();

    const [tasks, setTasks] = useState([]);
    // Example data for tasks
//    const initialTasks = [
//        { cancellationId: "cancellation123", task: "Controle de la demande niveau N", demand: "Annuler une souscription", details: "hkjsfhskjhvswhvwdshvfkjhwvjhwdv hkdhvkdwhvwdhh 1", date: "2024-03-01" },
//        { cancellationId: 2, task: "Task 2", demand: "Demand 2", details: "Details 2", date: "2024-03-05" },
//        { cancellationId: 3, task: "Task 3", demand: "Demand 3", details: "Details 3", date: "2024-03-03" }
//    ];
    const [isClicked, setIsClicked] = useState({ nom: false, prenom: false, date: false });
    const [filters, setFilters] = useState({
        Offre: [],
        Partenaire: [],
        DateOperation: { from: null, to: null },
    });

    const [filteredTasks, setFilteredTasks] = useState([]);


    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [clickedColumn, setClickedColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState({
        nom: '',
        prenom: '',
        date: 'desc',
        pourcentage: '',
        status: '',
    });

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    };

    const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(Number(event.target.value));
        setCurrentPage(1);
    };

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch(`${
							import.meta.env.VITE_API_GATEWAY_URL
						}/v1/b2c/screening/positiveHitsList`
                    , {
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
                    item.date = item.dateScreening.slice(0, 10);
                    delete item.dateScreening;

                    item.nom = capitalizeFirstLetter(item.nom)
                    item.prenom = capitalizeFirstLetter(item.prenom)

                    item.Partenaire = item.partenaire;
                    delete item.partenaire;

                    item.Offre = item.formule;
                    delete item.formule;

                });
                setTasks(data);
                setFilteredTasks(data);
                console.log(tasks);
            } catch (error) {
                console.error('Error fetching data:', error.message);
            }
        };

        fetchTasks(); 
    }, []);

    const navigate = useNavigate();

    const handleRowClick = (screeningId) => {
        navigate(`/EditScreening/${screeningId}`);
    };

    const [selectedFilter, setSelectedFilter] = useState('all');

    const handleFilterChange = (filter) => {
        setSelectedFilter(filter);
        setCurrentPage(1)
    };

    useEffect(() => {
        setFilteredTasks(tasks.filter((task) => {
            if (selectedFilter === 'all') return true;
            if (selectedFilter === 'pendingN') return (task.status !== 0 && task.etat === 'En attente de traitement');
            if (selectedFilter === 'treatedPositive') return (task.status !== 0 && task.etat !== 'En attente de traitement');
            if (selectedFilter === 'negative') return task.status == 0;
            return true;
        }));
    }, [selectedFilter, tasks]);


    const renderTableRows = () => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return filteredTasks.slice(startIndex, endIndex).map(task => (
            <tr key={task.screeningId} onClick={() => handleRowClick(task.screeningId)} className="row-hover">
                <td style={{ width: "28%" }}>
                    {selectedFilter !== 'treatedPositive' ?
                        (task.status != 0 ? 'Controle d\'un Hit positif' : 'Hit negatif') : task.resultStatus}
                </td>
                <td style={{ width: "18%" }}>{task.nom}</td>
                <td style={{ width: "18%" }}>{task.prenom}</td>
                <td style={{ width: "18%" }}>{task.pourcentage}</td>
                <td style={{ width: "18%" }}>{task.date}</td>
                {selectedFilter === 'all' && (
                    <td style={{ width: "18%" }}>

                        {task.etat === 'En attente de traitement' ? 'En attente de traitement niveau N' :
                            task.etat === 'En cours de traitement' ? 'En attente de traitement niveau N+1' :
                                task.etat} 
                    </td>
                )}
            </tr>
        ));
    };

    const handleSort = (columnName) => {
        const sortedTasks = [...filteredTasks].sort((a, b) => {
            let aValue = a[columnName];
            let bValue = b[columnName];

            if (sortDirection[columnName] === 'asc') {
                return aValue < bValue ? -1 : 1;
            } else {
                return aValue > bValue ? -1 : 1;
            }
        });
        setFilteredTasks(sortedTasks);
        setCurrentPage(1);

        setSortDirection(prevState => ({
            ...prevState,
            [columnName]: prevState[columnName] === 'asc' ? 'desc' : 'asc'
        }));

        setClickedColumn(columnName);
    };

    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const pages = Math.ceil(filteredTasks.length / rowsPerPage);
        setTotalPages(pages > 0 ? pages : 1);
    }, [filteredTasks.length, rowsPerPage]);

    // Fonction pour r�initialiser tous les filtres
    const handleResetFilters = () => {

        setSelectedFilter('all');
        setCurrentPage(1)

        console.log("resetting filters");
        setFilters({
            Offre: [],
            Partenaire: [],
            DateOperation: { from: null, to: null }
        });

        resetCheckboxInputsOffre();
        resetCheckboxInputsPartenaire();


        // R�tablir toutes les t�ches initiales
        setFilteredTasks(tasks);

        // R�initialiser le tri
        setSortDirection({
            nom: '',
            prenom: '',
            date: 'desc',
            pourcentage: '',
            status: '',
        });

        setClickedColumn(null); // R�initialiser la colonne cliqu�e

        // Scroll to the top of the page
        scrollToFilterCard();
    };


    const offre1Ref = useRef(null);
    const offre2Ref = useRef(null);
    const offre3Ref = useRef(null);
    const partenaire1Ref = useRef(null);
    const partenaire2Ref = useRef(null);
    const partenaire3Ref = useRef(null);



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


    const handleApplyFilters = () => {

        setSelectedFilter('all');
        setCurrentPage(1)

        // Apply filters logic here and update tasks accordingly
        console.log("Applying filters:", filters);
        // Example: Filter tasks based on selected filters
        const filteredTaskss = tasks.filter(task => {
            if (filters.Partenaire.length > 0 && !filters.Partenaire.includes(task.Partenaire)) {
                return false;
            }
            if (filters.Offre.length > 0 && !filters.Offre.includes(task.Offre)) {
                return false;
            }
            // Add logic for date range filtering if necessary
            if (filters.DateOperation.from && filters.DateOperation.to) {
                const taskDate = new Date(task.date);
                const fromDate = new Date(filters.DateOperation.from);
                const toDate = new Date(filters.DateOperation.to);
                toDate.setDate(toDate.getDate() + 1);
                if (taskDate < fromDate || taskDate > toDate) {
                    return false;
                }
            }
            return true;
        });
        setFilteredTasks(filteredTaskss);

        // Scroll to the top of the page
        scrollToFilterCard();
    };


    const [offreCollapsed, setOffreCollapsed] = useState(false);
    const [partenaireCollapsed, setPartenaireCollapsed] = useState(false);
    const [dateReclamationCollapsed, setDateReclamationCollapsed] = useState(false);



    const toggleCollapse = (section) => {
        switch (section) {
            case 'offre':
                setOffreCollapsed(!offreCollapsed);
                break;
            case 'partenaire':
                setPartenaireCollapsed(!partenaireCollapsed);
                break;
            case 'dateReclamation':
                setDateReclamationCollapsed(!dateReclamationCollapsed);
                break;
            default:
                break;
        }
    };


    return (
        <div className="container-fluid page-container">
            <h4> R&eacute;sultat des screens  </h4>
            <div className="texte mx-1 my-2" ref={filterCardRef}>Suivi des screens</div>

            <div className="row "> 
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
                            {/*
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

                            */}

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
                                    <span className="mx-2">Date de screen</span>
                                </label>
                                {!dateReclamationCollapsed && (
                                    <div className="d-flex justify-content-between align-items-center" style={{ width: '150px' }}>
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
                <div className="col-md-9 " > 
                    <div className="row mx-1">
                        <div className="total-rows col-md-12 ">
                            <span className={`green-line-screening ${selectedFilter === 'all' ? 'selected' : ''}`}
                                onClick={() => handleFilterChange('all')}>
                                Tout ({tasks.length})
                            </span>
                            {'   |   '}
                            <span className={`green-line-screening ${selectedFilter === 'pendingN' ? 'selected' : ''}`}
                                onClick={() => handleFilterChange('pendingN')}>
                                Hits positifs en attente de traitement ({tasks.filter(task => task.status !== 0 && task.etat === 'En attente de traitement').length})
                            </span>
                            {'   |   '}
                            <span className={`green-line-screening ${selectedFilter === 'treatedPositive' ? 'selected' : ''}`}
                                onClick={() => handleFilterChange('treatedPositive')}>
                                Hits positifs trait&eacute;s ({tasks.filter(task => task.status !== 0 && task.etat !== 'En attente de traitement').length})
                            </span>
                            {'   |   '}
                            <span className={`green-line-screening ${selectedFilter === 'negative' ? 'selected' : ''}`}
                                onClick={() => handleFilterChange('negative')}>
                                Hits n&eacute;gatifs ({tasks.filter(task => task.status == 0).length})
                            </span>

                        </div>
                    </div>
                <table className="table custom-table table-hover">
                    <thead>
                        <tr>
                                <th scope="col">T&acirc;che
                                </th>
                                <th scope="col">Nom
                                    <span className="custoom-icon px-2" onClick={() => handleSort('nom')}>
                                        <img src={sortDirection.nom === 'asc' ? arrowUp : arrowDown} alt="sort icon" style={{ width: '12px', height: '14px' }} />
                                    </span>
                                </th>
                                <th scope="col">Pr&eacute;nom
                                    <span className="custoom-icon px-2" onClick={() => handleSort('prenom')}>
                                        <img src={sortDirection.prenom === 'asc' ? arrowUp : arrowDown} alt="sort icon" style={{ width: '12px', height: '14px' }} />
                                    </span>
                                </th>
                                <th scope="col">Pourcentage de correspondance
                                    <span className="custoom-icon px-2" onClick={() => handleSort('pourcentage')}>
                                        <img src={sortDirection.pourcentage === 'asc' ? arrowUp : arrowDown} alt="sort icon" style={{ width: '12px', height: '14px' }} />
                                    </span>

                                </th>
                                <th scope="col">Date
                                    <span className="custoom-icon px-2" onClick={() => handleSort('date')}>
                                        <img src={sortDirection.date === 'asc' ? arrowUp : arrowDown} alt="sort icon" style={{ width: '12px', height: '14px' }} />
                                    </span>
                                </th>
                                {selectedFilter === 'all' && <th scope="col">Status
                                    
                                </th>} {/* Conditional column */}
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
    );
}