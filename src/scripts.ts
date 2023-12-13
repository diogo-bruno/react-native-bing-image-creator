export const ScriptStartCreateImages = (message: string) => {
  return `function ___setSearchText(text) {
    if (!document.querySelector('[name="q"]')) {
      setTimeout(() => {
        ___setSearchText(text);
      });
      return;
    }
    const textarea = document.querySelector('[name="q"]');
    var nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
    nativeTextAreaValueSetter.call(textarea, '${message}');
    const event = new Event('input', { bubbles: true });
    textarea.dispatchEvent(event);
    setTimeout(() => {
      document.querySelector('#create_btn_c').click();
      ___setSearchText = () => {};
      ___getImages();
    }, 1000);
  }
  ___setSearchText('${message}');
  
  function ___getImages() {
    if (!document.querySelectorAll('#gir_async img').length) {
      setTimeout(() => {
        ___getImages();
      }, 500);
      return;
    }
    const images = [];
    document.querySelectorAll('#gir_async img').forEach((img) => {
      if (img.src.startsWith('https://th.bing.com/')) {
        images.push(img.src);
      }
    });
    window.ReactNativeWebView.postMessage(JSON.stringify({ images: images }));
  }
  `;
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
