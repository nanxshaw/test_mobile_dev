import React, { Component } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, PermissionsAndroid, Image, Alert } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import GetLocation from 'react-native-get-location';
import axios from 'axios';


const ip_address = '192.168.1.3' // <----- change IP ADDRESS in your laptop or pc
const http = 'http://' + ip_address + ':8080/api';

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            image: null,
            position: null
        };
    }

    componentDidMount = async () => {
        //chek permission android
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Location Access Required',
                    message: 'This App needs to Access your location',
                },
            );
            const grantedcamera = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: "App Camera Permission",
                    message: "App needs access to your camera ",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK"
                }
            );
            const grantedstorage = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                    title: "App Camera Permission",
                    message: "App needs access to your camera ",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK"
                }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED &&
                grantedcamera === PermissionsAndroid.RESULTS.GRANTED &&
                grantedstorage === PermissionsAndroid.RESULTS.GRANTED) {
                this.getCurrentPosition();
            } else {
                console.log('Permission Denied');
            }
        } catch (err) {
            console.warn(err);
        }
    }

    //get current your position
    getCurrentPosition = () => {
        GetLocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 15000,
        })
            .then(location => {
                console.log(location)
                this.setState({ position: location })
            })
            .catch(error => {
                const { code, message } = error;
                console.warn(code, message);
            })
    }

    //open image in your phone
    uploadImage = () => {
        let options = {
            maxWidth: 550,
            maxHeight: 550,
            quality: 1,
        };
        launchImageLibrary(options, (response) => {
            let res = response.assets[0];
            let imgs = {
                uri: res.uri,
                name: res.fileName,
                type: res.type
            }
            this.setState({
                image: imgs
            })
        });
    }

    //open camera in your phone
    openCamera = () => {
        let options = {
            maxWidth: 550,
            maxHeight: 550,
            quality: 1,
            saveToPhotos: true,
        };
        launchCamera(options, (response) => {
            let res = response.assets[0];
            let imgs = {
                uri: res.uri,
                name: res.fileName,
                type: res.type
            }
            this.setState({
                image: imgs
            })
        });
    }

    //send to restapi nodejs
    save = async () => {
        const { image, position } = this.state;
        if (position != null) {
            if (image != null) {
                const url = http + '/upload/add';
                let options = {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                };
                let formData = new FormData();
                formData.append('image', image);
                formData.append('latitude', position.latitude);
                formData.append('longitude', position.longitude);
                await axios.post(url, formData, options)
                    .then(response => {
                        if (response.status == 200) {
                            this.setState({
                                image: null
                            })
                            Alert.alert('Notice', 'Success Insert Data');
                        } else {
                            Alert.alert('Notice', 'Failed Insert Data');
                        }
                    })
                    .catch(error => console.log(error));

            } else {
                Alert.alert('Notice', 'Image is empty!');
            }
        } else {
            Alert.alert('Notice', 'Position Denied. check location in your phone');
        }
    }

    render() {
        const { image } = this.state;
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.title}>Test Developer</Text>
                <View style={styles.form}>
                    <View style={styles.row}>
                        <Image source={image != null ? { uri: image.uri } : require('../assets/blank.jpg')} resizeMethod="resize" resizeMode='contain' style={styles.img} />
                        <View>
                            <TouchableOpacity onPress={this.uploadImage} activeOpacity={.7} style={styles.btn_out}>
                                <Text style={styles.tx_out}>Open Library</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={this.openCamera} activeOpacity={.7} style={styles.btn_out}>
                                <Text style={styles.tx_out}>Open Camera</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <TouchableOpacity onPress={this.save} activeOpacity={.7} style={styles.btn}>
                        <Text style={styles.tx_btn}>Save</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );

    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        color: ""
    },
    title: {
        fontSize: 20,
        marginBottom: 10
    },
    btn: {
        backgroundColor: "#FFA07A",
        color: "#FFF",
        padding: 10,
        margin: 5,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 5
    },
    btn_out: {
        borderColor: "#CCC",
        borderWidth: 1,
        color: "#FFF",
        padding: 10,
        margin: 5,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 5
    },
    tx_btn: {
        fontWeight: "bold",
        color: "#FFF"
    },
    tx_out: {
        fontWeight: "bold",
        color: "#666"
    },
    img: {
        width: 120,
        height: 120,
        borderRadius: 10
    },
    form: {
        borderWidth: 1,
        borderColor: "#CCC",
        borderRadius: 10,
        padding: 10
    },
    row: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    }
});

export default Home;
