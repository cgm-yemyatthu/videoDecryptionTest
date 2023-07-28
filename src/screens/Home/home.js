import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {Button, IconButton} from 'react-native-paper';
import * as RNFS from 'react-native-fs';
import forge from 'node-forge';
import Aes from 'react-native-aes-crypto';
import Video from "react-native-video";

const FILE_ENCRYPTION_BLOCKS = 255;
const KEY = 'video-encryption-testing-key-123';
const CIPHER = 'aes-256-cbc';

const Home = () => {
  const [fileInfoList, setFileInfoList] = useState([]);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const [refresh, setRefresh] = useState(false);
  const videoRef = useRef();

  useEffect(() => {
    showFile();
  }, []);

  const downloadFile = async () => {
    //video-file/download/I9VJBQJZFT1Si4npSXAc43cdv6URLvYs6rpsVY4k.mp4.enc/video.mp4
    //video-file/download/kjMTDSf38tq6IZl4buxiTrbx2H23TNI4rHXOrmXm.mp4.enc/video_test.enc
    await RNFS.downloadFile({
      fromUrl:
        'http://172.16.30.28:96/api/video-file/download/MAo2sWl701s3hTnxLG0mLTnjfyfwQMwN8HK8SwuD.mp4.enc/IMG_0622.mp4',
      toFile: RNFS.DocumentDirectoryPath + '/' + 'this_is_big_video1.enc',
      progress: res => {
        console.log('Download Progress ::', res);
      },
    });
  };

  const showFile = async () => {
    const dirInfo = await RNFS.readDir(RNFS.DocumentDirectoryPath);
    const fileList = dirInfo.filter(item => item.isDirectory);
    setFileInfoList(fileList);
  };

  const playVideo = async filePath => {};

  const decrypt = async (fileName) => {
    const sourcePath = RNFS.DocumentDirectoryPath + '/' + fileName;
    const destPath = RNFS.DocumentDirectoryPath + '/' + 'this_is_big_video1.mp4';

    // let content = await RNFS.readFile(RNFS.DocumentDirectoryPath + '/' + 'thisisimage.jpg', 'ascii');
    // console.log(content);
    let fileStats = await RNFS.stat(sourcePath);
    let iv = await RNFS.read(sourcePath, 16, 0, 'ascii');

    console.log(iv);
    const fileSize = fileStats.size;
    console.log(fileSize);
    const numberOfChunks = Math.ceil((fileSize - 16) / (16 * (FILE_ENCRYPTION_BLOCKS + 1)),);

    // Create an empty destination file
    await RNFS.writeFile(destPath, '', 'ascii');


    for (let i = 0; i < numberOfChunks; i++) {
      // We have to read one block more for decrypting than for encrypting because of the initialization vector
      const ciphertext = await RNFS.read(
        sourcePath,
        16 * (FILE_ENCRYPTION_BLOCKS + 1),
        i * (16 * (FILE_ENCRYPTION_BLOCKS + 1)) + 16,
        'ascii',
      );

      console.log(16 * (FILE_ENCRYPTION_BLOCKS + 1));

      let decipher = forge.cipher.createDecipher('AES-CBC', KEY);
      decipher.start({iv: iv});
      decipher.update(forge.util.createBuffer(ciphertext));
      var result = decipher.finish();
      console.log('Cipher Result::', result);
      let decryptedText = decipher.output.getBytes();

      // const decryptedText = await Aes.decrypt(ciphertext, KEY, iv, CIPHER);

      // Check if the size read from the stream is different than the requested chunk size
      // In this scenario, request the chunk again, unless this is the last chunk
      if (
        ciphertext.length !== 16 * (FILE_ENCRYPTION_BLOCKS + 1) &&
        i + 1 < numberOfChunks
      ) {
        continue;
      }

      if (!decryptedText) {
        throw new Error('Decryption failed');
      }

      // Get the first 16 bytes of the ciphertext as the next initialization vector
      iv = ciphertext.substring(0, 16);

      // Write the decrypted data to the destination file
      await RNFS.appendFile(destPath, decryptedText, 'ascii');
    }

    console.log('finished');
    return true;
  };

  const decryptFile = async (fileName, decryptedFileName, key) => {
    const filePath = RNFS.DocumentDirectoryPath + '/' + fileName;
    const fileStat = await RNFS.stat(filePath);
    let iv = await RNFS.read(filePath, 16, 0, 'ascii');

    let content = await RNFS.readFile(RNFS.DocumentDirectoryPath + '/' + decryptedFileName, 'ascii');
    console.log(content);

    const numberOfChunks = Math.ceil(
      (fileStat.size - 16) / NUMBER_OF_BYTE_TO_READ,
    );
    let decipher = forge.cipher.createDecipher('AES-CBC', key);

    try {
      for (let j = 0; j < numberOfChunks; j++) {
        const cipherText = await RNFS.read(
          filePath,
          NUMBER_OF_BYTE_TO_READ,
          j * NUMBER_OF_BYTE_TO_READ,
          'ascii',
        );
        decipher.start({iv: iv});
        decipher.update(forge.util.createBuffer(cipherText));
        var result = decipher.finish();
        console.log('Cipher Result::', result);
        await RNFS.appendFile(
          RNFS.DocumentDirectoryPath + '/' + decryptedFileName,
          decipher.output.getBytes(),
          'ascii',
        );
        iv = cipherText.substring(0, 16);
        console.log('Next IV::', iv);
      }
      setCurrentVideoUrl(RNFS.DocumentDirectoryPath + '/' + decryptedFileName);
      console.log('Complete Decrypting File!!');
      showFile();
    } catch (error) {
      console.log('File Decryption Fail!!', error);
    }
  };

  const handleRefresh = () => {};

  const renderItem = () => {};

  return (
    <>
      <SafeAreaView style={{flex: 1}}>
        <ScrollView style={{flex: 1}}>
          <Button
            mode="contained"
            color={'#000'}
            style={{margin: 20}}
            labelStyle={{padding: 7}}
            onPress={downloadFile}>
            Download
          </Button>
          {fileInfoList.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.7}
              style={{
                padding: 10,
                margin: 15,
                backgroundColor: '#fff',
                borderRadius: 10,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <View>
                <Text>Name : {item.name}</Text>
                <Text>File Size : {item.size / 1000000} MB</Text>
                <Text>Time : {item.ctime}</Text>
              </View>
              <View>
                <IconButton
                  icon="play"
                  color={'#000'}
                  size={20}
                  onPress={() => decrypt(item.name)}
                />
              </View>
            </TouchableOpacity>
          ))}

          <Image source={{ uri: 'file://' + RNFS.DocumentDirectoryPath + '/' + 'thisisimage.jpg' }}  style={{ width: 300, height: 300 }}/>
           <Video source={{ uri: 'file://' + RNFS.DocumentDirectoryPath + '/' + 'this_is_big_video1.mp4' }} style={{ width: '100%', margin: 15, height: 300 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const NUMBER_OF_BYTE_TO_READ = 16 * (555 + 1);

export default Home;
