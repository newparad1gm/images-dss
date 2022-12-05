import React, { useEffect, useState } from 'react';

interface ImageSelectorProps {
    bucketName: string;
    setImageKey: React.Dispatch<React.SetStateAction<string | undefined>>;
    refreshObjects: boolean;
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
    const { bucketName, setImageKey, refreshObjects } = props;
	const [ objects, setObjects ] = useState<{ Key: string, Size: number }[]>([]);

    useEffect(() => {
        const getObjects = async () => {
            const response = await fetch(`api/objects/${bucketName}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });
            const json = await response.json();
            setObjects(json);
        }
        getObjects();
    }, [refreshObjects]);

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