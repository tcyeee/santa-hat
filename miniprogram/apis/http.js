export const avatarHandler = (params) => http("avatar-handler", params);

async function http(method, params) {
    return new Promise(async (resolve, reject) => {
        try {
            const result = await wx.cloud.callFunction({
                name: method,
                data: params,
            });
            resolve(result.result);
        } catch (error) {
            reject(error);
        }
    });
}


export function initCloud() {
    if (!wx.cloud) console.error("请使用 2.2.3 或以上的基础库以使用云能力");
    wx.cloud.init({
      env: "cloud1-5ghzdoth3beed018",
      traceUser: true,
    });
  }