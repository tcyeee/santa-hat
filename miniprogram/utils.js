export function imageToBase64(filePath, mimeType = "image/png") {
  return new Promise((resolve, reject) => {
    if (!filePath) {
      reject(new Error("empty file path"));
      return;
    }

    const fs = wx.getFileSystemManager();
    fs.readFile({
      filePath,
      encoding: "base64",
      success: (res) => {
        const dataURL = `data:${mimeType};base64,${res.data}`;
        resolve(dataURL);
      },
      fail: (err) => {
        reject(new Error("failed to read image file"));
      },
    });
  });
}