import React, { useEffect, useState } from 'react';

interface UploadProps {
    image: File | null;
    setImage: React.Dispatch<React.SetStateAction<File | null>>
}

export const Upload = (props: UploadProps): JSX.Element | null => {
    const { image, setImage } = props;

    const fileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setImage(null);
            setImage(event.target.files[0]);
        }
    }

    return (
        <div>
            <input type="file" name="image" onChange={fileSelect} title=" " />
            { image && (
                <div>
                    File Name: {image.name}<br/>
                </div>)
            }
        </div>
    )
}