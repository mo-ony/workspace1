import "bootstrap/dist/css/bootstrap.min.css";
import "./Header.css";
import userIcon from "../../assets/icons/user-icon.svg";
import Logo from "../../assets/icons/CARDIF_El_Djazair_Q 1.svg";
import { useState } from "react";
import { useAuth } from "../../Pages/auth/core/Auth";
import { logout } from "../../Pages/auth/core/_requests";
function Header() {
	const {currentUser} = useAuth()
	const [showDropDownMenu, setShowDropDownMenu] = useState(false);

	const handleShowDropDownMenu = () => {
		setShowDropDownMenu(!showDropDownMenu);
	};

	const handleLogout = async () => {
		try {
			// Wait for the logout request to complete
			await logout();

			// Reload the page after successful logout
			window.location.reload();
		} catch (error) {
			console.error("Logout failed:", error);
			// Handle the error if needed, e.g., show an error message
		}
	};

	return (
		<header className="p-3 border-bottom">
			<div className="container">
				<div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-star">
					<a
						href=""
						className="d-flex align-items-center mb-2 mb-lg-0 text-dark text-decoration-none"
					>
						<img src={Logo} alt="" />
					</a>
					<ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0"></ul>
					<div className="dropdown text-end" onClick={handleShowDropDownMenu}>
						<a
							href="#"
							className={`d-block link-dark text-decoration-none dropdown-toggle ${
								showDropDownMenu ? "show" : ""
							}`}
						>
							<img src={userIcon} alt="" className="rounded-circle" />
						</a>
						<ul
							className={`dropdown-menu text-small ${
								showDropDownMenu ? "show" : ""
							}`}
							data-popper-placement={`${
								showDropDownMenu ? "bottom-start" : ""
							}`}
						>
                        <li  className=' d-flex align-items-center '>
						
								<a href="#" className="dropdown-item">
								{currentUser?.firstName} {currentUser?.lastName}
								</a>
							</li>

							<li>
								<a onClick={handleLogout} className="dropdown-item">
									Déconnexion
								</a>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</header>
	);
}

export default Header;
