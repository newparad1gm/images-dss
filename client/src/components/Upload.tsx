import React, { useEffect, useState } from 'react';

interface UploadProps {
    bucketName: string;
}

export const Upload = (props: UploadProps): JSX.Element | null => {
    const { bucketName } = props;
    const [ selectedFile, setSelectedFile ] = useState<File>();

    const fileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        }
    }

    const uploadImage = () => {
        if (selectedFile) {
            const data = new FormData();
            data.append('object', selectedFile);

            return fetch(`api/upload/${bucketName}`, {
                method: 'POST',
                body: data
            });
        }
    }

    return (
        <div>
            { selectedFile && (
                <div>
                    File Name: {selectedFile.name}<br/>
                    File Type: {selectedFile.type}
                </div>)
            }
            <input type="file" name="image" onChange={fileSelect} />
            <button onClick={uploadImage}>Upload</button>
        </div>
    )
}