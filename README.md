# React Native Bing Image Creator IA

<div style="text-align: center">
<img src="https://github.com/diogo-bruno/react-native-bing-image-creator/assets/11491923/10d883f2-aa30-4434-b840-1e9d49d32924" width="550" />
</div>

<p style="text-align: center">
The "react-native-bing-image-creator" plugin provides an API with the real functionality of Bing Image Creator web. The user will log directly into Bing Image Creator
</p>

# Example

```ssh
npm install https://github.com/diogo-bruno/react-native-bing-image-creator.git
or
yarn add https://github.com/diogo-bruno/react-native-bing-image-creator.git
```

```javascript
import React from 'react';
import { Alert, Button, Image, StyleSheet, View } from 'react-native';
import BingImageCreator, { BingImageCreatorRef } from 'react-native-bing-image-creator';

export default function AppBingImageCreator() {
  const refBingImageCreator = React.useRef<BingImageCreatorRef>(null);

  const [images, setImages] = React.useState<string[]>();

  const getTextInput = async (): Promise<string> => {
    return new Promise((resolve) => {
      Alert.prompt('Search', 'Type something', [{ text: 'OK', onPress: (value) => resolve(`${value}`) }], 'plain-text');
    });
  };

  return (
    <View style={styles.container}>
      <BingImageCreator ref={refBingImageCreator} />

      <Button
        onPress={async () => {
          const search = await getTextInput();
          if (search) {
            const images = await refBingImageCreator.current?.getImages(`${search}`);
            setImages(images);
          }
        }}
        title="Create images"
      />

      {images && images.map((image) => <Image key={image} source={{ uri: image }} style={{ width: 100, height: 100 }} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```
