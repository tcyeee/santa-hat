Page({
  data: {
    avatarUrl: "",
    defaultAvatar: "https://dummyimage.com/200x200/ededed/999999&text=Avatar",
    hasAvatar: false,
    hatAdded: false,
    hatLoading: false,
  },
  
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail || {};
    if (avatarUrl) {
      this.setData({
        avatarUrl,
        hasAvatar: true,
        hatAdded: false,
        hatLoading: false,
      });
    }
  },

  onAddHat() {
    if (this.data.hatLoading) return;

    this.setData({
      hatLoading: true,
      hatAdded: false,
    });

    // TODO: 在此处替换为真实的圣诞帽生成逻辑（耗时操作）
    this.hatTimer = setTimeout(() => {
      this.setData({
        hatLoading: false,
        hatAdded: true,
      });
    }, 3000);
  },

  onDownload() {
    const { avatarUrl, hatAdded, hatLoading } = this.data;
    if (!avatarUrl) {
      wx.showToast({ title: "请先选择头像", icon: "none" });
      return;
    }
    if (hatLoading) {
      wx.showToast({ title: "生成中，请稍候", icon: "none" });
      return;
    }
    if (!hatAdded) {
      wx.showToast({ title: "请先添加圣诞帽", icon: "none" });
      return;
    }

    wx.showLoading({ title: "保存中..." });
    wx.getImageInfo({
      src: avatarUrl,
      success: (info) => {
        wx.saveImageToPhotosAlbum({
          filePath: info.path,
          success: () => {
            wx.showToast({ title: "已保存到相册", icon: "success" });
          },
          fail: (err) => {
            const msg = err?.errMsg?.includes("auth deny")
              ? "请在设置中允许保存到相册"
              : "保存失败，请重试";
            wx.showToast({ title: msg, icon: "none" });
          },
          complete: () => wx.hideLoading(),
        });
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: "图片获取失败", icon: "none" });
      },
    });
  },

  onShareAppMessage() {
    return {
      title: "画个圣诞帽",
      path: "/pages/index/index",
    };
  },

  onUnload() {
    if (this.hatTimer) {
      clearTimeout(this.hatTimer);
      this.hatTimer = null;
    }
  },
});
