import React, { useEffect, useState } from 'react';
import { Utils } from '../Utils';

interface UploadProps {
    setImage: React.Dispatch<React.SetStateAction<File | null>>
}

export const Upload = (props: UploadProps): JSX.Element | null => {
    const { setImage } = props;

    const fileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        setImage(null);
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target && e.target.result && e.target.result instanceof ArrayBuffer) {
                    const blob = new Blob([new Uint8Array(e.target.result)], { type: file.type });
                    setImage(Utils.blobToFile(file.name, blob));
                }
            };
            reader.readAsArrayBuffer(file);
        }
    }

    return (
        <div>
            <input type="file" name="image" onChange={fileSelect} title=" " />
        </div>
    )
}