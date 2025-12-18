import { initCloud } from "./apis/http";

App({
  onLaunch: function () {
    initCloud();
    this.checkForUpdate();
  },

  checkForUpdate() {
    if (!wx.canIUse || !wx.canIUse("getUpdateManager"))       return;

    const updateManager = wx.getUpdateManager();

    updateManager.onCheckForUpdate(() => {
      // 仅在有新版本时处理提示与更新
    });

    updateManager.onUpdateReady(() => {
      wx.showModal({
        title: "更新提示",
        content: "检测到新版本，是否重启并应用更新？",
        success: (res) => {
          if (res.confirm) {
            updateManager.applyUpdate();
          }
        },
      });
    });

    updateManager.onUpdateFailed(() => {
      wx.showModal({
        title: "更新失败",
        content: "新版本下载失败，请稍后重试",
        showCancel: false,
      });
    });
  },
});
