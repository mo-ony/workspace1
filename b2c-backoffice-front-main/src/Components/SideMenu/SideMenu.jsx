import "bootstrap/dist/css/bootstrap.min.css";
import "./SideMenu.css";
import { useLocation } from "react-router-dom";
import complaintIcon from "../../assets/icons/complaint-icon.svg";
import screeningIcon from "../../assets/icons/screening-icon.svg";
import tasksIcon from "../../assets/icons/tasks-icon.svg";

function SideMenu({ component: Component }) {

	const location = useLocation();

	const getLinkClass = (path) => {
		return location.pathname === path ? "nav-link align-middle px-0 active" : "nav-link align-middle px-0";
	};


	return (
		<div className="container-fluid">
			<div className="row flex-nowrap">
				<div className="col-auto  custom-sidebar-width px-sm-2 px-0 custom-bg-brand-color">
					<div
						className="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-white"
						style={{ minHeight: "calc(100vh - 79px)" }}
					>
						<ul
							className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start"
							id="menu"
						>
							<li className="nav-item">
								<a href="/dashboard" className={getLinkClass("/dashboard")}>
									{/*	<img className="mr-3" src={tasksIcon} alt="" /> */}
									<span className="ms-1 d-none d-sm-inline">Dashboard</span>
								</a>
								<a href="/Cancellation" className={getLinkClass("/Cancellation")}>
									{/*	<img className="mr-3" src={tasksIcon} alt="" /> */}
									<span className="ms-1 d-none d-sm-inline">Annulation</span>
								</a>
							</li>
							<li className="nav-item">
								<a href="/Screening" className={getLinkClass("/Screening")}>
									{/*	<img className="mr-3" src={screeningIcon} alt="" /> */}
									<span className="ms-1 d-none d-sm-inline">Screening</span>
								</a>
							</li>
							<li className="nav-item">
								<a href="/Complaint" className={getLinkClass("/Complaint")}>
									{/*	<img className="mr-3" src={complaintIcon} alt="" /> */}
									<span className="ms-1 d-none d-sm-inline">Réclamations</span>
								</a>
							</li>
						</ul>
						<hr />
					</div>
				</div>
				{/**Replace this div with a component */}
				<div className="col py-3">
					<Component />
				</div>
				
			</div>
		</div>
	);
}

export default SideMenu;
