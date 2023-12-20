export const ScriptStartCreateImages = (message: string) => {
  return `  
  function ___setSearchText(text) {
    try {
      if (!document.querySelector('[name="q"]') || !window.location.href.startsWith('https://www.bing.com/images/create')) {
        setTimeout(() => {
          ___setSearchText(text);
        }, 500);
        return;
      }
  
      const textarea = document.querySelector('[name="q"]');
      var nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
      nativeTextAreaValueSetter.call(textarea, text);
      const event = new Event('input', { bubbles: true });
      textarea.dispatchEvent(event);
  
      setTimeout(() => {
        document.querySelector('#create_btn_c').click();
        ___setSearchText = () => {};
      }, 1000);
    } catch (error) {
      ___setSearchText(text);
    }
  }
  
  ___setSearchText('${message}');
  
  `;
};

export const ScriptGetImages = () => {
  return `
  var ___getImagesCount = 0;
  
  function ___getImages() {
    if (___getImagesCount > 160) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ errorGetImages: 'Timeout occurred' }));
      return;
    }

    if (document.querySelector('#girer')) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ errorGetImages: document.querySelector('#girer').innerText }));
    }

    if (!document.querySelectorAll('#gir_async img')?.length) {
      setTimeout(() => {
        ___getImagesCount++;
        ___getImages();
      }, 500);
      return;
    }

    const images = [];

    document.querySelectorAll('#gir_async img').forEach((img) => {
      if (img.src?.startsWith('https://th.bing.com/')) {
        images.push(img.src);
      }
    });

    window.ReactNativeWebView.postMessage(JSON.stringify({ images: images }));
  }

  ___getImages();
  `;
};

export const ScriptLogin = () => {
  return `function Login___() {
    if (document.querySelector('#create_btn_c')) {
      document.querySelector('#bic_signin a').click();
    } else {
      setTimeout(function () {
        Login___();
      }, 500);
    }
  }
  Login___();
  `;
};

export const ScriptIsLogged = () => {
  return `function getCookie__(name) {
    const value = '; ' + document.cookie;
    const parts = value.split('; ' + name + '=');
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  function __checkLogin() {
    if (document.querySelector('[name="q"]') && getCookie__('_U')) {
      clearInterval(___scriptIntervalCheckLogin);
      window.ReactNativeWebView.postMessage(JSON.stringify({ logged: true }));
    } else if(document.querySelector('[name="q"]') && !getCookie__('_U')){
      window.ReactNativeWebView.postMessage(JSON.stringify({ logged: false }));
    }
  }

  var ___scriptIntervalCheckLogin = setInterval(() => {
    __checkLogin();
  },500);

  `;
};

export const ScriptLogout = () => {
  return `function getCookie__(name) {
    const value = '; ' + document.cookie;
    const parts = value.split('; ' + name + '=');
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  const urlLogout = 'https://www.bing.com/fd/auth/signout?provider=windows_live_id&return_url=https%3a%2f%2fwww.bing.com%2fimages%2fcreate%3f&sig=' +
  String(getCookie__('_SS') + '')
    .split('=')[1]
    .split('&')[0];

  window.location.href = urlLogout;
`;
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
