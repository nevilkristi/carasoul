let JSZipUtils = {};
JSZipUtils._getBinaryFromXHR = function (xhr) {
  return xhr.response || xhr.responseText;
};

function createStandardXHR() {
  try {
    return new window.XMLHttpRequest();
  } catch (e) {}
}

function createActiveXHR() {
  try {
    return new window.ActiveXObject("Microsoft.XMLHTTP");
  } catch (e) {}
}

let createXHR =
  typeof window !== "undefined" && window.ActiveXObject
    ? function () {
        return createStandardXHR() || createActiveXHR();
      }
    : createStandardXHR;

/**
 * @param  {string} path    The path to the resource to GET.
 * @param  {function|{callback: function, progress: function}} options
 * @return {Promise|undefined} If no callback is passed then a promise is returned
 */
JSZipUtils.getBinaryContent = function (path, options) {
  let promise, resolve, reject;
  let callback;

  if (!options) {
    options = {};
  }

  if (typeof options === "function") {
    callback = options;
    options = {};
  } else if (typeof options.callback === "function") {
    callback = options.callback;
  }

  if (!callback && typeof Promise !== "undefined") {
    promise = new Promise(function (_resolve, _reject) {
      resolve = _resolve;
      reject = _reject;
    });
  } else {
    resolve = function (data) {
      callback(null, data);
    };
    reject = function (err) {
      callback(err, null);
    };
  }

  try {
    let xhr = createXHR();

    xhr.open("GET", path, true);

    // recent browsers
    if ("responseType" in xhr) {
      xhr.responseType = "arraybuffer";
    }

    // older browser
    if (xhr.overrideMimeType) {
      xhr.overrideMimeType("text/plain; charset=x-user-defined");
    }

    xhr.onreadystatechange = function (event) {
      // use `xhr` and not `this`... thanks IE
      if (xhr.readyState === 4) {
        if (xhr.status === 200 || xhr.status === 0) {
          try {
            resolve(JSZipUtils._getBinaryFromXHR(xhr));
          } catch (err) {
            reject(new Error(err));
          }
        } else {
          reject(
            new Error(
              "Ajax error for " +
                path +
                " : " +
                this.status +
                " " +
                this.statusText
            )
          );
        }
      }
    };

    if (options.progress) {
      xhr.onprogress = function (e) {
        options.progress({
          path: path,
          originalEvent: e,
          percent: (e.loaded / e.total) * 100,
          loaded: e.loaded,
          total: e.total,
        });
      };
    }

    xhr.send();
  } catch (e) {
    reject(new Error(e), null);
  }

  // returns a promise or undefined depending on whether a callback was
  // provided
  return promise;
};

// export
export default JSZipUtils;
