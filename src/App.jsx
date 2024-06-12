import React, { useState, useEffect } from 'react'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import Jake from './assets/jake.mp4';
import JakeImg from './assets/jake.png';
import svgModules from './assets/modules.svg';
import svgAssessments from './assets/assessments.svg';
import svgGames from './assets/games.svg';
import svgController from './assets/controller.svg';
import svgScores from './assets/scores.svg';
import svgMastery from './assets/mastery.svg';
import svgPie from './assets/radchartview-features-animations-pie-angle-range-animation.gif';

//eww root access api keys... need to move this over to a backend env variable file
const API_KEY = "APIKEYHERE";

function App() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [topic, setTopic] = useState("");
  const [completedModules, setCompletedModules] = useState(0);
  const [activeSection, setActiveSection] = useState('Modules');
  
  useEffect(() => {
    async function fadeSequence() {
      const preheader = document.querySelector('.preheader');
      const header = document.querySelector('.header');
      const inputFrame = document.querySelector('.inputFrame');
      const footer = document.querySelector('.footer');

      // const inputFrameButton = document.querySelector('.inputFrameButton');
      // const chatContainer = document.querySelector('.chat-container');

      await new Promise(resolve => setTimeout(resolve, 1500)); // 2 seconds delay
      preheader.classList.replace('fade-out', 'fade-in-slow');

      await new Promise(resolve => setTimeout(resolve, 2000)); // 3 seconds delay
      header.classList.replace('slide-up', 'slide-down');

      await new Promise(resolve => setTimeout(resolve, 2000)); // 3 seconds delay
      inputFrame.classList.replace('fade-out', 'fade-in-fast');
      preheader.classList.replace('fade-in-slow', 'fade-out');
      footer.classList.replace('fade-out', 'fade-in');

      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds delay
      menuLeft.classList.replace('fade-out', 'fade-in');
      menuTop.classList.replace('fade-out', 'fade-in');

      // await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      // chatContainer.classList.replace('fade-out', 'fade-in');
    }

    fadeSequence();
  }, []);

  const handleNextSlide = () => {
    console.log('test');
    const slideOne = document.querySelector('.slideOne');
    const sfLogoWhite = document.querySelector('.sfLogoWhite');
    const slideTwo = document.querySelector('.slideTwo');

    slideOne.classList.replace('slide-none', 'slide-left');
    sfLogoWhite.classList.add('hideLogo');
    slideTwo.classList.replace('slide-right', 'slide-none');
  };

  const handleSend = async () => {
    setUserInput("");
    setIsComplete(false);
    setTopic(userInput);
    const header = document.querySelector('.header');
    const chatContainer = document.querySelector('.chat-container');
    const menuLeft = document.querySelector('.menuLeft');
    const menuTop = document.querySelector('.menuTop');
    header.classList.replace('slide-down', 'slide-up');
    chatContainer.classList.replace('fade-out', 'fade-in-fast');
    menuLeft.classList.replace('fade-out', 'fade-in-slow');
    menuTop.classList.replace('fade-out', 'fade-in-slow');
    await processMessageToChatGPT(userInput);
  };

  async function processMessageToChatGPT(userMessage) {
    const curatedPrompt = `I want to learn about the topic of ${userMessage}. Create 10 sections of different categories about ${userMessage}. format each section like this and only return me this data like this, make sure to use a number for NUMBER in "Section NUMBER":
        insert the word "ST" here
        ⋮⋮ Section NUMBER: Section Title
        insert the word "SI" here
        1 Long Sentence describing this Section. Make this at least 10 words but no more than 25
        insert the word "SD" here
        Very long explanation of ${userMessage}. make it at least 20 to 30 paragraphs, use lists or bullet points as needed`;

    const apiMessages = [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: curatedPrompt }
    ];

    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: apiMessages,
      temperature: 0.7,
      stream: true
    };

    // WANNA FETCH? remove these comments

    // const response = await fetch("https://api.openai.com/v1/chat/completions", {
    //   method: "POST",
    //   headers: {
    //     "Authorization": `Bearer ${API_KEY}`,
    //     "Content-Type": "application/json"
    //   },
    //   body: JSON.stringify(apiRequestBody)
    // });

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let accumulatedMessage = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const json = line.replace(/^data: /, '');
          if (json !== '[DONE]') {
            try {
              const parsed = JSON.parse(json);
              const deltaContent = parsed.choices[0].delta?.content || "";
              accumulatedMessage += deltaContent;

              setMessages([{ message: accumulatedMessage }]);
            } catch (error) {
              console.error('Error parsing JSON:', error);
            }
          }
        }
      }
    }

    setIsComplete(true);
    parseAndSetMessages(accumulatedMessage.trim());
  }

  function parseAndSetMessages(message) {
    const sections = message.split("ST").slice(1).map(section => {
      const [titlePart, ...rest] = section.split("SI");
      const [introPart, descriptionPart] = rest.join("SI").split("SD");
      const title = titlePart.trim();
      const intro = introPart.trim();
      const description = descriptionPart.trim();
      const colorClass = `lmsColor${Math.floor(Math.random() * 7) + 1}`;

      return { title, intro, description, colorClass };
    });

    setMessages(sections);
    const moduleTitle = document.querySelector('.moduleTitle');
    const menuLeftItems = document.querySelector('.menuLeftItems');
    moduleTitle.classList.replace('fade-out', 'fade-in-fast');
    menuLeftItems.classList.replace('fade-out', 'fade-in-fast');

  }

  const handleMenuClick = async (newSection) => {
    if (activeSection === newSection) return;

    // Remove active class from the current menu item
    document.querySelector('.menuActive').classList.remove('menuActive');

    // Add active class to the clicked menu item
    document.querySelector(`.menu${newSection}`).classList.add('menuActive');

    // Handle section transitions
    const currentSection = document.querySelector(`.section${activeSection}`);
    const newSectionElement = document.querySelector(`.section${newSection}`);

    currentSection.classList.replace('fade-in-fast', 'fade-out');

    setTimeout(() => {
      currentSection.classList.remove('fade-in-fast');
      currentSection.classList.add('fade-out');
      newSectionElement.classList.replace('fade-out', 'fade-in-fast');
    }, 500);

    setActiveSection(newSection);
  };

  const handleFooterClick = () => {
    const video = document.getElementById('videoJake');
    const footer = document.querySelector('.footer');
  
    if (video) {
      video.play();
    }
  
    setTimeout(() => {
      footer.classList.replace('fade-in', 'fade-out');
    }, 13000);
  };
  
  function handleLmsCardClick(event) {
    const lmsCard = event.target.closest('.lmsCard');
    if (!lmsCard) return;

    const lmsCards = document.querySelectorAll('.lmsCard');

    if (lmsCard.classList.contains('activeCard')) {
      lmsCard.classList.add('opacity33');
      lmsCard.classList.remove('activeCard');
      lmsCards.forEach(card => {
        card.classList.remove('inactiveCard');
        card.classList.remove('fade-out');
        card.classList.add('fade-in');
      });
    } else {
      lmsCards.forEach(card => {
        if (card !== lmsCard) {
          card.classList.remove('fade-in');
          card.classList.add('fade-out');
        }
      });

      setTimeout(() => {
        lmsCards.forEach(card => {
          if (card === lmsCard) {
            card.classList.add('activeCard');
            card.classList.remove('fade-out');
            card.classList.add('fade-in');
          } else {
            card.classList.add('inactiveCard');
          }
        });
      }, 1000);
      setCompletedModules(prevCount => prevCount + 1);
    }
  }

  return (
    <>
      <div className='preheader bgcolor-white fade-out'>
        <h1 className='color-primary'>Let's <em>Grow</em> Together</h1>
      </div>
      <div className="header slide-up">
        <div className='headerContent bgcolor-primary'>
          <div className='sfLogoWhite'></div>
          <div className="inputFrame fade-out">
            <div className='inputFrameSlide slideOne slide-none'>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Let's learn about..."
              />
              <button className="button-64" role="button" onClick={handleNextSlide}><div className="text">Create <span>»</span></div></button>
            </div>
            <div className='inputFrameSlide slideTwo slide-right'>
              <h2 className='color-white'>Include Additional Training Materials:</h2>
              <div className="btnHolder">
                <button className='btnFilesIcon' />
                <button className='btnURLIcon' />
              </div>
              <button className="button-64" role="button" onClick={handleSend}><div className="text">Generate <span>»</span></div></button>
            </div>
          </div>
        </div>
        <div className="redCurveBottom"></div>
      </div>

      <div className="bodyContent">
        <div className="menuLeft color-white fade-out">
          <div className='menuLeftItems fade-out'>
            <div className='menuLeftItem menuModules menuActive' onClick={() => handleMenuClick('Modules')}>Modules <img src={svgModules} width="25" height="25" /></div>
            <div className='menuLeftItem menuAssessments' onClick={() => handleMenuClick('Assessments')}>Assessments <img src={svgAssessments} width="25" height="25" /></div>
            <div className='menuLeftItem menuGames' onClick={() => handleMenuClick('Games')}>Games <img src={svgGames} width="25" height="25" /></div>
            <div className='menuLeftItem menuScores' onClick={() => handleMenuClick('Scores')}>Scores <img src={svgScores} width="25" height="25" /></div>
            <div className='menuLeftItem menuMastery' onClick={() => handleMenuClick('Mastery')}>Mastery <img src={svgMastery} width="25" height="25" /></div>
          </div>
        </div>
        <div className="menuTop fade-out">
          <div className="menuTopInnerShadow">
            <div className="sfLogo"></div>
            <h4 className='menuTopTopic color-white'>Lesson Plans&nbsp;&nbsp;⋮⋮&nbsp;&nbsp;<em>Lets learn all about {topic}</em></h4>
          </div>
        </div>

        <div className='contentSection sectionModules chat-container fade-out'>
          <section className="chat-conversation">
            <h2 className='moduleTitle color-primary fade-out'>Learning Modules Complete ({completedModules} / 10)</h2>
            <div className='lmsCards'>
              {!isComplete ? (
                messages.map((message, i) => (
                  <div className="aiWorking" key={i}>{message.message}</div>
                ))
              ) : (
                messages.map((message, i) => (
                  <div key={i} className={`card lmsCard ${message.colorClass} fade-in`} onClick={handleLmsCardClick}>
                    <img className="card-img" src={`https://picsum.photos/600/300?random=${i}`} alt="Random Image" />
                    <div className="card-body">
                      <h5 className="card-title">{message.title}</h5>
                      <p className="card-text">{message.intro}</p>
                      <pre>{message.description}</pre>
                      <div className="card-bottomToolTips">
                        <span className="float-left">⬜</span>
                        <span className="float-left">💬</span>
                        <span className="float-left">★</span>
                        <span className="float-right">{Math.floor(Math.random() * 3) + 1} sections</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className='contentSection sectionAssessments fade-out'>
          <h2 className='moduleTitle color-primary'>Assessments</h2>
          <table className="table table-striped table-dark">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">First</th>
                <th scope="col">Last</th>
                <th scope="col">Handle</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">1</th>
                <td>Mark</td>
                <td>Otto</td>
                <td>@mdo</td>
              </tr>
              <tr>
                <th scope="row">2</th>
                <td>Jacob</td>
                <td>Thornton</td>
                <td>@fat</td>
              </tr>
              <tr>
                <th scope="row">3</th>
                <td>Larry</td>
                <td>the Bird</td>
                <td>@twitter</td>
              </tr>
              <tr>
                <th scope="row">1</th>
                <td>Mark</td>
                <td>Otto</td>
                <td>@mdo</td>
              </tr>
              <tr>
                <th scope="row">2</th>
                <td>Jacob</td>
                <td>Thornton</td>
                <td>@fat</td>
              </tr>
              <tr>
                <th scope="row">3</th>
                <td>Larry</td>
                <td>the Bird</td>
                <td>@twitter</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className='contentSection sectionGames fade-out'>
          <h2 className='moduleTitle color-primary'>Games</h2>
          <div className='svgController swing'><img src={svgController} width="500" height="500" /></div>
        </div>

        <div className='contentSection sectionScores fade-out'>
          <h2 className='moduleTitle color-primary'>Scores</h2>
          <div className='scoreCopy'>No scores available yet!<br/>Take some assessments</div>
        </div>

        <div className='contentSection sectionMastery fade-out'>
          <h2 className='moduleTitle color-primary'>Mastery</h2>
          <div className="svgPie"><img src={svgPie} width="638" height="309" /></div>
        </div>

      </div>

      <div className="footer fade-out" onClick={handleFooterClick}>
      <video id="videoJake">
        <source src={Jake} type="video/mp4" />
      </video>    
      </div>
    </>
  );
}

export default App;