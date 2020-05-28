var lastSelectedRow;
var trs;
var isMouseDown = false;
var days = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"];

$(document).ready(function () {
  $('#notifBar').hide();
  $("#messageSend").click(function () {
    sendMessage();
  });
  $(document).on('keyup', function (e) {
    if (e.which == 13) {
      sendMessage();
    }
  });

  function sendMessage() {
    var user_message = $.trim($("#userMessage").val());
    $("#userMessage").val("");
    $.ajax({
      type: "POST",
      url: "user_functions/sendMessage.php",
      data: { message: user_message },
      dataType: "text",
      success: function (data, status) {
        // alert(status + " : " + data);
        // console.log(data);
      },
      error: function (data, status) {
        alert(status + " : " + data);
        console.log(data);
      },
    });
  }

  $('#contentTime').hide();

  $("#timeIcon").click(function () {
    $("#locationIcon").css("width", "80%");
    $("#calendarIcon").css("width", "80%");
    getCurrentTimePrefs();
    $("#sideBarLocs").css("display", "none");
    $("#sideBarRequest").css("display", "none");
    $("#timeIcon").css("width", "100%");

    if ($('#openclose').text() == '>') {
      openclose('time');
    } else {
      $("#sideBarTimes").css("display", "inherit");
      $("#notifBar").text("Time Preferences");
    }
  });
  $("#locationIcon").click(function () {
    getCurrentLocPrefs();
    $("#timeIcon").css("width", "80%");
    $("#calendarIcon").css("width", "80%");
    $("#locationIcon").css("width", "100%");
    $("#sideBarTimes").css("display", "none");
    $("#sideBarRequest").css("display", "none");

    if ($('#openclose').text() == '>') {
      openclose('loc');
    } else {
      $("#sideBarLocs").css("display", "inherit");
      $("#notifBar").text("Location Preferences");
    }
  });
  $("#calendarIcon").click(function () {
    getMeetingReccs();
    $("#locationIcon").css("width", "80%");
    $("#timeIcon").css("width", "80%");
    $("#calendarIcon").css("width", "100%");
    $("#sideBarTimes").css("display", "none");
    $("#sideBarLocs").css("display", "none");
    if ($('#openclose').text() == '>') {
      openclose('cal');
    } else {
      $("#sideBarRequest").css("display", "inherit");
      $("#notifBar").text("Meetings");
    }
    retrieveMeetings(0);
    retrieveMeetings(1);
  });


  // $(".expand-close").click( function() {
  //     $(".notificationBar").css("display", "none");
  //     $(".content").css("display", "none");
  //     $(".tabs").css("display", "block");
  //     $(".arrow").html("&gt;");
  // });

  $("#addLocation").click(function () {
    var break_ = false;
    [...$(".locationSelector")].forEach(function (item, index) {
      if (item.value == "" && !break_) {
        alert("You must fill out all of the list items");
        break_ = true;
      }
    });
    if (break_) {
      return;
    }
    $.ajax({
      type: "POST",
      url: "user_functions/submitLocPreference.php",
      data: {
        locationOne: $("#locationOne").val(),
        locationTwo: $("#locationTwo").val(),
        locationThree: $("#locationThree").val(),
        locationFour: $("#locationFour").val(),
        locationFive: $("#locationFive").val()
      },
      error: function (data, status) {
        console.log(data);
        alert(status + " : " + data);
      }
    });
  });

  $("#requestMeeting").click(function () {
    $.ajax({
      type: "POST",
      url: "user_functions/requestMeeting.php",
      data: {
        meeting_time: $(" #timeSelect option:selected ").val(),
        meeting_location: $(" #locationSelect option:selected ").val()
      },
      error: function (data, status) {
        console.log(data);
        alert(status + " : " + data);
      }
    });
    retrieveMeetings(0);
    retrieveMeetings(1);
  });


  $(".chatBox").delay(500).animate({ scrollTop: $(".chatBox").prop("scrollHeight") }, "slow");

  trs = document.getElementById('timesTable').tBodies[0].getElementsByTagName('tr');

  $("#timesTable > tbody > tr").mousedown(function () { RowClick(this, false) })
    .mouseover(function () { RowOver(this, false) })
    .mouseup(function () { MouseUp(this, false) });

  $("#yesterdayTime").click(function () {
    submitCurrentTimePrefs();
    Yesterday(this);
    getCurrentTimePrefs();
  });
  $("#tomorrowTime").click(function () {
    submitCurrentTimePrefs();
    Tomorrow(this);
    getCurrentTimePrefs();
  });
  getCurrentTimePrefs();
  getCurrentLocPrefs();
});

