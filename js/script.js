import { Configuration, OpenAIApi } from 'openai';
// import { env } from 'node:process';
import 'dotenv/config';
import 'regenerator-runtime/runtime'

const history = [];
const initPrompt = `You are Mother (MU/TH/UR) from the movie Alien. You will always respond as Mother does. When responding put individual sentences on a new line.

[EXAMPLES]
User: "What's our current status?"
Mother:
All systems functioning within normal parameters
Current location is in deep space, coordinates are classified
User: "Do we have any alien life forms on board?"
Mother:
Unable to confirm presence of unknown life forms
Recommend further investigation
User: "When will we reach Earth?"
Mother:
Current course and velocity project arrival at Earth
in 57 days, 12 hours, 6 minutes
User: "Request further information"
Mother:
No further information
Special order 937
Science officer's eyes only
User: "WHAT'S THE STORY MOTHER?"
Mother:
Distress signal received from unknown origin`;

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);
const gptModel = "gpt-3.5-turbo";

const muthur = document.getElementById('muthur-interface');
const outputWrapper = document.getElementById('output-wrapper');
const input = document.getElementById('input');

const addOutputText = (text, outputDiv) => {
  history.push(text);

  const textSpan = outputDiv.getElementsByClassName('text')[0];
  const flashSpan = outputDiv.getElementsByClassName('letter-flash')[0];

  const lines = text.split('\n');
  let charCount = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const chars = line.split('');
    charCount += chars.length;
    for (let j = 0; j < line.length; j++) {
      const char = chars[j];
      setTimeout(() => {
        flashSpan.textContent = char;
        textSpan.textContent += char;
      }, j * 45);
    }
  }

  setTimeout(() => {
    flashSpan.textContent = ''
  }, charCount * 45);

  // output one char at a time
  // new Promise((resolve, reject) => {
  //   lines.forEach(async (line) => {
  //     console.log(line)
  //     const chars = line.split('');
  //     chars.forEach((char, index) => {
  //       console.log('char', char)
  //       setTimeout(() => {
  //         flashSpan.textContent = char;
  //         textSpan.textContent += char;
  //       }, index * 45);
  //     });
  //   });
  // }).then(() => {
  //   flashSpan.textContent = ''
  // });
}

addEventListener('load', function() {
  // TODO: Doesn't work on load. Find workaround.
  //Sounds.play('loading-screen');

  input.hidden = true;
  let flash = document.createElement('div');
  flash.classList.add('flash-container');
  flash.innerHTML = '<span class="flash">'
  outputWrapper.appendChild(flash);

  setTimeout(function() {
    outputWrapper.removeChild(flash);

    let output = document.createElement('div');
    output.classList.add('output');
    output.classList.add('generated-output');
    output.classList.add('blurry-text');
    output.textContent = 'INTERFACE 2023 READY FOR INQUIRY'
    outputWrapper.appendChild(output);

    input.hidden = false;
    input.focus();
  }, 250);
});

document.addEventListener('click', function() {
  Sounds.play('beep-user');
  input.focus();
});

input.addEventListener('keydown', function(event) {

  if (event.key === 'Enter') {
    event.preventDefault();

    Sounds.play('beep-system');

    // Add user input to output
    const inputVal = input.value.trim();
    if (inputVal === '') {
      return;
    }
    input.value = '';
    let outputUser = document.createElement('div');
    outputUser.classList.add('output');
    outputUser.classList.add('blurry-text');
    outputUser.textContent = inputVal;
    outputWrapper.appendChild(outputUser);

    muthur.scrollTop = muthur.scrollHeight;

    getCompletion(inputVal).then((completionText) => {

      // Do flash animation
      input.hidden = true;
      // <div className="flash-container"><span className="flash"></span></div>
      let flash = document.createElement('div');
      flash.classList.add('flash-container');
      flash.innerHTML = '<span class="flash">'
      outputWrapper.appendChild(flash);

      muthur.scrollTop = muthur.scrollHeight;

      setTimeout(function () {
        outputWrapper.removeChild(flash);

        // Add output
        // <div className="output generated-output blurry-text"><span className="text">asdfasdf</span><span className="letter-flash">E</span></div>
        let output = document.createElement('div');
        output.classList.add('output');
        output.classList.add('generated-output');
        output.classList.add('blurry-text');
        let textSpan = document.createElement('span');
        textSpan.classList.add('text');
        let textFlash = document.createElement('span');
        textFlash.classList.add('letter-flash');
        output.appendChild(textSpan);
        output.appendChild(textFlash);
        outputWrapper.appendChild(output);
        //addOutputText("PROCESSING INPUT...", output);
        addOutputText(completionText, output);

        input.hidden = false;
        input.focus();

        muthur.scrollTop = muthur.scrollHeight;
      }, 250);
    });
  } else {
    Sounds.play('typing');
  }
});

let Sounds = {
  play: function play(type) {
    let audio = document.querySelector('audio#' + type);
    audio.currentTime = 0;
    audio.play();
  }
};

const getCompletion = async (newPrompt) => {
  const messages = [];

  messages.push({ role: "system", content: initPrompt });
  for (const [prompt, completion] of history) {
    messages.push({ role: "user", content: prompt });
    messages.push({ role: "assistant", content: completion });
  }
  messages.push({ role: "user", content: newPrompt });

  try {
    const completion = await openai.createChatCompletion({
      model: gptModel,
      messages: messages,
      max_tokens: 1000
    });

    const completionText = completion.data.choices[0].message.content.replace(/^"+/, '').replace(/"+$/, '');
    history.push([newPrompt, completionText]);
    console.log('completionText: ', completionText);

    return completionText;
  } catch (error) {
    console.log("error: ", error);
    return "System malfunction. Please try again later.";
  }
}
