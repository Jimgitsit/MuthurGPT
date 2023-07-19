var Console = {
  config: {
    typeInterval: 45
  },
  init: function init() {

  },
  addInputField: function addInputField() {
    Sounds.play('beep-user');
    $('#interactive').append('<input id="query" type="text" name="query" class="console-line" maxlength="100" autofocus />');
    $('#query').focus();
  },
  printText: function printText(target, message, index) {
    if (index < message.length) {
      $("#console-container").animate({
        scrollTop: $('#console-container').prop("scrollHeight")
      }, 1000);
      // stay scrolled to bottom of console

      var letter = message[index++];

      if (letter === '\\') {
        // if is new line, skip adding to message, add a new line, and increment over the next character "n"
        Sounds.play('beep-system');
        $(target).append('<div class="green-underline" style="margin-bottom: 1em;"></div>');
        message[index++];
      } else {
        $(target).append('<span class="materialize">' + letter + '</span>');
      }

      setTimeout(function() {
        Console.printText(target, message, index, Console.config.typeInterval);
      }, Console.config.typeInterval);

      Sounds.play('typing');
    } else {
      Helpers.answering = false;
      if (message !== 'thank you') {
        $(target).addClass('new-underline');
      }
    }
  },
  showWelcomeText: function showWelcomeText(userIp) {
    Sounds.play('beep-system');
    $('#hello').append('<div class="flash-container"> \
                          <span class="flash"></span> \
                        </div> \
                      ');
    Console.printText('#hello', 'Hello ' + userIp, 0);

    setTimeout(function() {
      Sounds.play('beep-system');
      $('#prompt').append('<div class="flash-container"> \
                              <span class="flash"></span> \
                          </div> \
                        ');
      Console.printText('#prompt', 'Enter query', 0);
    }, 2000);

    setTimeout(function() {
      Console.addInputField();
    }, 3000);
  },
  answer: function answer(question) {
    Helpers.answering = true;
    $('#interactive').append('<div id="answer" class="console-line"></div>');
    AI.compute();

    function checkIfAnswering() {
      if (Helpers.answering) {
        window.setTimeout(checkIfAnswering, 100);
      } else {
        setTimeout(function() {
          Console.nextQuery();
        }, 3000);
      }
    }
    checkIfAnswering();
  },
  nextQuery: function nextQuery() {
    $('#interactive').empty().append('<div id="prompt" class="console-line"></div>');
    Sounds.play('beep-system');
    Console.printText('#prompt', 'Next query', 0);

    setTimeout(function() {
      Console.addInputField();
      Helpers.cursorIsVisible = true;
    }, 1500);
  }
};
var Sounds = {
  play: function play(type) {
    if (Helpers.browserIsChrome && !Helpers.browserIsMobile && !Helpers.trailerIsPlaying()) {
      var audio = document.querySelector('audio#' + type);
      audio.currentTime = 0;
      audio.play();
    }
  }
};
