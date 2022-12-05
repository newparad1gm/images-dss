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

	useEffect(() => {
		const initClient = () => {
			gapi.client.init({
				clientId: process.env.REACT_APP_GOOGLE_AUTH_CLIENT_ID,
				scropt: ''
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
				<h1>Logged In</h1>
				Hello {profile.name}
				<GoogleLogout clientId={`${process.env.REACT_APP_GOOGLE_AUTH_CLIENT_ID}`} buttonText="Log out" onLogoutSuccess={logOut} />
				<ImageSelector bucketName="test-bucket" setImageKey={setImageKey}/>
				<Upload bucketName="test-bucket"/>
				<ImageViewer bucketName="test-bucket" imageKey={imageKey}/>
			</div> :
			<GoogleLogin
				clientId={`${process.env.REACT_APP_GOOGLE_AUTH_CLIENT_ID}`}
				buttonText="Sign in with Google"
				onSuccess={onSuccess}
				onFailure={onFailure}
				cookiePolicy={'single_host_origin'}
				isSignedIn={true}
			/>
			}
		</div>
	);
}

export default App;
