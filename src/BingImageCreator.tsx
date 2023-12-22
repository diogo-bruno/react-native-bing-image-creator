import React, { forwardRef, useImperativeHandle } from 'react';
import { Dimensions, Modal, Platform, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { JSONtryParse, ScriptGetImages, ScriptIsLogged, ScriptLogin, ScriptLogout, ScriptStartCreateImages, sleep } from './scripts';

export interface BingImageCreatorRef {
  getImages: (message: string) => Promise<{ error: boolean; message: string; images: string[] }>;
  isLogged: () => Promise<boolean>;
  loginBingMicrosoft: () => Promise<{ error: boolean; message: string }>;
  logoutBingMicrosoft: () => Promise<{ error: boolean; message: string }>;
}

interface BingImageCreatorProps {}

const originWhitelist = ['https://*'];
const userAgent =
  Platform.OS === 'ios'
    ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1.2 Mobile/15E148 Safari/604.1'
    : 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.5790.166 Mobile Safari/537.36';

const urlBingImageCreator = 'https://www.bing.com/images/create/';

const BingImageCreator = forwardRef((props: BingImageCreatorProps, ref: any) => {
  const [webviewSession, setWebviewSession] = React.useState<WebView | null>(null);

  const [webviewLogin, setWebviewLogin] = React.useState<WebView | null>(null);

  const [modalLogin, setModalLogin] = React.useState<boolean>(false);

  const [pageLoginVisible, setPageLoginVisible] = React.useState<boolean>(false);

  const [logged, setLogged] = React.useState<boolean>();

  const [responseImagesResolve, setResponseImagesResolve] = React.useState<(value: { error: boolean; message: string; images: string[] }) => void>();

  const [loginResolve, setLoginResolve] = React.useState<(value: any) => void>();

  const [logoutResolve, setLogoutResolve] = React.useState<(value: unknown) => void>();

  const [currentMessage, setCurrentMessage] = React.useState<string>('');

  const messageRecived = (event: any) => {
    try {
      const data = event.nativeEvent.data;
      const responseData = JSONtryParse(data);

      if (responseData) {
        if (responseData.logged === true) {
          setLogged(true);
          if (loginResolve) loginResolve({ error: false, message: 'Logged' });
          setModalLogin(false);
        } else if (responseData.logged === false) {
          setLogged(false);
          if (logoutResolve) logoutResolve({ error: false, message: 'Logout success' });
          //if (loginResolve) loginResolve({ error: true, message: 'Not Logged' });
        }

        if (responseImagesResolve && responseData.errorGetImages) {
          responseImagesResolve({ error: true, message: responseData.errorGetImages, images: [] });
          resetFunctionsResponseImages();
        }

        if (responseImagesResolve && responseData.images) {
          responseData.images = responseData.images.map((image: string) => {
            return image.replace('w=1', 'w=9').replace('h=1', 'h=9');
          });
          responseImagesResolve({ error: false, message: '', images: responseData.images });
          resetFunctionsResponseImages();
        }
      }
    } catch (error) {
      console.error(error);
      if (responseImagesResolve) {
        responseImagesResolve({ error: true, message: JSON.stringify(error), images: [] });
        resetFunctionsResponseImages();
      }
    }
  };

  const resetFunctionsResponseImages = () => {
    setResponseImagesResolve(undefined);
  };

  const getValueIsLogged = async () => {
    return new Promise((resolve) => {
      setLogged((currentValue) => {
        resolve(currentValue);
        return currentValue;
      });
    });
  };

  useImperativeHandle(ref, () => ({
    isLogged: () => {
      return new Promise(async (resolve) => {
        webviewSession?.requestFocus();

        while (!webviewSession || (await getValueIsLogged()) === undefined) {
          await sleep(500);
        }

        if (await getValueIsLogged()) resolve(true);
        else resolve(false);
      });
    },
    getImages: (message: string) => {
      return new Promise(async (resolve) => {
        while (!webviewSession) {
          await sleep(100);
        }

        resetFunctionsResponseImages();

        if (!(await getValueIsLogged())) {
          resolve({ error: true, message: 'Login required' });
          return;
        }

        webviewSession?.requestFocus();
        webviewSession?.injectJavaScript(`window.location.href = '${urlBingImageCreator}';`);

        setResponseImagesResolve(() => (value: any) => resolve(value));

        setCurrentMessage(message);
      });
    },
    loginBingMicrosoft: () => {
      return new Promise(async (resolve) => {
        while (!webviewSession) {
          await sleep(100);
        }

        if (await getValueIsLogged()) {
          resolve({ error: false, message: 'Already logged' });
          return;
        }

        if (webviewLogin) webviewLogin.reload();

        await sleep(500);

        setPageLoginVisible(false);

        setLoginResolve(() => (value: any) => resolve(value));

        setModalLogin(true);
      });
    },
    logoutBingMicrosoft: () => {
      return new Promise(async (resolve) => {
        while (!webviewSession) {
          await sleep(100);
        }

        if (!(await getValueIsLogged())) {
          resolve({ error: false, message: 'Already not logged' });
          return;
        }

        setLogoutResolve(() => (value: any) => resolve(value));

        if (webviewLogin) webviewLogin.reload();

        if (webviewLogin) webviewLogin.injectJavaScript(ScriptLogout());
        if (webviewSession) webviewSession.injectJavaScript(ScriptLogout());

        setTimeout(() => {
          setLogged(false);

          if (logoutResolve) logoutResolve({ error: false, message: 'Logout success' });
        }, 1500);
      });
    },
  }));

  return (
    <View>
      <Modal
        presentationStyle="pageSheet"
        animationType="slide"
        visible={modalLogin}
        style={{ zIndex: 1100 }}
        statusBarTranslucent={true}
        onRequestClose={() => {
          if (loginResolve) loginResolve({ error: true, message: 'Error cancel login' });
          setModalLogin(false);
        }}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Login Bing</Text>
          <View style={styles.separator}></View>
          <WebView
            startInLoadingState={true}
            ref={setWebviewLogin}
            style={pageLoginVisible ? styles.container : undefined}
            source={{ uri: urlBingImageCreator }}
            onLoadEnd={() => webviewLogin?.injectJavaScript(ScriptLogin())}
            onNavigationStateChange={(event) => {
              if (event.url.startsWith('https://login.live.com/')) {
                setTimeout(() => {
                  setPageLoginVisible(true);
                }, 500);
              } else {
                setPageLoginVisible(false);
              }

              webviewLogin?.injectJavaScript(ScriptIsLogged());
            }}
            onError={() => {
              if (loginResolve) loginResolve({ error: true, message: 'Error on Login https://www.bing.com/images/create/' });
            }}
            javaScriptEnabled={true}
            userAgent={userAgent}
            originWhitelist={originWhitelist}
            onMessage={messageRecived}
            webviewDebuggingEnabled={true}
          />
        </View>
      </Modal>

      <View style={styles.displayNone}>
        <WebView
          style={styles.container}
          startInLoadingState={false}
          ref={setWebviewSession}
          source={{ uri: urlBingImageCreator }}
          onLoadEnd={async () => {
            webviewSession?.injectJavaScript(ScriptIsLogged());

            if (responseImagesResolve && logged) {
              setCurrentMessage((message) => {
                webviewSession?.injectJavaScript(ScriptStartCreateImages(currentMessage ?? message));
                return message;
              });
              
              webviewSession?.injectJavaScript(ScriptGetImages());
            }
          }}
          onNavigationStateChange={async (event) => {}}
          onError={() => {
            if (responseImagesResolve) {
              responseImagesResolve({ error: true, message: 'Error on https://www.bing.com/images/create/', images: [] });
              resetFunctionsResponseImages();
            }
          }}
          javaScriptEnabled={true}
          userAgent={userAgent}
          originWhitelist={originWhitelist}
          onMessage={messageRecived}
          webviewDebuggingEnabled={true}
        />
      </View>
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
