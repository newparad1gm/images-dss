import React, { useEffect, useState } from 'react';
import { ReactPainter } from 'react-painter';
import { Utils } from '../Utils';

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
    const [ fileName, setFileName ] = useState<string>("");

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
                const bytes = Utils.base64ToArrayBuffer(json.buffer);
                const file = Utils.bufferToFile(Utils.newFileName(imageKey), bytes, json.contentType);
                setImage(file);
                setFileName(file.name);
            }
        }
        getImage();
    }, [imageKey]);

    useEffect(() => {
        if (image) {
            setFileName(image.name);
        }
        setSaved(false);
    }, [image]);

    const saveImage = async (blob: Blob) => {
        if (image) {
            const newFileName = fileName ? fileName : image.name;
            const file = Utils.blobToFile(newFileName, blob);
            const data = new FormData();
            data.append('object', file);
            data.append('key', newFileName);

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
                width={800}
                height={800}
                onSave={blob => { return saveImage(blob); }}
                image={image}
                render={({ canvas, triggerSave, setColor, setLineWidth }) => (
                    <div>
                        Name: <input type="text" style={{width:"400px"}} value={fileName} onChange={e => setFileName(e.target.value)}/>&nbsp;&nbsp;
                        <button onClick={triggerSave}>Save</button> { saved && <div>Saved!</div> } <br/>
                        Choose a Color: <input type="color" onChange={e => setColor(e.target.value)} />&nbsp;&nbsp;
                        Set Line Width: <input type="number" onChange={e => setLineWidth(parseInt(e.target.value))} />
                        <div className="awesomeContainer">{canvas}</div>
                    </div>
                )}
            />
        </div> :
        null
    )
}