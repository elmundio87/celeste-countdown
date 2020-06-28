var out_times = []

// Remove element at the given index
Array.prototype.remove = function(index) {
  this.splice(index, 1);
}

function msToHMS( duration ) {

  var milliseconds = parseInt((duration % 1000) / 100),
     seconds = parseInt((duration / 1000) % 60),
     minutes = parseInt((duration / (1000 * 60)) % 60),
     hours = parseInt((duration / (1000 * 60 * 60)) % 24);

   hours = (hours < 10) ? "0" + hours : hours;
   minutes = (minutes < 10) ? "0" + minutes : minutes;
   seconds = (seconds < 10) ? "0" + seconds : seconds;

   return hours + ":" + minutes + ":" + seconds ;
}

function main(){
  var lines = $('textarea').val().split('\n');
  for(var i = 0;i < lines.length;i++){
    if(lines[i].startsWith('🌠')){
      var line = lines[i].replace('🌠 ','')
      var times = line.split(', ')
      for(var j = 0;j < times.length;j++){
        if(!(meteorExpired(times[j]))){
          out_times.push(times[j])
        }
      }
    }
  }

  window.setInterval(function(){
    countdown()
  }, 500);

  $("#data").hide()
  $("#countdown").show()
  $("#upcoming").show()
}


function getTodayWithOffset(){
  var tempToday = new Date()
  var offset = $("#time_offset").val()
  if(isNaN(offset)){
    offset = 0
  }
  return new Date(tempToday.getTime() + (offset * 1000))
}

function meteorExpired(time){
  var timeSplit = time.split(':')

  var today = getTodayWithOffset()
  var nextTimeDate = new Date()
  nextTimeDate.setHours(timeSplit[0])
  nextTimeDate.setMinutes(timeSplit[1])
  nextTimeDate.setSeconds(timeSplit[2])

  return ((nextTimeDate.getTime() - today.getTime()) <= 0)
}

function getTimeDifference(nextTime, timeOffset) {
  var nextTimeSplit = nextTime.split(':')

  var today = getTodayWithOffset()
  var nextTimeDate = new Date()
  nextTimeDate.setHours(nextTimeSplit[0])
  nextTimeDate.setMinutes(nextTimeSplit[1])
  nextTimeDate.setSeconds(nextTimeSplit[2])

  return (nextTimeDate.getTime() - today.getTime() ) / 1000

}

function countdown(){
  var timeOffset = $("#time_offset").val()
  if(out_times.length > 0){
    time_difference = getTimeDifference(out_times[0])
    if(time_difference <= 0){
      out_times.remove(0)
      $('#clock').text("00:00:00")
    } else {
      $('#clock').text(msToHMS(Math.round(Math.abs(time_difference)) * 1000))
    }
    var list = out_times.map(function(currentValue){
      return "<li>" + currentValue + " (+" + Math.round(Math.abs(getTimeDifference(currentValue))) + "s)</li>"
    })
    $("#upcoming ol").html(list.join("\n"))
  } else {
    $("#upcoming ol").html("<li>No more shooting stars!</li>")
  }

}