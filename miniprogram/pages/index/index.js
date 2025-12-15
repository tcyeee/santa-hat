Page({
  data: {
    avatarUrl: "",
    defaultAvatar: "https://dummyimage.com/200x200/ededed/999999&text=Avatar",
    hasAvatar: false,
    hatAdded: false,
  },
  
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail || {};
    if (avatarUrl) {
      this.setData({
        avatarUrl,
        hasAvatar: true,
        hatAdded: false,
      });
    }
  },

  onAddHat() {
    // TODO: 在此处添加圣诞帽生成逻辑
    this.setData({ hatAdded: true });
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
});
