import React, { useEffect, useState } from 'react';

interface ImageSelectorProps {
    bucketName: string;
    setImageKey: React.Dispatch<React.SetStateAction<string | undefined>>;
}

interface ImageEntryProps {
    obj: string; 
    selectImage: (obj: string | null) => void;
}

const ImageEntry = (props: ImageEntryProps): JSX.Element => {
    const { obj, selectImage } = props;
    return (
        <span onClick={() => { {selectImage(obj)} }}>{obj}</span>
    );
}

export const ImageSelector = (props: ImageSelectorProps): JSX.Element | null => {
    const { bucketName, setImageKey } = props;
	const [ objects, setObjects ] = useState<{ Key: string, Size: number }[]>([]);

    useEffect(() => {
        const getObjects = async () => {
            const response = await fetch(`http://localhost:8080/api/objects/${bucketName}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });
            const json = await response.json();
            setObjects(json);
        }
        getObjects();
    }, []);

    const selectImage = (obj: string | null) => {
        if (obj) {
            setImageKey(obj);
        }
    }

    return (
        objects ?
        <div>
            <div>Objects in {bucketName}</div>
            <ul>
                { objects.map((obj, i) => (
                    <li key={i}>
                        <ImageEntry obj={obj.Key} selectImage={selectImage}/>
                    </li>
                ))}
            </ul>
        </div> :
        null
    )
}