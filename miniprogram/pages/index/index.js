import { avatarHandler } from "../../apis/http";
import { imageToBase64 } from "../../utils";

Page({
  data: {
    avatarUrl: "",
    defaultAvatar: "https://dummyimage.com/200x200/ededed/999999&text=Avatar",
    status: "NONE",
  },

  STATUS: {
    NONE: "NONE",
    HAS_AVATAR: "HAS_AVATAR",
    GENERATING: "GENERATING",
    GENERATED: "GENERATED",
  },

  setStatus(status, extra = {}) {
    this.setData({ status, ...extra });
  },

  onChooseAvatar(e) {
    const { avatarUrl } = e.detail || {};
    if (!avatarUrl) return;
    this.setStatus(this.STATUS.HAS_AVATAR, { avatarUrl });
  },

  async onAddHat() {
    const { STATUS } = this;
    if (this.data.status === STATUS.NONE) {
      wx.showToast({ title: "请先选择头像", icon: "none" });
      return;
    }
    if (this.data.status === STATUS.GENERATING) return;

    this.setStatus(this.STATUS.GENERATING);

    try {
      const avatarFileBase64 = await imageToBase64(this.data.avatarUrl);
      const result = await avatarHandler({ avatar: avatarFileBase64 });
      const resultImageUrl = result.data.output.choices[0].message.content[0].image
      console.log(resultImageUrl);
      this.setData({avatarUrl: resultImageUrl});
    } catch (error) {
      console.error(error);
      wx.showToast({ title: "生成失败，请重试", icon: "none" });
      this.setStatus(this.STATUS.HAS_AVATAR);
      return;
    }
    this.setStatus(this.STATUS.GENERATED);
  },

  onDownload() {
    const { avatarUrl, status } = this.data;
    const { STATUS } = this;

    if (!avatarUrl || status === STATUS.NONE) {
      wx.showToast({ title: "请先选择头像", icon: "none" });
      return;
    }
    if (status === STATUS.GENERATING) {
      wx.showToast({ title: "生成中，请稍候", icon: "none" });
      return;
    }
    if (status !== STATUS.GENERATED) {
      wx.showToast({ title: "请先添加圣诞帽", icon: "none" });
      return;
    }

    wx.showLoading({ title: "保存中..." });
    this.toLocalFile(avatarUrl)
      .then((filePath) => {
        wx.saveImageToPhotosAlbum({
          filePath,
          success: () => wx.showToast({ title: "已保存到相册", icon: "success" }),
          fail: (err) => {
            const msg = err?.errMsg?.includes("auth deny")
              ? "请在设置中允许保存到相册"
              : "保存失败，请重试";
            wx.showToast({ title: msg, icon: "none" });
          },
          complete: () => wx.hideLoading(),
        });
      })
      .catch(() => {
        wx.hideLoading();
        wx.showToast({ title: "图片获取失败", icon: "none" });
      });
  },

  onShareAppMessage() {
    return {
      title: "快看我的圣诞帽头像",
      path: "/pages/index/index?from=share",
      imageUrl: this.data.avatarUrl || this.data.defaultAvatar, // 如果已上传到云/CDN
    };
  },

  onRestart() {
    this.setStatus(this.STATUS.NONE, { avatarUrl: "" });
  },

  toLocalFile(src) {
    return new Promise((resolve, reject) => {
      if (!src) return reject(new Error("empty src"));

      // 已是本地/临时文件，直接返回
      if (!/^https?:\/\//.test(src)) {
        return resolve(src);
      }

      // 远程 http(s) 需先下载到本地后再保存，兼容手机端相册权限
      wx.downloadFile({
        url: src,
        success: (res) => {
          if (res.tempFilePath) {
            resolve(res.tempFilePath);
          } else {
            reject(new Error("download no tempFilePath"));
          }
        },
        fail: reject,
      });
    });
  },
});
