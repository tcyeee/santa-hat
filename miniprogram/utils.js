export function readFileAsBase64(filePath) {
    return new Promise((resolve, reject) => {
      if (!filePath) return reject(new Error("empty file path"));
      const fs = wx.getFileSystemManager();
      fs.readFile({
        filePath,
        encoding: "base64",
        success: (res) => resolve(res.data),
        fail: reject,
      });
    });
  }