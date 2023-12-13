import React, { forwardRef, useImperativeHandle } from 'react';
import { Dimensions, Modal, Platform, StyleSheet, View, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { ScriptStartCreateImages, sleep } from './scripts';
import { WebApp } from './WebApp.tsx';

export interface BingImageCreatorRef {
  getImages: (message: string) => Promise<string[]>;
}

interface BingImageCreatorProps {}

const originWhitelist = ['https://*'];
const userAgent =
  Platform.OS === 'ios'
    ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'
    : 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.5790.166 Mobile Safari/537.36';

const JSONtryParse = (text: string) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const BingImageCreator = forwardRef((props: BingImageCreatorProps, ref: any) => {
  const [webviewSession, setWebviewSession] = React.useState<WebView | null>(null);

  const [loggiEnabled, setLoggiEnabled] = React.useState<boolean>(false);
  const [message, setMessage] = React.useState<string>('');

  const [responseImagesResolve, setResponseImagesResolve] = React.useState<(value: any) => void>();
  const [responseImagesReject, setResponseImagesReject] = React.useState<(reason?: any) => void>();

  const messageRecived = (event: any) => {
    try {
      const data = event.nativeEvent.data;
      const responseData = JSONtryParse(data);
      setMessage('');
      setLoggiEnabled(false);

      if (responseData && responseData.images) {
        responseData.images = responseData.images.map((image: string) => {
          return image.replace('w=1', 'w=9').replace('h=1', 'h=9');
        });
      }

      if (responseImagesResolve && responseData.images) {
        responseImagesResolve(responseData.images);
        resetFunctionsResponseImages();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const resetFunctionsResponseImages = () => {
    setResponseImagesResolve(undefined);
    setResponseImagesReject(undefined);
  };

  const startImageProcessing = async () => {
    await sleep(500);

    webviewSession?.injectJavaScript(ScriptStartCreateImages(message));
  };

  useImperativeHandle(ref, () => ({
    getImages: (currentMessage: string) => {
      return new Promise(async (resolve, reject) => {
        resetFunctionsResponseImages();

        setResponseImagesResolve(() => (value: any) => resolve(value));
        setResponseImagesReject(() => (value: any) => reject(value));

        setMessage(currentMessage);
      });
    },
  }));

  return (
    <View>
      <Modal
        presentationStyle="pageSheet"
        animationType="slide"
        visible={loggiEnabled}
        style={{ zIndex: 1100 }}
        statusBarTranslucent={true}
        onRequestClose={() => {
          setLoggiEnabled(false);
          setMessage('');
          if (responseImagesReject) responseImagesReject({ error: 'Error cancel login' });
        }}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Login Bing</Text>
          <View style={styles.separator}></View>
          <WebApp
            setWebviewSession={setWebviewSession}
            loggiEnabled={loggiEnabled}
            styles={styles}
            startImageProcessing={startImageProcessing}
            setLoggiEnabled={setLoggiEnabled}
            responseImagesReject={responseImagesReject}
            userAgent={userAgent}
            originWhitelist={originWhitelist}
            messageRecived={messageRecived}
          />
        </View>
      </Modal>

      {message?.length > 0 && !loggiEnabled && (
        <View style={styles.displayNone}>
          <WebApp
            setWebviewSession={setWebviewSession}
            loggiEnabled={loggiEnabled}
            styles={styles}
            startImageProcessing={startImageProcessing}
            setLoggiEnabled={setLoggiEnabled}
            responseImagesReject={responseImagesReject}
            userAgent={userAgent}
            originWhitelist={originWhitelist}
            messageRecived={messageRecived}
          />
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    zIndex: 1000,
  },
  title: {
    paddingTop: 20,
    paddingBottom: 15,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#eee',
  },
  separator: {
    marginVertical: 0,
    height: 1,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  displayNone: {
    display: 'none',
  },
  container: {
    display: 'flex',
    flex: 1,
    backgroundColor: '#000',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

export default BingImageCreator;
