function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// each遍历，可使用 break
function each(arr, cb, newThis) {
	for(let i = 0; i < arr.length; i++) {
		let flag = cb.call(newThis || arr[i], arr[i], i, arr)
		if(flag === false) {
			break;
		}
	}
}

module.exports = {
  formatTime: formatTime,
	each: each
}
