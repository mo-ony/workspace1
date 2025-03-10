//@ts-nocheck
import { useState } from "react";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import {  changePasswordRequest } from "../core/_requests";
import { useAuth } from "../core/Auth";
import { useNavigate } from "react-router-dom";
import "./LoginRegister.css";
import Logo from "../../../assets/icons/CARDIF_El_Djazair_Q 1.svg";
import { useLocation } from 'react-router-dom';
import { Link } from "react-router-dom";
const changePasswordSchema = Yup.object().shape({
    password: Yup.string()
    .min(3, '"Un minimum de 3 symboles est requis.')
    .max(50, 'Un maximum de 50 caractères est autorisé.')
    .required('mot de passe est obligatoire.'),
  changepassword: Yup.string()
    .min(3, '"Un minimum de 3 symboles est requis.')
    .max(50, 'Un maximum de 50 caractères est autorisé.')
    .required('la confirmation du mot de passe est obligatoire.')
    .oneOf([Yup.ref('password')], "Le mot de passe et la confirmation du mot de passe ne correspondent pas."),

	
});

const initialValues = {
    password: '',
    changepassword: ''
  

};

export function  ChangePassword() {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const encodedToken = searchParams.get('token');
    const token = encodedToken ? decodeURIComponent(encodedToken) : null;


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
		resolver: yupResolver(changePasswordSchema),
		defaultValues: initialValues,
	});


	const onSubmit = async (data) => {
		setLoading(true);
		try {
            setHasErrors(undefined)
			setHasErrors(false)

            const response = await changePasswordRequest(token, data.password);
	
			
		} catch (error) {
			
			console.error(error);
				setHasErrors(true)
                setBackendError(error.response.data);
               
		}
        finally
        {
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
				<div className="col-12">
			<div className="text-center mb-5">
			<a href="#!">
			  <img className="logo" src={Logo} alt="Logo CARDIF El Djazair" />
			</a>
		  </div>
		   </div>
			
				{  hasErrors === false  && (
					<div className="login-backend-success">
						<p>Le mot de passe a été changé avec succès.</p>
					</div>
				)}{backendError && (
					<div className="login-backend-error">
						<p>{backendError}</p>
					</div>
				)}


<div className="row gy-3 gy-md-4 overflow-hidden">
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
			<label  className="form-label"> Confirmation du Mot de passe <span className="text-danger">*</span></label>
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
			   {...register("changepassword")}
			   name="changepassword"
				autoComplete="off"/>
			</div>
			{errors.changepassword && (
						<p className="error-message">{errors.changepassword.message}</p>
					)}
		  </div>
             
              
		  <div className="col-12">
			<div className="d-grid">
			  <button
			   className="btn btn-success btn-lg" 
			  type="submit"
			  disabled={loading}>
				
				{!loading && <span>Sauvegarder</span>}
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
