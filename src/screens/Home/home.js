import { View, Text, Share, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native'
import { useEffect } from 'react'
import { Button, IconButton } from 'react-native-paper'
import * as RNFS from 'react-native-fs';
import { ScrollView } from 'react-native'
import { useRef } from 'react'
import RenderIf from '../../component/renderIf'
import forge from 'node-forge'
import Video from 'react-native-video';
import { FlatList } from 'react-native-gesture-handler'

const Home = () => {
    const [fileInfoList, setFileInfoList] = useState([])
    const [currentVideoUrl, setCurrentVideoUrl] = useState("")
    const [refresh, setRefresh] = useState(false);
    const videoRef = useRef()

    useEffect(() => {
        showFile()
    }, [])

    const downloadFile = async () => {
        //video-file/download/I9VJBQJZFT1Si4npSXAc43cdv6URLvYs6rpsVY4k.mp4.enc/video.mp4
        //video-file/download/kjMTDSf38tq6IZl4buxiTrbx2H23TNI4rHXOrmXm.mp4.enc/video_test.enc
        await RNFS.downloadFile({
            fromUrl: 'http://172.16.30.35:8000/api/video-file/download/kjMTDSf38tq6IZl4buxiTrbx2H23TNI4rHXOrmXm.mp4.enc/video_test.enc',
            toFile: RNFS.DocumentDirectoryPath + '/' + "video_test.enc",
            progress: (res) => {
                console.log("Download Progress ::", res);
            }
        })
    }

    const showFile = async () => {
        const dirInfo = await RNFS.readDir(RNFS.DocumentDirectoryPath)
        const fileList = dirInfo.filter(item => item.isDirectory)
        setFileInfoList(fileList)
    }

    const playVideo = async (filePath) => {

    }

    const decryptFile = async (fileName, decryptedFileName, key) => {
        const filePath = RNFS.DocumentDirectoryPath + '/' + fileName
        const fileStat = await RNFS.stat(filePath);
        let iv = await RNFS.read(filePath, 16, 0, 'base64');
        const numberOfChunks = Math.ceil((fileStat.size - 16) / NUMBER_OF_BYTE_TO_READ);
        let decipher = forge.cipher.createDecipher('AES-CBC', key)

        try {
            for (let j = 0; j < numberOfChunks; j++) {
                const cipherText = await RNFS.read(filePath, NUMBER_OF_BYTE_TO_READ, j * NUMBER_OF_BYTE_TO_READ, 'base64')
                decipher.start({ iv: iv });
                decipher.update(forge.util.createBuffer(cipherText))
                var result = decipher.finish()
                console.log("Cipher Result::", result);
                await RNFS.appendFile(RNFS.DocumentDirectoryPath + '/' + decryptedFileName, decipher.output.getBytes(), 'ascii')
                iv = cipherText.substring(0, 16);
                console.log("Next IV::", iv);
            }
            setCurrentVideoUrl(RNFS.DocumentDirectoryPath + '/' + decryptedFileName)
            console.log("Complete Decrypting File!!");
            showFile()
        } catch (error) {
            console.log("File Decryption Fail!!", error);
        }
    }

    const handleRefresh = () => {

    }

    const renderItem = () => {

    }


    return (
        <>
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView style={{ flex: 1 }}>
                    <Button mode='contained' color={"#000"} style={{ margin: 20 }} labelStyle={{ padding: 7 }} onPress={downloadFile}>Download File</Button>
                    {fileInfoList.map((item, idx) => (
                        <TouchableOpacity key={idx} activeOpacity={.7} style={{ padding: 10, margin: 15, backgroundColor: '#fff', borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
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
                                    onPress={() => decryptFile(item.name, 'decryptedVideo.mp4', 'video-encryption-testing-key-123')}
                                />
                            </View>
                        </TouchableOpacity>
                    ))}

                    {/* <Video source={{ uri: RNFS.DocumentDirectoryPath + '/' + 'decryptVideo2.mp4' }} style={{ width: '100%', margin: 15, height: 300 }} /> */}

                </ScrollView>
            </SafeAreaView>
        </>
    )
}

const NUMBER_OF_BYTE_TO_READ = (16 * (555 + 1))



export default Home