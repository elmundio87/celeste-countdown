/* eslint-disable react/prop-types */
'use strict'

var $
var React
var ReactDOM

const e = React.createElement

let upcomingTimes = []

// Apply LZW-compression to a string and return base64 compressed string.
function zip (s) {
  try {
    var dict = {}
    var data = (s + '').split('')
    var out = []
    var currChar
    var phrase = data[0]
    var code = 256
    for (var i = 1; i < data.length; i++) {
      currChar = data[i]
      if (dict[phrase + currChar] != null) {
        phrase += currChar
      } else {
        out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0))
        dict[phrase + currChar] = code
        code++
        phrase = currChar
      }
    }
    out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0))
    for (var j = 0; j < out.length; j++) {
      out[j] = String.fromCharCode(out[j])
    }
    return utoa(out.join(''))
  } catch (e) {
    console.log('Failed to zip string return empty string', e)
    return ''
  }
}

// Decompress an LZW-encoded base64 string
function unzip (base64ZippedString) {
  try {
    var s = atou(base64ZippedString)
    var dict = {}
    var data = (s + '').split('')
    var currChar = data[0]
    var oldPhrase = currChar
    var out = [currChar]
    var code = 256
    var phrase
    for (var i = 1; i < data.length; i++) {
      var currCode = data[i].charCodeAt(0)
      if (currCode < 256) {
        phrase = data[i]
      } else {
        phrase = dict[currCode] ? dict[currCode] : oldPhrase + currChar
      }
      out.push(phrase)
      currChar = phrase.charAt(0)
      dict[code] = oldPhrase + currChar
      code++
      oldPhrase = phrase
    }
    return out.join('')
  } catch (e) {
    console.log('Failed to unzip string return empty string', e)
    return ''
  }
}

// ucs-2 string to base64 encoded ascii
function utoa (str) {
  return window.btoa(unescape(encodeURIComponent(str)))
}
// base64 encoded ascii to ucs-2 string
function atou (str) {
  return decodeURIComponent(escape(window.atob(str)))
}

const getCompressedState = (upcomingTimes) => {
  var upcomingTimesDiff = [upcomingTimes[0]]
  for (var i = 1; i < upcomingTimes.length; i++) {
    upcomingTimesDiff.push((upcomingTimes[i] - upcomingTimes[i - 1]) / 1000)
  }
  return zip(JSON.stringify(upcomingTimesDiff))
}

const getUncompressedState = (compressed) => {
  var uncompressed = JSON.parse(unzip(compressed))
  var upcomingTimes = [uncompressed[0]]
  for (var i = 1; i < uncompressed.length; i++) {
    upcomingTimes.push((uncompressed[i] + upcomingTimes[i - 1]) * 1000)
  }
  return upcomingTimes
}

function getParameterByName (name) {
  var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search)
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '))
}

function zeroPad(num, places) {
  var zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num;
}

const msToHMS = (duration) => {
  let seconds = parseInt((duration / 1000) % 60)
  let minutes = parseInt((duration / (1000 * 60)) % 60)
  let hours = parseInt((duration / (1000 * 60 * 60)) % 24)

  hours = (hours < 10) ? '0' + hours : hours
  minutes = (minutes < 10) ? '0' + minutes : minutes
  seconds = (seconds < 10) ? '0' + seconds : seconds

  return [hours, minutes, seconds].join(':')
}

const addTimeToList = (time) => {
  const timeSplit = time.split(':')
  const timeDate = new Date()
  const today = new Date()
  timeDate.setHours(timeSplit[0])
  timeDate.setMinutes(timeSplit[1])
  timeDate.setSeconds(timeSplit[2])

  if (timeSplit[0] < 5 && today.getHours() >= 5) {
    timeDate.setDate(timeDate.getDate() + 1)
  }

  if (timeSplit[0] > 5 && today.getHours() < 5) {
    timeDate.setDate(timeDate.getDate() - 1)
  }

  upcomingTimes.push(timeDate.getTime())
}

const parseShootingStarData = (lines) => {
  var times
  var i, j
  for (i = 0; i < lines.length; i++) {
    if (lines[i].replace(/ /g, '').startsWith('🌠')) {
      var line = lines[i].replace('🌠', '').replace(/ /g, '')
      if (line.includes('-')) { // New Meteonook format in rewrite
        times = line.replace('-', ',').split(',')
        for (j = 1; j < times.length; j++) {
          addTimeToList(times[0] + times[j])
        }
      } else {
        times = line.split(',')
        for (j = 0; j < times.length; j++) {
          addTimeToList(times[j])
        }
      }
    }
  }
}

window.addEventListener('popstate', (event) => {
  if (event.state === null) {
    window.location.reload(false)
  } else {
    main(event.state)
  }
})

window.addEventListener('load', (event) => {
  const state = getParameterByName('state')
  if (state) {
    main(state)
  }
})

// eslint-disable-next-line no-unused-vars
const main = (state) => {
  if (state) {
    if (typeof state === 'string') {
      upcomingTimes = getUncompressedState(state)
    } else {
      upcomingTimes = state
    }
  } else {
    const lines = $('textarea').val().split('\n')
    parseShootingStarData(lines)
    const stateUrl = window.location.href + '?state=' + zip(utoa(JSON.stringify(upcomingTimes)))
    history.pushState(getCompressedState(upcomingTimes), event.target.textContent, stateUrl)
  }

  window.setInterval(() => {
    countdown()
  }, 500)

  $('#data').hide()
  $('#countdown').show()
  $('#upcoming').show()
}

const getTodayWithOffset = (offset) => {
  const tempToday = new Date()
  if (isNaN(offset)) {
    offset = 0
  }
  return new Date(tempToday.getTime() + (offset * 1000))
}

const meteorExpired = (time, offset) => {
  return getTimeDifference(time, offset) <= 0
}

const getTimeDifference = (nextTime, offset) => {
  const today = getTodayWithOffset(offset)
  return (nextTime - today.getTime()) / 1000
}

const countdown = () => {
  ReactDOM.render(
    e(Clock, { times: upcomingTimes }),
    document.querySelector('#clock')
  )
  ReactDOM.render(
    e(UpcomingShootingStar, { times: upcomingTimes }),
    document.querySelector('#upcoming ol')
  )
}

class Clock extends React.Component {
  render () {
    const upcomingTimes = this.props.times
    const offset = $('#time_offset').val()
    for (var i = 0; i < upcomingTimes.length; i++) {
      if (!meteorExpired(upcomingTimes[i], offset)) {
        const timeDifference = getTimeDifference(upcomingTimes[i], offset)
        return msToHMS(Math.round(Math.abs(timeDifference)) * 1000)
      }
    }
    return '00:00:00'
  }
}

class UpcomingShootingStar extends React.Component {
  render () {
    const times = this.props.times
    const offset = $('#time_offset').val()
    const tempTimes = times.filter((currentValue) => {
      const timeDifference = getTimeDifference(currentValue, offset)
      return timeDifference > 0
    })

    if (tempTimes.length === 0) {
      return (
        <li>
          No more shooting stars!
        </li>
      )
    }

    return tempTimes.map((currentValue) => {
      var time = new Date(currentValue)
      var timeString = zeroPad(time.getHours(), 2) + ':' + zeroPad(time.getMinutes(), 2) + ':' + zeroPad(time.getSeconds(), 2)
      return <li key={currentValue}>
        { timeString } ({ Math.round(Math.abs(getTimeDifference(currentValue, offset))) }s)
      </li>
    })
  }
}
