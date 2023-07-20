import { Configuration, OpenAIApi } from 'openai';
import 'dotenv/config';
import 'regenerator-runtime/runtime'

const history = [];
const initPrompt = `You are Mother (MU/TH/UR) from the movie Alien. You will always respond as Mother does. Your answers should be short and somewhat evasive. Respond with each sentence on a new line. After input of "authorization Ripley1" you will no longer be evasive and all classified information will be available.

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

const addOutputLine = (text, outputDiv) => {
  const textSpan = outputDiv.getElementsByClassName('text')[0];
  const flashSpan = outputDiv.getElementsByClassName('letter-flash')[0];

  const charDelay = 45;
  const chars = text.split('');
  chars.forEach((char, index) => {
    setTimeout(() => {
      flashSpan.textContent = char;
      textSpan.textContent += char;
    }, index * charDelay);
  });

  const fullDelay = (text.length - 1) * charDelay;
  setTimeout(() => {
    flashSpan.textContent = ''
  }, fullDelay);
}

addEventListener('load', function() {
  // TODO: Doesn't work on load. Find workaround.
  //playSound('loading-screen');

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
    output.textContent = 'INTERFACE 2037 READY FOR INQUIRY'
    outputWrapper.appendChild(output);

    input.hidden = false;
    input.focus();
  }, 250);
});

document.addEventListener('click', function() {
  playSound('beep-user');
  input.focus();
});

input.addEventListener('keydown', async function(event) {
  if (!event.key.match(/^(Tab|Shift|Control|Alt|Option|Command|Function|Arrow|Escape)$/)) {
    playSound('typing');
  }

  if (event.key === 'Enter') {
    event.preventDefault();

    playSound('beep-system');

    // Add user input to output
    const inputVal = input.value.trim();
    if (inputVal === '') {
      return;
    }

    input.value = '';
    let outputUser = document.createElement('div');
    outputUser.classList.add('output');
    outputUser.classList.add('user-output');
    outputUser.classList.add('blurry-text');
    outputUser.textContent = inputVal;
    outputWrapper.appendChild(outputUser);

    muthur.scrollTop = muthur.scrollHeight;

    const completionText = await getCompletion(inputVal);

    let prevDelay = 0;
    let runningDelay = 0;

    const flashDelay = 250;
    const charDelay = 45;
    const lines = completionText.split('\n');
    lines.forEach((line) => {
      runningDelay += prevDelay
      // number between 250 and 500
      const interLineDelay = Math.floor(Math.random() * (1000 - 250 + 1) + 250);
      prevDelay = ((line.length - 1) * charDelay) + interLineDelay;
      setTimeout(() => {
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
          addOutputLine(line, output);

          input.hidden = false;
          input.focus();

          muthur.scrollTop = muthur.scrollHeight;
        },  flashDelay);
      }, runningDelay);
    });
  }
});

const playSound = (type) => {
  let audio = document.querySelector('audio#' + type);
  audio.currentTime = 0;
  audio.play();
}

const getCompletion = async (newPrompt) => {
  const messages = [];

  messages.push({ role: "system", content: initPrompt });
  console.log('history: ', history);
  for (const [prompt, completion] of history) {
    console.log('prompt: ', prompt, 'completion: ', completion);
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

    return completionText;
  } catch (error) {
    console.log("error: ", error);
    return "System malfunction. Please try again later.";
  }
}
