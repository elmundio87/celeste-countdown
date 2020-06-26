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

function go(){
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
    go2()
  }, 500);

  $("button").hide()
  $("textarea").hide()
}


function meteorExpired(time){
  var timeSplit = time.split(':')

  var today = new Date()
  var nextTimeDate = new Date()
  nextTimeDate.setHours(timeSplit[0])
  nextTimeDate.setMinutes(timeSplit[1])
  nextTimeDate.setSeconds(timeSplit[2])

  return ((nextTimeDate.getTime() - today.getTime()) <= 0)
}

function go2(){
  var nextTime = out_times[0]
  var nextTimeSplit = nextTime.split(':')

  var today = new Date()
  var nextTimeDate = new Date()
  nextTimeDate.setHours(nextTimeSplit[0])
  nextTimeDate.setMinutes(nextTimeSplit[1])
  nextTimeDate.setSeconds(nextTimeSplit[2])

  diff = (nextTimeDate.getTime() - today.getTime() ) / 1000

  if(diff <= 0){
    out_times.remove(0)
    $('#countdown').text("00:00:00")
  } else {
    $('#countdown').text(msToHMS(Math.round(Math.abs(diff)) * 1000))
  }

  $("#list").text(out_times.join("\n"))

}