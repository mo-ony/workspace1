//@ts-nocheck
import { useState } from "react";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { requestPassword } from "../core/_requests";
import { useAuth } from "../core/Auth";
import { useNavigate } from "react-router-dom";
import "./LoginRegister.css";
import Logo from "../../../assets/icons/CARDIF_El_Djazair_Q 1.svg";
import { useLocation } from 'react-router-dom';
import { Link } from "react-router-dom";
const loginSchema = Yup.object().shape({
	email: Yup.string()
		.required("L'adresse e-mail est obligatoire.")
		.email("La format de l'adresse e-mail est incorrecte.")
		.min(3, "Un minimum de 3 symboles est requis.")
		.max(50, "Un maximum de 50 caractères est autorisé.")
	
});

const initialValues = {
	email: ""

};

export function  ForgotPassword() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const encodedErrorMessage = searchParams.get('error');
  const errorMessage = encodedErrorMessage ? decodeURIComponent(encodedErrorMessage) : null;
	const navigate = useNavigate();
	const [backendError, setBackendError] = useState("");
	const [loading, setLoading] = useState(false);
	const [hasErrors, setHasErrors] = useState<boolean | undefined>(undefined)
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors },
	} = useForm({
		mode: "onTouched",
		resolver: yupResolver(loginSchema),
		defaultValues: initialValues,
	});

	const onSubmit = async (data) => {
		setLoading(true);
		try {
			setHasErrors(undefined)
			const response = await requestPassword(data.email);
			setLoading(false);
			setHasErrors(false)
		
		} catch (error) {
			
				console.error(error);
				setBackendError(error.response.data);
				setLoading(false);
				setHasErrors(true)
		
			
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
		   {errorMessage && <div className="login-backend-error"> <p>{errorMessage}</p>	</div>}
		</div>
          

				{hasErrors === true  && (
					<div className="login-backend-error">
						<p>{backendError}</p>
					</div>
				)}
				{  hasErrors === false  && (
					<div className="login-backend-success">
						<p>Nous avons envoyé un lien de réinitialisation de mot de passe à votre adresse e-mail.</p>
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
                
                <Link to='/auth' className="link-secondary text-decoration-none">Connexion</Link>
              </div>
            </div>
          </div>
		 
				
			</form>
		
	);
}
