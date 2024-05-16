// @ts-nocheck
// line 1 to remove any TS error indications
import React, { useState, useEffect, useRef } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import _FontAwesome from "react-native-vector-icons/FontAwesome";
import { addPhoto } from "../reducers/user";
import { useDispatch } from "react-redux";
import { Camera, CameraType, FlashMode } from "expo-camera";

export default function SnapScreen() {
  const dispatch = useDispatch();

  const [facing, setFacing] = useState("back");
  const [torch, setTorch] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const FontAwesome = _FontAwesome as React.ElementType;
  const formData = new FormData();

  let cameraRef: any = useRef(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const takePicture = async () => {
    const photo = await cameraRef.takePictureAsync({ quality: 0.3 });

    const formData = new FormData();

    formData.append("photoFromFront", {
      uri: photo.uri,
      name: "photo.jpg",
      type: "image/jpeg",
    });

    fetch("http://192.168.1.149:3000/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((cloudResponse) => {
        dispatch(addPhoto(cloudResponse.url));
      });
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={(ref) => (cameraRef = ref)}
        enableTorch={torch}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              setFacing((current) => (current === "back" ? "front" : "back"))
            }
          >
            <FontAwesome name="rotate-right" size={25} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => cameraRef && takePicture()}
          >
            <FontAwesome name="circle-thin" size={75} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setTorch(() => !torch)}
          >
            <FontAwesome
              name="flash"
              size={25}
              color={!torch ? "#ffffff" : "#e8be4b"}
            />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});
