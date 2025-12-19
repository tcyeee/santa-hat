import { initCloud } from "./apis/http";

App({
  onLaunch: function () {
    initCloud();
    this.checkForUpdate();
  },

checkForUpdate() {
  if (!wx.canIUse("getUpdateManager")) return;

  const updateManager = wx.getUpdateManager();

  updateManager.onCheckForUpdate((res) => {
    console.log("check update:", res.hasUpdate);
  });

  updateManager.onUpdateReady(() => {
    console.log("update ready");
    wx.showModal({
      title: "更新提示",
      content: "新版本已准备好，是否重启应用？",
      success: (res) => {
        if (res.confirm) {
          updateManager.applyUpdate();
        }
      },
    });
  });

  updateManager.onUpdateFailed(() => {
    console.error("update failed");
    wx.showModal({
      title: "更新失败",
      content: "新版本下载失败，请稍后再试",
      showCancel: false,
    });
  });
}
});
