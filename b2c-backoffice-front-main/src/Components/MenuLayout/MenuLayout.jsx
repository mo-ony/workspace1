import Header from "../Header/Header";
import SideMenu from "../SideMenu/SideMenu";
import { Route } from 'react-router-dom';

function MenuLayout({ component: Component }) {
	return (
		<>
			<Header />
			<SideMenu component={Component}  />
		</>
	);
}

export default MenuLayout;