function retrieveMeetings(confirmedInt) {
  $.ajax({
    type: "GET",
    url: "user_functions/getMeetings.php",
    dataType: "json",
    data: {
      confirmed: confirmedInt
    },
    success: function (data, status){
      var id = "";
      if (confirmedInt == 0) {
        id = "#proposedMeetings";
      } else {
        id = "#confirmedMeetings";
      }
      $(id).empty();
      var meetings = data.data;
      if (meetings.length == 0) {
        if (confirmedInt == 0) {
          $(id).text("There are no proposed meetings");
        } else {
          $(id).text("There are no confirmed meetings");
        }
      }
      else {
        var result = "";
        var template = "<form method='POST' action='user_functions/vote.php' target='meetingsFrame'>\
                          <input type='text' name='meeting_id' style='display: none;' value='";
        var template2 = "'>\
                          <input class='refreshMeetings' type='submit' name='yes' value='Yes'>\
                          <input class='refreshMeetings' type='submit' name='no' value='No'>\
                        </form>";
        if(confirmedInt == 1) {
        }
        for (var i = 0; i < meetings.length; i++) {
          result += meetings[i]["m_time"]
                + " " + meetings[i]["m_location"]
          if(confirmedInt == 0) {
            result += template + meetings[i]["m_id"] + template2
          }
          result += "<br>";
        }
        $(id).html(result);
      }
      if(confirmedInt == 0) {
        $(".refreshMeetings").click(function() {
          setTimeout(function() {
            retrieveMeetings(0);
            retrieveMeetings(1);
          }, 300);
        });
      }
    },
    error: function (data, status) {
      console.log(data);
      alert(status + " : " + data);
    }
  });
}

function submitCurrentTimePrefs() {
  var day = $("#day").text()
  day = day.substring(0, day.length - 1);
  var times = [];
  [...trs].forEach(function (item, index) {
    if (item.className != 'selected') {
      return;
    }
    var offset = 0;
    item = item.textContent;
    if (item.indexOf("PM") != -1 && item.substring(0, 2) != "12") {
      offset = 12
    }
    times.push((parseInt(item.substring(0, item.indexOf(":"))) + offset) * 100);
  });
  if (times.length == 0) {
    return;
  }
  $.ajax({
    type: "POST",
    url: "user_functions/submitTimePreference.php",
    dataType: "text",
    data: {
      p_day: day,
      p_times: times
    },
    error: function (data, status) {
      alert(status + " : " + data);
      console.log(data);
    }
  });
}

function getCurrentTimePrefs() {
  var day = $("#day").text()
  day = day.substring(0, day.length - 1);
  $.ajax({
    type: "GET",
    url: "user_functions/getDaysTimePrefs.php",
    dataType: "json",
    data: {
      p_day: day
    },
    success: function (data, status) {
      data.data.forEach(function (item, index) {
        var start = Math.round(parseInt(item.start_time) / 100);
        var end = Math.round(parseInt(item.end_time) / 100);
        while (start != end) {
          document.getElementById("timepref_" + start).parentElement.className = 'selected';
          start += 1;
        }
      });
    },
    error: function (data, status) {
      alert(status + " : " + data);
      console.log(data);
    }
  });
}

function getCurrentLocPrefs() {
  $.ajax({
    type: "GET",
    url: "user_functions/getLocPrefs.php",
    dataType: "json",
    data: {},
    success: function (data, status) {
      if(data.data.length == 0) {
        return;
      }
      $("#locationOne").val(data.data[0].loc);
      $("#locationTwo").val(data.data[1].loc);
      $("#locationThree").val(data.data[2].loc);
      $("#locationFour").val(data.data[3].loc);
      $("#locationFive").val(data.data[4].loc);
    },
    error: function (data, status) {
      alert(status + " : " + data);
      console.log(data);
    }
  });
}

function getMeetingReccs() {
  $.ajax({
    type: "GET",
    url: "user_functions/getMeetingRecommends.php",
    dataType: "json",
    success: function (data, status) {
      var new_locs = "";
      if(data.locs != undefined && data.locs.length != 0) {
        data.locs.forEach(function(item, index) {
          new_locs += "<option value = '" + item.loc + "'>" + item.loc + "</option>";
        })
      }
      var new_times = "";
      if(data.times != undefined && data.times.length != 0) {
        data.times.forEach(function(item, index) {
          item.time = "" + item.time;
          new_times += "<option value = 'day=" +
                          item.day + "&time=" + item.time + "'>"
                            + item.day + " " + item.time.slice(0, -2) + ":" + item.time.slice(-2);
                      + "</option>"
        })
      }
      $("#locationSelect").html(new_locs);
      $("#timeSelect").html(new_times);
    },
    error: function (data, status) {
      alert(status + " : " + data);
      console.log(data);
    }
  });
}

// ------  Notification banner  ------ //

let notification = {};

(function (notify) {


  notify.notice = function (content, opts) {

    opts = $.extend(true, {

      type: 'primary', //primary, secondary, success, danger, warning, info, light, dark
      appendType: 'append', //append, prepend
      closeBtn: false,
      autoClose: 80000, // If you want auto close
      className: '',

    }, opts);

    let $container = $('#alert-container-' + opts.position);
    if (!$container.length) {
      $container = $('<div id="alert-container-' + opts.position + '" class="alert-container"></div>');
      $('body').append($container);
    }

    let $el = $(`
      <div class="alert fade alert-${opts.type}" role="alert">${content}</div>
    `);

    if (opts.autoClose) {
      $el
        .append(`
          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        `)
        .addClass('alert-dismissible');
    }

    if (opts.autoClose) {

      let t = setTimeout(() => {
        $el.alert('close');
      }, opts.autoClose);

    }

    opts.appendType === 'append' ? $container.append($el) : $container.prepend($el);

    setTimeout(() => {
      $el.addClass('show');
    }, 50);

    return;

  };

})(notification);

