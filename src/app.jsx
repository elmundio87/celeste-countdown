/* eslint-disable react/prop-types */
'use strict'

var $
var React
var ReactDOM

const e = React.createElement

const upcomingTimes = []

// Remove element at the given index
// eslint-disable-next-line no-extend-native
Array.prototype.remove = function (index) {
  this.splice(index, 1)
}

function msToHMS (duration) {
  let seconds = parseInt((duration / 1000) % 60)
  let minutes = parseInt((duration / (1000 * 60)) % 60)
  let hours = parseInt((duration / (1000 * 60 * 60)) % 24)

  hours = (hours < 10) ? '0' + hours : hours
  minutes = (minutes < 10) ? '0' + minutes : minutes
  seconds = (seconds < 10) ? '0' + seconds : seconds

  return [hours, minutes, seconds].join(':')
}

// eslint-disable-next-line no-unused-vars
const main = () => {
  const lines = $('textarea').val().split('\n')
  const offset = $('#time_offset').val()
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('🌠')) {
      var line = lines[i].replace('🌠 ', '')
      var times = line.split(', ')
      for (var j = 0; j < times.length; j++) {
        if (!(meteorExpired(times[j], offset))) {
          upcomingTimes.push(times[j])
        }
      }
    }
  }

  window.setInterval(function () {
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
  const nextTimeSplit = nextTime.split(':')
  const today = getTodayWithOffset(offset)
  const nextTimeDate = new Date()
  nextTimeDate.setHours(nextTimeSplit[0])
  nextTimeDate.setMinutes(nextTimeSplit[1])
  nextTimeDate.setSeconds(nextTimeSplit[2])

  return (nextTimeDate.getTime() - today.getTime()) / 1000
}

const countdown = () => {
  let timeDifference = 0
  const offset = $('#time_offset').val()
  if (upcomingTimes.length > 0) {
    timeDifference = getTimeDifference(upcomingTimes[0], offset)
    if (timeDifference <= 0) {
      upcomingTimes.remove(0)
    }
  }
  ReactDOM.render(
    e(Clock, { time: timeDifference }),
    document.querySelector('#clock')
  )
  ReactDOM.render(
    e(UpcomingShootingStar, { times: upcomingTimes }),
    document.querySelector('#upcoming ol')
  )
}

class Clock extends React.Component {
  render () {
    return msToHMS(Math.round(Math.abs(this.props.time)) * 1000)
  }
}

class UpcomingShootingStar extends React.Component {
  render () {
    const times = this.props.times
    const offset = $('#time_offset').val()
    let list = []
    if (times.length > 0) {
      list = times.map(function (currentValue) {
        return <li key={currentValue}>
          { currentValue } ({ Math.round(Math.abs(getTimeDifference(currentValue, offset))) }s)
        </li>
      })
    } else {
      list = (
        <li>
          No more shooting stars!
        </li>
      )
    }
    return list
  }
}
