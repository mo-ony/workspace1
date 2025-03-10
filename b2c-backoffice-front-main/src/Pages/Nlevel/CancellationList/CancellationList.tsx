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

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch(`${
							import.meta.env.VITE_API_GATEWAY_URL
						}/v1/b2c/cancellation/NpendingCancellations`, {
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
                    item.date = item.dateRequest.slice(0, 10);
                    delete item.dateRequest;
                });
                setTasks(data);
                console.log(tasks);
            } catch (error) {
                console.error('Error fetching data:', error.message);
            }
        };

        fetchTasks(); 
    }, []);

    const navigate = useNavigate();

    const handleRowClick = (cancellationId) => {
        navigate(`/EditCancellation/${cancellationId}`);
    };

    const renderTableRows = () => {
        return tasks.map(task => (
            <tr key={task.cancellationId} onClick={() => handleRowClick(task.cancellationId)} className="row-hover">
                <td style={{ width: "43%" }}>{task.task}</td>
                <td style={{ width: "20%" }}>{task.details}</td>
                <td style={{ width: "17%" }}>{task.date}</td>
            </tr>
        ));
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


    return (
        <div className="container-fluid page-container">
            <h4>Liste des demandes d&apos;annulation</h4>
            <div className="texte mx-1 my-2" >Suivi des demandes d&apos;annulation Niveau N</div>
            <div className="row mx-1"> 
                <div className="total-rows col-md-12 "> 
                    <span  className="green-line"> Tout ({tasks.length}) </span>
                </div>
            </div>
            <div className="row "> 
                <div className="col-md-12 " > 
                <table className="table custom-table table-hover">
                    <thead>
                        <tr>
                                <th scope="col">T&acirc;che
                                    {/* <span className="custoom-icon px-2" > <FontAwesomeIcon icon={sortDirection.task === 'asc' ? faArrowUpZA : faArrowDownAZ}
                                        onClick={() => handleSort('task')}
                                        className={isClicked.task ? "clicked" : ""} />
                                    </span> */}
                                </th>
                            <th scope="col">D&eacute;tails</th>
                                <th scope="col">Date
                                    {/*  <span className="custoom-icon px-2" > <FontAwesomeIcon icon={sortDirection.date === 'asc' ? faArrowUpZA : faArrowDownAZ}
                                        onClick={() => handleSort('date')}
                                        className={isClicked.date ? "clicked" : ""} />
                                    </span> */}
                                </th>
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