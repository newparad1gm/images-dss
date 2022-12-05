import { v4 as uuidv4 } from 'uuid';

export class Utils {
    static base64ToArrayBuffer = (base64: string): Uint8Array => {
        const binaryString = window.atob(base64);
        const binaryLen = binaryString.length;
        const bytes = new Uint8Array(binaryLen);
        for (let i = 0; i < binaryLen; i++) {
            const ascii = binaryString.charCodeAt(i);
            bytes[i] = ascii;
        }
        return bytes;
    }

    static bufferToFile = (fileName: string, bytes: Uint8Array, contentType: string): File => {
        return Utils.blobToFile(fileName, new Blob([bytes], {type: contentType}));
    }

    static blobToFile = (fileName: string, blob: Blob): File => {
        return new File([blob], fileName);
    }

    static newFileName = (fileName: string): string => {
        const newFileName = fileName.replace(/\.[^/.]+$/, "");
        return `${newFileName}-${uuidv4()}`;
    }
}