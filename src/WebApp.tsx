import React from 'react';
import WebView from 'react-native-webview';

export interface WebAppProps {
  currentUri: string;
  setCurrentUri: any;
  setWebviewSession: any;
  loggiEnabled: any;
  styles: any;
  startImageProcessing: any;
  setLoggiEnabled: any;
  responseImagesReject: any;
  userAgent: any;
  originWhitelist: any;
  messageRecived: any;
}

export function WebApp({
  currentUri,
  setCurrentUri,
  setWebviewSession,
  loggiEnabled,
  styles,
  startImageProcessing,
  setLoggiEnabled,
  responseImagesReject,
  userAgent,
  originWhitelist,
  messageRecived,
}: Readonly<WebAppProps>) {
  return (
    <WebView
      startInLoadingState={false}
      ref={setWebviewSession}
      style={loggiEnabled ? styles.container : undefined}
      source={{
        uri: currentUri || `https://www.bing.com/images/create/`,
      }}
      onLoadEnd={() => startImageProcessing()}
      onNavigationStateChange={(event) => {
        if (event.url.startsWith('https://login.live.com/')) {
          setCurrentUri(event.url);
          setLoggiEnabled(true);
        } else {
          setCurrentUri('');
          setLoggiEnabled(false);
        }
      }}
      onError={() => {
        if (responseImagesReject) responseImagesReject({ error: 'Error on https://www.bing.com/images/create/' });
      }}
      javaScriptEnabled={true}
      userAgent={userAgent}
      originWhitelist={originWhitelist}
      onMessage={messageRecived}
    />
  );
}
