const cloudbase = require('@cloudbase/node-sdk')
const fs = require('fs')
const os = require('os')
const path = require('path')
const https = require('https')

const app = cloudbase.init({ env: process.env.CLOUD_ENV})

/**
 * 云函数入口
 */
exports.main = async (event, context, callback) => {
  try {
    const avatar = event.avatar;
    if (!avatar) throw new Error('avatar is required');
    
    // 大模型绘图
    const resultUrl = await generateImageByAvatar(avatar);

    // 上传到OSS
    uploadToOss(resultUrl)

    callback(null, { success: true,data: resultUrl});
  } catch (error) {
    callback(null, { success: false, message: error.message});
  }
};

/**
 * 业务方法：根据 avatar 调用大模型生成图片
 */
async function generateImageByAvatar(avatarUrl) {
  const payload = buildDashScopePayload(avatarUrl);
  const result = await callDashScopeAPI(payload);
  return result.output.choices[0].message.content[0].image;
}

/**
 * 构造 DashScope 请求体
 */
function buildDashScopePayload(avatarUrl) {
  return {
    model: 'qwen-image-edit-plus',
    input: {
      messages: [{
        role: 'user',
        content: [
          { image: avatarUrl },
          { text: process.env.PIC_PROMPT }
        ]
      }]
    },
    parameters: {
      n: 1,
      negative_prompt: ' ',
      prompt_extend: true,
      watermark: false
    }
  };
}

/**
 * 通用方法：调用 DashScope API
 */
async function callDashScopeAPI(payload) {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) throw new Error('DASHSCOPE_API_KEY is not set');

  const response = await fetch(process.env.DASHSCOPE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DashScope API error: ${errorText}`);
  }

  return await response.json();
}


// 上传图片到腾讯云OSS
async function uploadToOss(url){
  const tempFilePath = path.join(os.tmpdir(), `${Date.now()}.png`)
  // 1.下载到临时目录
  await downloadImage(url, tempFilePath)
  // 2.上传到云存储
 app.uploadFile({ cloudPath: `avatar_with_hat/${Date.now()}.png`, fileContent: fs.createReadStream(tempFilePath) })
}


// 使用 https 下载图片
function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath)

    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Download failed: ${res.statusCode}`))
          return
        }

        res.pipe(file)
        file.on('finish', () => {
          file.close(resolve)
        })
      })
      .on('error', (err) => {
        fs.unlink(outputPath, () => {})
        reject(err)
      })
  })
}