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
    // TODO: 替换为实际下载逻辑
    wx.showToast({ title: "下载中...", icon: "none" });
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
