require('./hmac.js')
require('./sha1.js')

const Base64 = require('./base64.js')
const Crypto = require('./crypto.js')

const suffixs = ['jpg', 'jpeg', 'png'];
const aliyunServer = 'https://file.qmxpower.com';

const getSuffix = function(imgName) {
  let infos = imgName.split('.')
  return infos[infos.length - 1];
}

const isSupportSuffix = function(imgName) {
  let suffixName = getSuffix(imgName);
  console.log(suffixName)

  return suffixs.find(item => suffixName === item) ? true : false
}

const getPolicyBase64 = function(maxSize) {
  let date = new Date();
  date.setHours(date.getHours() + 87600);

  let srcT = date.toISOString();
  const policyText = {
    "expiration": srcT, //设置该Policy的失效时间，超过这个失效时间之后，就没有办法通过这个policy上传文件了 
    "conditions": [
      ["content-length-range", 0, maxSize * 1024 * 1024] // 设置上传文件的大小限制,5mb
    ]
  };
  const policyBase64 = Base64.encode(JSON.stringify(policyText));

  return policyBase64;
}

const getSignature = function(policyBase64, accesskeysecret) {
  const accesskey = accesskeysecret;
  const bytes = Crypto.HMAC(Crypto.SHA1, policyBase64, accesskey, {
    asBytes: true
  });
  const signature = Crypto.util.bytesToBase64(bytes);

  return signature;
}

const getAccess = function(accessUrl, maxSize) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${accessUrl}/api/getSTS?filetype=image`,
      success: (res) => {
				console.log(res)
				if (res.statusCode !== 200 || !res.data) {
          console.log('授权失败')
          reject(res)
        } else {
					console.log('授权成功')
          let sts = res.data.sts
          let accesskeysecret = sts.accessKeySecret
          let policyBase64 = getPolicyBase64(maxSize)
          let returnData = {
            accessid: sts.accessKeyId,
            token: sts.stsToken,
            policyBase64,
            signature: getSignature(policyBase64, accesskeysecret)
          }
					console.log(returnData)
          resolve(returnData)
        }
      },
      fail: (err) => {
        console.log('授权失败')
        reject(err)
      }
    })
  })
}

const uploadImgs = function(count = 1, maxSize = 10, fileName = 'wechatuploadimg', successTip = '', accessUrl = 'https://admin.qmxpower.com') {

  return new Promise((success, fail) => {
    wx.chooseImage({
      count,
      success: nativeImgInfo => {
				console.log(nativeImgInfo)
        let tempFiles = nativeImgInfo.tempFiles;
				let tempFilePaths = nativeImgInfo.tempFilePaths;
        let suffixSupport = true;
        let imgsTotalSize = 0;

        tempFiles.forEach(tempFile => {
          console.log(tempFile)
          console.log(isSupportSuffix(tempFile.path))
          if (suffixSupport && !isSupportSuffix(tempFile.path)) {
            suffixSupport = false
          }

          imgsTotalSize += tempFile.size
        })

        if (!suffixSupport) {
          fail({
            tip: {
              type: 'suffix',
              tip: '不支持所选（部分）图片格式',
              suffixs
            }
          })
        } else if (imgsTotalSize > maxSize * 1024 * 1024) {
          wx.showModal({
            title: '上传失败',
            content: `图片过大，上传失败，请上传${maxSize}M以内的图片`,
            showCancel: false
          })
          fail({
            tip: {
              type: 'size',
              tip: '所选图片大小超过最大值',
              imgsSize: (imgsTotalSize / 1024 / 1024).toFixed(2),
              maxSize
            }
          })
        } else {
          getAccess(accessUrl, maxSize).then(access => {
						console.log(access)
            wx.showToast({
							title: '图片上传中，请稍后',
							icon: 'none',
							duration: 1000 * 10,
              mark: true
            })
            let urls = [];
            let successNum = 0;
            let failNum = 0;

						let uploadPromises = tempFilePaths.map(path => {
							console.log(path)
              let name = fileName + new Date().getTime()
              let nameWidthSuffix = `${name}.${getSuffix(path)}`
							console.log(`image/${nameWidthSuffix}`)
              return new Promise((resolve, reject) => {
                wx.uploadFile({
                  url: aliyunServer,
                  filePath: path,
									name: 'file',
                  formData: {
                    'key': `image/${nameWidthSuffix}`,
                    'policy': access.policyBase64,
                    'OSSAccessKeyId': access.accessid,
                    'signature': access.signature,
                    'success_action_status': '200',
                    'x-oss-security-token': access.token
                  },
                  success: res => {
										console.log(res)
                    if (res.statusCode === 200) {
											console.log('上传成功')
                      ++successNum;
                      urls.push(`${aliyunServer}/image/${nameWidthSuffix}`)
											resolve()
                    } else {
											console.log('上传失败')
                      ++failNum;
											reject()
                    }
                  },
                  fail: (err) => {
										console.log(err)
										console.log('上传失败 ')
                    ++failNum;
										reject()
                  }
                })
              })

            })

            Promise.all(uploadPromises).then(() => {
							wx.hideToast()
							console.log('所有图片上传完成')
              if (!!successTip) {
                wx.showToast({
                  title: successTip,
                  mask: true,
									duration: 2000
                })
              }
              success({
                data: {
                  urls,
                  successNum,
                  failNum
                }
              })
            }).catch(err => {
							wx.hideToast()
							console.log('上传完成，全部或部分上传失败')
              fail({
                tip: {
                  type: 'uploadFial',
                  tip: '全部/部分图片上传失败'
                },
                data: {
                  urls,
                  successNum,
                  failNum
                }
              })
            })

          })
        }

      },
      fail: err => {
        console.log(err)
        fail({
          tip: {
            type: 'chooseImgFail',
            tip: '从相册选取图片失败',
            errMessage: err
          }
        })
      }
    })
  })
}

module.exports = {
  uploadImgs
}