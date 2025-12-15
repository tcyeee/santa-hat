import { initCloud } from "./apis/http";

App({
  onLaunch: function () {
    initCloud();
  },
});
