import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpZA, faArrowDownAZ } from '@fortawesome/free-solid-svg-icons';
import "./CancellationList.css";
import { useAuth } from "../../auth/core/Auth";

export default function CancellationList() {

    //const { auth, role } = useAuth();
    const { auth } = useAuth();

    const [tasks, setTasks] = useState([]);
    // Example data for tasks
//    const initialTasks = [
//        { cancellationId: "cancellation123", task: "Controle de la demande niveau N", demand: "Annuler une souscription", details: "hkjsfhskjhvswhvwdshvfkjhwvjhwdv hkdhvkdwhvwdhh 1", date: "2024-03-01" },
//        { cancellationId: 2, task: "Task 2", demand: "Demand 2", details: "Details 2", date: "2024-03-05" },
//        { cancellationId: 3, task: "Task 3", demand: "Demand 3", details: "Details 3", date: "2024-03-03" }
//    ];
    const [sortDirection, setSortDirection] = useState({ task: 'asc', details: 'asc', date: 'asc' });
    const [isClicked, setIsClicked] = useState({ task: false, details: false, date: false });
    const [selectedFilter, setSelectedFilter] = useState('inprogress');
    const [enCoursCount, setEnCoursCount] = useState(0);
    const [traitesCount, setTraitesCount] = useState(0);
    const [tableHeaders, setTableHeaders] = useState([]);

    useEffect(() => {
        fetchTasks();
        fetchEnCoursCount();
        fetchTraitesCount();
    }, [selectedFilter]);

    const fetchTasks = async () => {
        let url = `${import.meta.env.VITE_API_GATEWAY_URL
            }/v1/b2c/cancellation/NplusOnePendingCancellations`;
        if (selectedFilter === 'treated') {
            url = `${import.meta.env.VITE_API_GATEWAY_URL
                }/v1/b2c/CancellationTreated/All`;
        }

            try {
                const response = await fetch(url
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

                if (selectedFilter === 'inprogress') {
                    data.forEach(item => {
                        item.date = item.dateRequest.slice(0, 10);
                        delete item.dateRequest;
                    });
                    data.forEach(item => {
                        item.dateValidation = item.dateValidation.slice(0, 10);
                    });
                    setTableHeaders(['Tache', 'Details', 'Date demande d\'annulation', 'Date validation niveau N']);
                } else if (selectedFilter === 'treated') {
                    data.forEach(item => {
                        item.date_STATUS = item.date_STATUS.slice(0, 10);
                    });
                    setTableHeaders(['Numero de Police', 'Email Validateur N+1', 'Decision' ,'Date Validation']);
                }


               
                setTasks(data);
                console.log(tasks);
            } catch (error) {
                console.error('Error fetching data:', error.message);
            }
        };

    const fetchEnCoursCount = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL}/v1/b2c/cancellation/NplusOnePendingCancellations`, {
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
            setEnCoursCount(data.length);
        } catch (error) {
            console.error('Error fetching "En cours" count:', error.message);
        }
    };

    const fetchTraitesCount = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL}/v1/b2c/CancellationTreated/All`, {
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
            const count = data.length; 
            setTraitesCount(count);
        } catch (error) {
            console.error('Error fetching "traités" count:', error.message);
        }
    };

    const navigate = useNavigate();

    const handleRowClick = (cancellationId, statusId, motif) => {
        navigate(`/EditCancellation/${cancellationId}`, { state: { status: selectedFilter, status_ID: statusId} });
    };

    const renderTableRows = () => {
    if (selectedFilter === 'inprogress') {
        return tasks.map(task => (
            <tr key={task.cancellationId} onClick={() => handleRowClick(task.cancellationId, 0)} className="row-hover">
                <td style={{ width: "43%" }}>{task.task}</td>
                <td style={{ width: "20%" }}>{task.details}</td>
                <td style={{ width: "17%" }}>{task.date}</td>
                <td style={{ width: "17%" }}>{task.dateValidation}</td>
            </tr>
        ));
    } else if (selectedFilter === 'treated') {
        return tasks.map(task => (
            <tr key={task.policy_CANCELLATION_ID} onClick={() => handleRowClick(task.policy_CANCELLATION_ID, task.status_ID)} className="row-hover">
                <td style={{ width: "20%" }}>{task.numPolice}</td>
                <td style={{ width: "30%" }}>{task.emailOpNP1}</td>
                <td style={{ width: "20%" }}>{task.status_ID === 7 ? 'acceptee' : task.status_ID === 8 ? 'rejetee' : task.status_ID}</td>
                <td style={{ width: "25%" }}>{task.date_STATUS}</td>
               
            </tr>
        ));
    }
};
 

    const handleSort = (columnName) => {
        const sortedTasks = [...tasks].sort((a, b) => {
            if (sortDirection[columnName] === 'asc') {
                return a[columnName].localeCompare(b[columnName]);
            } else {
                return b[columnName].localeCompare(a[columnName]);
            }
        });
        setTasks(sortedTasks);

        // Update sort direction for the clicked column
        setSortDirection(prevState => ({
            ...prevState,
            [columnName]: prevState[columnName] === 'asc' ? 'desc' : 'asc'
        }));

        // Reset the clicked state for all columns except the one that was clicked
        setIsClicked(prevState => ({
            task: columnName === 'task' ? true : false,
            details: columnName === 'details' ? true : false,
            date: columnName === 'date' ? true : false
        }));
    };

    const handleFilterChange = (filter) => {
        setSelectedFilter(filter);
    };


    return (
        <div className="container-fluid page-container">
            <h4>Liste des demandes d&apos;annulation</h4>
            <div className="texte mx-1 my-2" >Suivi des demandes d&apos;annulation niveau N+1</div>
            <div className="row mx-1"> 
                <div className="total-rows col-md-12 "> 
                    <span className={`green-line-screening ${selectedFilter === 'inprogress' ? 'selected' : ''}`}
                        onClick={() => handleFilterChange('inprogress')}>
                        En cours ({enCoursCount})
                    </span>
                    {'   |   '}
                    <span className={`green-line-screening ${selectedFilter === 'treated' ? 'selected' : ''}`}
                        onClick={() => handleFilterChange('treated')}>
                        trait&eacute;es ({traitesCount})
                    </span>
                </div>
            </div>
            <div className="row "> 
                <div className="col-md-12 " > 
                <table className="table custom-table table-hover">
                    <thead>
                            <tr>
                                {tableHeaders.map((header, index) => (
                                    <th key={index} scope="col">
                                        {header}
                                    </th>
                                ))}

                                {/*  <th scope="col">T&acirc;che
                                     <span className="custoom-icon px-2" > <FontAwesomeIcon icon={sortDirection.task === 'asc' ? faArrowUpZA : faArrowDownAZ}
                                        onClick={() => handleSort('task')}
                                        className={isClicked.task ? "clicked" : ""} />
                                    </span>
                                </th>
                            <th scope="col">D&eacute;tails</th>
                                <th scope="col">Date demande d&apos;annulation
                                    {/*  <span className="custoom-icon px-2" > <FontAwesomeIcon icon={sortDirection.date === 'asc' ? faArrowUpZA : faArrowDownAZ}
                                        onClick={() => handleSort('date')}
                                        className={isClicked.date ? "clicked" : ""} />
                                    </span>
                                </th>
                                <th scope="col">Date validation niveau N
                                    {/*  <span className="custoom-icon px-2" > <FontAwesomeIcon icon={sortDirection.date === 'asc' ? faArrowUpZA : faArrowDownAZ}
                                        onClick={() => handleSort('date')}
                                        className={isClicked.date ? "clicked" : ""} />
                                    </span>
                                </th>*/}
                        </tr>
                    </thead>
                    <tbody>
                        {renderTableRows()}
                    </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}