//@ts-nocheck
import { useState } from "react";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { getUser, login } from "../core/_requests";
import { useAuth } from "../core/Auth";
import { useNavigate } from "react-router-dom";
import "./LoginRegister.css";
import Logo from "../../../assets/icons/CARDIF_El_Djazair_Q 1.svg";
import { Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
const loginSchema = Yup.object().shape({
	email: Yup.string()
		.required("L'adresse e-mail est obligatoire.")
		.email("La format de l'adresse e-mail est incorrecte.")
		.min(3, "Un minimum de 3 symboles est requis.")
		.max(50, "Un maximum de 50 caractères est autorisé."),
	password: Yup.string()
		.required("Le mot de passe est obligatoire.")
		.min(3, "Un minimum de 3 symboles est requis.")
		.max(50, "Un maximum de 50 caractères est autorisé."),
});

const initialValues = {
	email: "",
	password: "",
};

export function Login() {
	const navigate = useNavigate();
	const [backendError, setBackendError] = useState("");
	const [loading, setLoading] = useState(false);
	const { saveAuth, setAuthUser, setCurrentUser } = useAuth();
	const {
		register,
		handleSubmit,
		
		formState: { errors },
	} = useForm({
		mode: "onTouched",
		resolver: yupResolver(loginSchema),
		defaultValues: initialValues,
	});

	const onSubmit = async (data) => {
		setLoading(true);
		try {
			const { data: auth } = await login(data.email, data.password);
			saveAuth(auth);
			setAuthUser(true);
			const userResponse = await getUser(auth.access_token);
			setCurrentUser(userResponse.data);
			//navigate("/account");
			setLoading(false);
		} catch (error) {
			console.error(error);
			saveAuth(undefined);
			setBackendError(error.response.data);
			setLoading(false);
		}
	};

	return (

		<form
		//className="form w-100"
		onSubmit={handleSubmit(onSubmit)}
		noValidate
		id="kt_login_signin_form"
	>
		
	
	
		
			<div className="row">
            <div className="col-12">
				<div className="text-center mb-5">
                <a href="#!">
                  <img className="logo" src={Logo} alt="Logo CARDIF El Djazair" />
                </a>
              </div>
			   </div>
            </div>

				{backendError && (
					<div className="login-backend-error">
						<p>{backendError}</p>
					</div>
				)}

<div className="row gy-3 gy-md-4 overflow-hidden">
		  <div className="col-12">
			<label  className="form-label">Email <span className="text-danger">*</span></label>
			<div className="input-group">
			  <span className="input-group-text">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-envelope" viewBox="0 0 16 16">
				  <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z" />
				</svg>
			  </span>
			  <input 
			 className="form-control" 
			 placeholder="Votre adresse Email"
			 {...register("email")}
			
			 type="email"
			 name="email"
			 autoComplete="off"/>
			</div>
			{errors.email && (
						<p className="error-message">{errors.email.message}</p>
					)}

		  </div>
		  <div className="col-12">
			<label  className="form-label">Password <span className="text-danger">*</span></label>
			<div className="input-group">
			  <span className="input-group-text">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-key" viewBox="0 0 16 16">
				  <path d="M0 8a4 4 0 0 1 7.465-2H14a.5.5 0 0 1 .354.146l1.5 1.5a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0L13 9.207l-.646.647a.5.5 0 0 1-.708 0L11 9.207l-.646.647a.5.5 0 0 1-.708 0L9 9.207l-.646.647A.5.5 0 0 1 8 10h-.535A4 4 0 0 1 0 8zm4-3a3 3 0 1 0 2.712 4.285A.5.5 0 0 1 7.163 9h.63l.853-.854a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.793-.793-1-1h-6.63a.5.5 0 0 1-.451-.285A3 3 0 0 0 4 5z" />
				  <path d="M4 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
				</svg>
			  </span>
			  <input 
			
			   className="form-control"
			   placeholder="Votre mot de passe"
			   type="password"
			   {...register("password")}	
				name="password"
				autoComplete="off"/>
			</div>
			{errors.password && (
						<p className="error-message">{errors.password.message}</p>
					)}
		  </div>
		  <div className="col-12">
			<div className="d-grid">
			  <button
			   className="btn btn-success btn-lg" 
			  type="submit"
			  disabled={loading}>
				
				{!loading && <span>Connexion</span>}
				{loading && (
							<span
							>
								Veuillez patienter...
								
							</span>
						)}
				
				</button>
			</div>
		  </div>
		</div>

				

		<div className="row">
            <div className="col-12">
              <hr className="mt-5 mb-4 border-secondary-subtle"/>
              <div className="d-flex gap-2 gap-md-4 flex-column flex-md-row justify-content-md-center">
                
                <Link to='/auth/forgot-password' className="link-secondary text-decoration-none">Mot de passe oublié ?</Link>
              </div>
            </div>
          </div>

			
		
			


				
			</form>
	
	);
}