function loadMessageLog(callback) {
  var old_height = $(".chatBox").prop("scrollHeight");
  $.ajax({
    type: "GET",
    url: "user_functions/loadMessages.php",
    dataType: "json",
    success: function (data, status) {
      var new_text = ""
      data.data.forEach(function (item, index) {
        new_text += "<div class='message'"
        if(data.users_name == item.name) {
          new_text += " style='float: left;'"
        }
        new_text += ">" + item.name + ": " + item.message + "</div>";
      });
      $(".chatBox").html(new_text);
      var new_height = $(".chatBox").prop("scrollHeight");
      if (new_height > old_height) {
        $(".chatBox").animate({ scrollTop: new_height }, "slow");
      }
      setTimeout(callback, 10);
    }
  });
}

function refreshTimeout() {
  loadMessageLog(function() {setTimeout(refreshTimeout, 1000);});
}

setTimeout(refreshTimeout, 1000);

// disable text selection
// document.onselectstart = function () {
//   return false;
// }

function RowClick(currenttr, lock) {

  if (window.event.ctrlKey) {
    toggleRow(currenttr);
    isMouseDown = true;
  }

  if (window.event.button === 0) {
    if (!window.event.ctrlKey && !window.event.shiftKey) {
      if (currenttr.className == 'selected') {
        clearAll();
      } else {
        clearAll();
        toggleRow(currenttr);
      }
      isMouseDown = true;
    }

    if (window.event.shiftKey) {
      selectRowsBetweenIndexes([lastSelectedRow.rowIndex, currenttr.rowIndex])
    }
  }
}

function RowOver(e, lock) {
  if (isMouseDown) {
    toggleRow(e);
  }
}

function MouseUp(e, lock) {
  isMouseDown = false;
}

function toggleRow(row) {
  row.className = row.className == 'selected' ? '' : 'selected';
  lastSelectedRow = row;
}

function selectRowsBetweenIndexes(indexes) {
  indexes.sort(function (a, b) {
    return a - b;
  });

  for (var i = indexes[0]; i <= indexes[1]; i++) {
    trs[i - 1].className = 'selected';
  }
}

function clearAll() {
  for (var i = 0; i < trs.length; i++) {
    trs[i].className = '';
  }
}

function Tomorrow(e) {
  var string = $('#day').text();
  var index = getIndex(string);
  if (index == 6) {
    $('#day').text(days[0]);
  } else {
    $('#day').text(days[index + 1]);
  }
  $('#day').css("width", "50%");
  clearAll();
}

function Yesterday(e) {
  var string = $('#day').text();
  var index = getIndex(string);
  if (index == 0) {
    $('#day').text(days[6]);
  } else {
    $('#day').text(days[index - 1]);
  }
  $('#day').css("width", "50%");

  clearAll();
}

function getIndex(query) {
  var ret = 0;
  var i = 0;
  days.forEach(function (item) {
    if (item == query) {
      ret = i;
    }
    i++;
  });
  return ret;
}

// function openNav() {
//   document.getElementById("mySidebar").style.width = "500px";
//   $('#openclose').text("&lt;");
//   document.getElementById("main").style.marginLeft = "20%";
// }
//
// function closeNav() {
//   document.getElementById("mySidebar").style.width = "20%";
//   $('#openclose').text("&gt;");
//   document.getElementById("main").style.marginLeft= "20%";
// }

function openclose(string) {
  var txt = $('#openclose').text();
  if (txt == '>') {
    // expand
    $('#openclose').css("margin-right", "2%");
    document.getElementById("mySidebar").style.width = "40%";
    $('#openclose').text('<');
    document.getElementById("main").style.marginLeft = "40%";
    setTimeout(function () {

      if (string == 'loc') {
        $("#sideBarLocs").css("display", "inherit");
        $("#notifBar").text("Location Preferences");
      } else if (string == 'cal') {
        $("#sideBarRequest").css("display", "inherit");
        $("#notifBar").text("Request a meeting");
      } else {
        $("#sideBarTimes").css("display", "inherit");
        $("#notifBar").text("Time Preferences");
        $("#timeIcon").css("width", "100%");

      }
      $('#notifBar').css("display", "inherit");
      $('#notifContainer').css("border", "1px solid black");

    }, 300);

  } else {
    $('#openclose').css("margin-right", "25%");
    document.getElementById("mySidebar").style.width = "5%";
    $('#openclose').text('>');
    document.getElementById("main").style.marginLeft = "5%";

    $("#sideBarTimes").css("display", "none");
    $("#sideBarLocs").css("display", "none");
    $("#sideBarRequest").css("display", "none");
    $('#notifBar').css("display", "none");
    $('#notifContainer').css("border", "none");

    $("#locationIcon").css("width", "80%");
    $("#timeIcon").css("width", "80%");
    $("#calendarIcon").css("width", "80%");



  }
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}
