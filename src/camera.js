/**
 * Created by xiaobxia on 2017/8/17.
 */
(function () {
  //判断ie的版本
  const SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
  const MOZ_HACK_REGEXP = /^moz([A-Z])/;
  const ieVersion = new Number(document.documentMode);
  //驼峰
  const camelCase = function (name) {
    return name.replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
      return offset ? letter.toUpperCase() : letter;
    }).replace(MOZ_HACK_REGEXP, 'Moz$1');
  };
  const getStyle = ieVersion < 9 ? function (element, styleName) {
    if (!element || !styleName) return null;
    styleName = camelCase(styleName);
    if (styleName === 'float') {
      styleName = 'styleFloat';
    }
    try {
      switch (styleName) {
        case 'opacity':
          try {
            return element.filters.item('alpha').opacity / 100;
          } catch (e) {
            return 1.0;
          }
        default:
          if (window.getComputedStyle) {
            //在浏览器中返回关联document的window对象，如果没有则返回null
            let view = element.ownerDocument.defaultView;

            if (!view || !view.opener) {
              view = window;
            }
            return view.getComputedStyle(element)[styleName];
          } else {
            return (element.style[styleName] || element.currentStyle ? element.currentStyle[styleName] : null);
          }
      }
    } catch (e) {
      return element.style[styleName];
    }
  } : function (element, styleName) {
    if (!element || !styleName) return null;
    styleName = camelCase(styleName);
    if (styleName === 'float') {
      styleName = 'cssFloat';
    }
    try {
      const computed = document.defaultView.getComputedStyle(element, '');
      return element.style[styleName] || computed ? computed[styleName] : null;
    } catch (e) {
      return element.style[styleName];
    }
  };
  class Camera {
    constructor(id) {
      this.$el = document.getElementById(id);
      this.mediaStreamTrack = null;
      this.imageSrcList = [];
    }

    /*-------------------------  自身方法  -------------------------*/
    init(success, error) {
      const windowUrl = this.windowUrl();
      const getUserMedia = this.getUserMedia();
      const errorCallback = (err) => {
        console.log(err);
        error && error(err);
      };
      const successCallback = (stream) => {
        this.mediaStreamTrack = stream.getTracks()[0];
        this.$el.src = windowUrl.createObjectURL(stream);
        success && success();
      };
      try {
        getUserMedia({video: true}, successCallback, errorCallback);
      } catch (err) {
        getUserMedia('video', successCallback, errorCallback);
      }
    }

    destroy() {
      this.mediaStreamTrack && this.mediaStreamTrack.stop();
      this.$el.src = '';
      //防止报错
      let self = this;
      self = null;
    }

    /*-------------------------  拍摄方法  -------------------------*/
    shoot(option, callback) {
      const $el = this.$el;
      const x = option.x || 0;
      const y = option.y || 0;
      const width = option.width || getStyle($el, 'width').slice(0, -2);
      const height = option.height || getStyle($el, 'height').slice(0, -2);
      let canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage($el, x, y, +width, +height);
      const imageSrc = canvas.toDataURL("image/png");
      canvas = null;
      this.imageSrcList.push(imageSrc);
      callback && callback(imageSrc);
    }

    /*-------------------------  对外暴露的工具函数  -------------------------*/
    windowUrl() {
      return window.URL || window.webkitURL || window.msURL || window.oURL;
    }

    getUserMedia() {
      const fn = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
      return function (option, successCallback, errorCallback) {
        fn.call(navigator, option, successCallback, errorCallback);
      };
    }

    toCamelCase(str) {
      return camelCase(str);
    }

    getStyle(el, styleName) {
      return getStyle(el, styleName);
    }
  }
  if (typeof module !== 'undefined' && typeof exports === 'object') {
    module.exports = Camera;
  } else {
    window.Camera = Camera;
  }
})();
