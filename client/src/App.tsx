import React, { useEffect, useRef, useState } from 'react';
import { GoogleLogin, GoogleLoginResponse, GoogleLoginResponseOffline, GoogleLogout } from 'react-google-login';
import { gapi } from 'gapi-script';
import './App.css';
import { Upload } from './components/Upload';
import { ImageSelector } from './components/ImageSelector';
import { ImageViewer } from './components/ImageViewer';

function App() {
	const [ imageKey, setImageKey ] = useState<string>();
	const [ profile, setProfile ] = useState<GoogleLoginResponse["profileObj"] | null>(null);
	const [ image, setImage ] = useState<File | null>(null);
	const [ refreshObjects, setRefreshObjects ] = useState<boolean>(false);
	const authClientId = process.env.REACT_APP_GOOGLE_AUTH_CLIENT_ID;
	const bucketName = process.env.REACT_APP_BUCKET_NAME;

	useEffect(() => {
		const initClient = () => {
			gapi.client.init({
				clientId: authClientId,
				scope: ''
			});
		};
		gapi.load('client:auth2', initClient);
	}, []);

	const onSuccess = (res: GoogleLoginResponse | GoogleLoginResponseOffline) => {
        console.log('success:', res);
		if ('profileObj' in res) {
			setProfile(res.profileObj);
		}
    };

    const onFailure = (err: any) => {
        console.log('failed:', err);
    };

	const logOut = () => {
		setProfile(null);
	}

	return (
		<div>
			{profile ? 
			<div>
				<h1>Hello, {profile.name} <GoogleLogout clientId={authClientId!} buttonText="Log out" onLogoutSuccess={logOut} /></h1>
				<ImageSelector bucketName={bucketName!} setImageKey={setImageKey} refreshObjects={refreshObjects}/>
				<Upload setImage={setImage}/>
				<ImageViewer bucketName={bucketName!} imageKey={imageKey} image={image} setImage={setImage} setRefreshObjects={setRefreshObjects} userName={profile.name}/>
			</div> :
			<div>
				<h1>Please log in with Google</h1>
				<GoogleLogin
					clientId={`${process.env.REACT_APP_GOOGLE_AUTH_CLIENT_ID}`}
					buttonText="Sign in with Google"
					onSuccess={onSuccess}
					onFailure={onFailure}
					cookiePolicy={'single_host_origin'}
					isSignedIn={true}
				/>
			</div>
			}
		</div>
	);
}

export default App;
