/* eslint-disable react/prop-types */
'use strict'

var $
var React
var ReactDOM

const e = React.createElement

const upcomingTimes = []

// Remove element at the given index
// eslint-disable-next-line no-extend-native
Array.prototype.remove = (index) => {
  this.splice(index, 1)
}

Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
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

// eslint-disable-next-line no-unused-vars
const main = () => {
  const lines = $('textarea').val().split('\n')
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('🌠')) {
      var line = lines[i].replace('🌠 ', '')
      var times = line.split(', ')
      for (var j = 0; j < times.length; j++) {
        upcomingTimes.push(times[j])
      }
    }
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
  const nextTimeSplit = nextTime.split(':')
  const today = getTodayWithOffset(offset)
  let nextTimeDate = new Date()
  nextTimeDate.setHours(nextTimeSplit[0])
  nextTimeDate.setMinutes(nextTimeSplit[1])
  nextTimeDate.setSeconds(nextTimeSplit[2])

  if (nextTimeSplit[0] <= 5) {
    nextTimeDate = nextTimeDate.addDays(1)
  }

  return (nextTimeDate.getTime() - today.getTime()) / 1000
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
      return <li key={currentValue}>
        { currentValue } ({ Math.round(Math.abs(getTimeDifference(currentValue, offset))) }s)
      </li>
    })
  }
}
