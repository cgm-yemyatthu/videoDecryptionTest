import {SafeAreaView, ScrollView, Text, TouchableOpacity, View,} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {Button, IconButton} from 'react-native-paper';
import * as RNFS from 'react-native-fs';
import Video from 'react-native-video';
import RenderIf from '../../component/renderIf';
import {decryptFile, downloadFile} from "../../services/utils";

const Home = () => {
    const [fileInfoList, setFileInfoList] = useState([]);
    const [currentVideoUrl, setCurrentVideoUrl] = useState('');
    const [refresh, setRefresh] = useState(false);
    const videoRef = useRef();
    const [videoSourceUrl, setVideoUrl] = useState();
    const currentSeekTime = useRef(0);
    const [downloadedChunk, setDownloadedChunk] = useState(0);
    const [videoPK, setVideoPK] = useState(0);

    useEffect(() => {
        showFile();
    }, []);

    const showFile = async () => {
        const dirInfo = await RNFS.readDir(RNFS.DocumentDirectoryPath);
        const fileList = dirInfo.filter(item => item.isDirectory);
        setFileInfoList(fileList);
    };

    //video-file/download/I9VJBQJZFT1Si4npSXAc43cdv6URLvYs6rpsVY4k.mp4.enc/video.mp4
    //video-file/download/kjMTDSf38tq6IZl4buxiTrbx2H23TNI4rHXOrmXm.mp4.enc/video_test.enc
    const download = async () => {
        await downloadFile('XZ4XSYDfEaTLprc81ZfvBPINekcF6OTAZfJJxXhp.ts.enc', 'video_test.enc')
    }

    const playVideo = async filePath => {
    };

    const decrypt = async (filename) => {
        await decryptFile(filename, `video_test.mp4`, setVideoUrl);
    }

    const handleRefresh = () => {
    };

    const renderItem = () => {
    };
    {
        console.log('re render occuer');
    }
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
                    <RenderIf isTrue={videoSourceUrl}>
                        <Video
                            ref={videoRef}
                            source={videoSourceUrl}
                            control={true}
                            // onLoad={() => {
                            //   console.log("Video component loaded");
                            //   videoRef.current.seek(currentSeekTime.current)
                            // }}
                            // onProgress={(progress) => {
                            //   console.log("Progres::", progress);
                            //   currentSeekTime.current = progress.seekableDuration
                            // }}
                            style={{width: 400, margin: 15, height: 200}}
                        />
                    </RenderIf>
                </ScrollView>
            </SafeAreaView>
        </>
    );
};

export default Home;
