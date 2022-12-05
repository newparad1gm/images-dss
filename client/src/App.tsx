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

	useEffect(() => {
		const initClient = () => {
			gapi.client.init({
				clientId: process.env.REACT_APP_GOOGLE_AUTH_CLIENT_ID,
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
				<h1>Hello, {profile.name} <GoogleLogout clientId={`${process.env.REACT_APP_GOOGLE_AUTH_CLIENT_ID}`} buttonText="Log out" onLogoutSuccess={logOut} /></h1>
				<ImageSelector bucketName="test-bucket" setImageKey={setImageKey} refreshObjects={refreshObjects}/>
				<Upload image={image} setImage={setImage}/>
				<ImageViewer bucketName="test-bucket" imageKey={imageKey} image={image} setImage={setImage} setRefreshObjects={setRefreshObjects} userName={profile.name}/>
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
