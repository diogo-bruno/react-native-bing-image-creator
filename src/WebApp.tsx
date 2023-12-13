import React from 'react';
import WebView from 'react-native-webview';

export interface WebAppProps {
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
        uri: `https://www.bing.com/images/create/?${new Date().getTime()}`,
      }}
      onLoadEnd={() => startImageProcessing()}
      onNavigationStateChange={(event) => {
        console.log(event.url);
        if (event.url.startsWith('https://login.live.com/')) {
          setLoggiEnabled(true);
        } else {
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
