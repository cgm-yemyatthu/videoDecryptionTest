import * as RNFS from "react-native-fs";
import forge from "node-forge";

const baseURL = 'http://172.16.30.28:96';

const FILE_ENCRYPTION_BLOCKS = 255;
const KEY = 'video-encryption-testing-key-123';
const CIPHER = 'aes-256-cbc';

const downloadFile = async (file, savedFile) => {
    RNFS.downloadFile({
        fromUrl: `${baseURL}/api/video-file/download/${file}/download.enc`,
        toFile: RNFS.DocumentDirectoryPath + '/' + savedFile,
        progress: res => {
            console.log('Download Progress ::', res);
        },
    });
}

const decryptFile = async (fileName, outFile, setVideoUrl) => {
    console.log('========= DECRYPTING =========');
    const sourcePath = RNFS.DocumentDirectoryPath + '/' + fileName;
    const destPath = RNFS.DocumentDirectoryPath + '/' + outFile;
    let fileStats = await RNFS.stat(sourcePath);
    let iv = await RNFS.read(sourcePath, 16, 0, 'ascii');
    const fileSize = fileStats.size;
    console.log('FILE SIZE', fileSize);

    const numberOfChunks = Math.ceil((fileSize - 16) / (16 * (FILE_ENCRYPTION_BLOCKS + 1)));
    console.log('CHUNKS', numberOfChunks);

    await RNFS.writeFile(destPath, '', 'ascii');

    let chunkStep = Math.floor(numberOfChunks / 10);

    let decipher = forge.cipher.createDecipher('AES-CBC', KEY);

    for (let i = 0; i < numberOfChunks; i++) {
        const ciphertext = await RNFS.read(
            sourcePath,
            16 * (FILE_ENCRYPTION_BLOCKS + 1),
            i * (16 * (FILE_ENCRYPTION_BLOCKS + 1)) + 16,
            'ascii',
        );

        decipher.start({iv: iv});
        decipher.update(forge.util.createBuffer(ciphertext));
        var result = decipher.finish();

        console.log('Cipher Result::', result);
        let decryptedText = decipher.output.getBytes();

        if (
            ciphertext.length !== 16 * (FILE_ENCRYPTION_BLOCKS + 1) &&
            i + 1 < numberOfChunks
        ) {
            continue;
        }

        if (!decryptedText) {
            throw new Error('Decryption failed');
        }
        iv = ciphertext.substring(0, 16);

        // Write the decrypted data to the destination file
        // if ((i !== 0 && i % 50 == 0) || i == numberOfChunks - 1) {

        if (i % chunkStep == 0) {
            console.log('Time Segment ::', i);
            // setVideoPK(i);
            // console.log("Current Seek Time ::", currentSeekTime.current);

            // setVideoUrl({uri: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.mp4/.m3u8'});
            setVideoUrl({uri: 'file://' + destPath});
            // setDownloadedChunk(i)
        }
        await RNFS.appendFile(destPath, decryptedText, 'ascii');
    }
    setVideoUrl({uri: 'file://' + RNFS.DocumentDirectoryPath + '/' + outFile});
    // setVideoUrl({uri: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.mp4/.m3u8'});
    console.log('========= DECRYPTING FINISHED =========');
    return true;
};

export {downloadFile, decryptFile};


// const decryptFile = async (fileName, decryptedFileName, key) => {
//   const filePath = RNFS.DocumentDirectoryPath + '/' + fileName;
//   const fileStat = await RNFS.stat(filePath);
//   let iv = await RNFS.read(filePath, 16, 0, 'ascii');

//   let content = await RNFS.readFile(RNFS.DocumentDirectoryPath + '/' + decryptedFileName, 'ascii');
//   console.log(content);

//   const numberOfChunks = Math.ceil(
//     (fileStat.size - 16) / NUMBER_OF_BYTE_TO_READ,
//   );
//   let decipher = forge.cipher.createDecipher('AES-CBC', key);

//   try {
//     for (let j = 0; j < numberOfChunks; j++) {
//       const cipherText = await RNFS.read(
//         filePath,
//         NUMBER_OF_BYTE_TO_READ,
//         j * NUMBER_OF_BYTE_TO_READ,
//         'ascii',
//       );
//       decipher.start({ iv: iv });
//       decipher.update(forge.util.createBuffer(cipherText));
//       var result = decipher.finish();
//       console.log('Cipher Result::', result);
//       await RNFS.appendFile(
//         RNFS.DocumentDirectoryPath + '/' + decryptedFileName,
//         decipher.output.getBytes(),
//         'ascii',
//       );
//       iv = cipherText.substring(0, 16);
//       console.log('Next IV::', iv);
//     }
//     setCurrentVideoUrl(RNFS.DocumentDirectoryPath + '/' + decryptedFileName);
//     console.log('Complete Decrypting File!!');
//     showFile();
//   } catch (error) {
//     console.log('File Decryption Fail!!', error);
//   }
// };
