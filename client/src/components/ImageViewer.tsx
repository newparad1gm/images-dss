import React, { useEffect, useState } from 'react';

interface ImageViewerProps {
    bucketName: string;
    imageKey?: string;
}

export const ImageViewer = (props: ImageViewerProps): JSX.Element | null => {
    const { bucketName, imageKey } = props;
	const [ image, setImage ] = useState<JSON[]>([]);

    useEffect(() => {
        const getImage = async () => {
            if (imageKey) {
                const response = await fetch(`http://localhost:8080/api/get/${bucketName}/${imageKey}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    },
                });
                const json = await response.json();
                setImage(json);
            }
        }
        getImage();
    }, [imageKey]);

    return (
        imageKey ?
        <div>
            <div>{imageKey}</div>
            <img src={`data:image/png;base64,${image}`}/>
        </div> :
        null
    )
}