import React, { useEffect, useState } from 'react';
import { ReactPainter } from 'react-painter';
import { v4 as uuidv4 } from 'uuid';

interface ImageViewerProps {
    bucketName: string;
    imageKey?: string;
    image: File | null;
    setImage: React.Dispatch<React.SetStateAction<File | null>>;
    setRefreshObjects: React.Dispatch<React.SetStateAction<boolean>>;
    userName: string;
}

export const ImageViewer = (props: ImageViewerProps): JSX.Element | null => {
    const { bucketName, imageKey, image, setImage, setRefreshObjects, userName } = props;
    const [ saved, setSaved ] = useState<boolean>(false);

    useEffect(() => {
        const getImage = async () => {
            if (imageKey) {
                setImage(null);
                const response = await fetch(`api/get/${bucketName}/${imageKey}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    },
                });
                const json = await response.json();
                const bytes = base64ToArrayBuffer(json.buffer);
                setImage(bufferToFile(imageKey, bytes, json.contentType));
            }
        }
        getImage();
    }, [imageKey]);

    useEffect(() => {
        setSaved(false);
    }, [image]);

    const base64ToArrayBuffer = (base64: string): Uint8Array => {
        const binaryString = window.atob(base64);
        const binaryLen = binaryString.length;
        const bytes = new Uint8Array(binaryLen);
        for (let i = 0; i < binaryLen; i++) {
            const ascii = binaryString.charCodeAt(i);
            bytes[i] = ascii;
        }
        return bytes;
    }

    const bufferToFile = (fileName: string, bytes: Uint8Array, contentType: string): File => {
        return blobToFile(fileName, new Blob([bytes], {type: contentType}));
    }

    const blobToFile = (fileName: string, blob: Blob): File => {
        const file = new File([blob], fileName);
        return file;
    }

    const saveImage = async (blob: Blob) => {
        if (image) {
            const file = blobToFile(`${image.name}-${uuidv4()}`, blob);
            const data = new FormData();
            data.append('object', file);
            data.append('key', file.name);
            data.append('username', userName);

            const results = await fetch(`api/upload/${bucketName}`, {
                method: 'POST',
                body: data
            });
            if (results.status === 200) {
                setRefreshObjects(prevState => !prevState);
                setSaved(true);
            }
        }
    }

    return (
        image ?
        <div>
            <ReactPainter
                width={500}
                height={500}
                onSave={blob => { return saveImage(blob); }}
                image={image}
                render={({ canvas, triggerSave }) => (
                    <div>
                        <div className="awesomeContainer">{canvas}</div>
                        <button onClick={triggerSave}>Save</button>
                        { saved && <div>Saved!</div> }
                    </div>
                )}
            />
        </div> :
        null
    )
}