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
      const res = await avatarHandler({ avatar: avatarFileBase64 });
      console.log(`[DEBUG]获取到头像地址: ${res.data}`);
      this.setData({ avatarUrl: res.data });
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
      .then((filePath) => this.normalizeImagePath(filePath))
      .then((filePath) => {

        wx.saveImageToPhotosAlbum({
          filePath,
          success: () =>
            wx.showToast({ title: "已保存到相册", icon: "success" }),
          fail: (err) => {
            console.error(err);
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

  toLocalFile(src) {
    return new Promise((resolve, reject) => {
      if (!src) return reject(new Error("empty src"));

      // 已是本地路径
      if (!/^https?:\/\//.test(src)) {
        resolve(src);
        return;
      }

      wx.downloadFile({
        url: src,
        success: (res) => {
          if (res.statusCode === 200 && res.tempFilePath) {
            resolve(res.tempFilePath);
          } else {
            reject(new Error(`download failed: ${res.statusCode}`));
          }
        },
        fail: reject,
      });
    });
  },

  // iOS 端保存相册需先通过 getImageInfo 获取有效的本地路径
  normalizeImagePath(filePath) {
    return new Promise((resolve) => {
      wx.getImageInfo({
        src: filePath,
        success: (res) => resolve(res.path || filePath),
        fail: () => resolve(filePath),
      });
    });
  },

  onShareAppMessage() {
    if (this.data.status !== this.STATUS.GENERATED) {
      return {
        title: "一键生成圣诞帽头像",
        path: "/pages/index/index?from=share_menu",
        imageUrl: "https://i.tcyeee.top/apps/santa/banner.png?v=1.0",
      };
    }

    return {
      title: "快看我的圣诞帽头像",
      path: "/pages/index/index?from=share",
      imageUrl: this.data.avatarUrl || this.data.defaultAvatar,
    };
  },

  onRestart() {
    this.setStatus(this.STATUS.NONE, { avatarUrl: "" });
  },
});
