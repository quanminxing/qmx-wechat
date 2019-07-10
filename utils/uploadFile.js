const Base64 = require('./base64.js')
const Crypto = require('./crypto.js')
require('./hmac.js')
require('./sha1.js')

const uploadFiles = function(count = 1, maxSize, fileName = 'imgFile', successTip = '', uploadUrl = 'https://qmx-video.oss-cn-hangzhou.aliyuncs.com') {
  const suffixs = ['jpg', 'jpeg', 'png'];

  const getSuffix = function(name) {
    let info = name.split('.')
    return info[info.length - 1];
  }

  const isSupportSuffix = function(name) {
    let suffixName = getSuffix(name);
    console.log(suffixName)
    console.log(suffixs.find(item => {
      return suffixName === item
    }))
    return suffixs.find(item => {
      return suffixName === item
    }) ? true : false
  }
  

  return new Promise((resolve, reject) => {
    console.log(count)

    wx.chooseImage({
      count,
      success: function(res) {
        console.log(res)

        const uploadResult = function(successTip, successCallback) {

          const upload = function(url, files, name) {

            wx.showLoading({
              title: '图片上传中，请稍后',
              mark: true
            })

            return new Promise((resolve) => {
              let successData = [];
              let successNum = 0;
              let failNum = 0;
              let uploadName = name + new Date().getTime();
              let results = files.map(filePath => {
                console.log(filePath)
                let fileSuffix = getSuffix(filePath);
                return new Promise((resolve, reject) => {

                  wx.uploadFile({
                    url,
                    filePath,
                    name: 'file',
                    formData: {
                      key: `${uploadName}.${fileSuffix}`,
											policy: "eyJleHBpcmF0aW9uIjoiMjAyOS0wNi0xNlQxMDo0NDoxNi4zMTdaIiwiY29uZGl0aW9ucyI6W1siY29udGVudC1sZW5ndGgtcmFuZ2UiLDAsNTI0Mjg4MF1dfQ==",
											OSSAccessKeyId: "STS.NJjPNbitq7TNkBSf31bCi4u4K",
                      success_action_status: "200",
											signature: "sgYF8UeXFj5+B1fShEMnyNojS7A=",
                      file: filePath
                    },
                    success: function(res) {
                      if (res.statusCode === 200) {
                        console.log(res)
                          ++successNum;
                        successData.push(`https://file.qmxpower.com/image/${uploadName}.${getSuffix(filePath)}`)
                        resolve()
                      } else {
                        console.log(res)
                          ++failNum;
                        reject()
                      }
                    },
                    fail: function(err) {
                      console.log(err)
                        ++failNum;
                      reject(err)
                    }
                  })
                })
              })

              Promise.all(results).then(() => {
                wx.hideLoading()
                resolve({
                  data: {
                    successData,
                    successNum,
                    failNum
                  }
                })
              }).catch(err => {
                wx.hideLoading()
                resolve({
                  data: {
                    successData,
                    successNum,
                    failNum
                  },
                  tip: {
                    type: 'uploadError',
                    tip: '部分图片上传错误'
                  }
                })
              })
            })
          }

          upload(uploadUrl, res.tempFilePaths, fileName).then(result => {
            if (!!successTip) {
              wx.showToast({
                title: successTip,
                icon: 'success',
                mark: true
              })
              setTimeout(() => {
                wx.hideToast();
              }, 2000)
            }
            successCallback(result)
          })
        }

        let suffixName = '';
        let isSupport = true;
        let size = 0;
        let filesData = res.tempFiles;
        filesData.forEach(item => {
          size += item.size;
          if (isSupport) {
            isSupport = isSupportSuffix(item.path)
          }
        })

        if (!isSupport) {
          let supportSuffixs = suffixs.join('、')
          reject({
            tip: {
              type: 'suffix',
              tip: `文件格式不正确`,
              suffixs
            }
          })
        } else if (!!maxSize && size > maxSize) {
          reject({
            tip: {
              type: 'size',
              tips: `文件大小超过指定值`,
              size,
              maxSize
            }
          })
        } else {
          uploadResult(successTip, resolve)
        }

      },
      fail: function(err) {
        console.log(err)
        reject(err)
      }
    })
  })

}

module.exports = {
  uploadFiles
}