//

const minPlayers = 4
const numPacks = 7 // responseString will break if no. of card packs exceeds 36

const majorVersion = '0.5'
const minorVersion = '0'

// var is global, let is block scope

twemoji.parse(document.body)

import * as firebase from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import * as firestore from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js'
import * as auth from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js'

const firebaseConfig = {
  apiKey: "AIzaSyBJogGCKQFmy36HfQeHnxgr7sL930E6GFk",
  authDomain: "gamesnight-server.firebaseapp.com",
  databaseURL: "https://gamesnight-server-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "gamesnight-server",
  storageBucket: "gamesnight-server.appspot.com",
  messagingSenderId: "347855657762",
  appId: "1:347855657762:web:e5845d10d138e42401637b"
};

if (!firebase._apps.length) {
  let app = firebase.initializeApp(firebaseConfig);

  auth.signInAnonymously(auth.getAuth())

  var db = firestore.getFirestore(app)
}

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
    {
      urls: "turn:relay1.expressturn.com:3478",
      username: "efG6D6WWAEIJ3WIA6P",
      credential: "qktQdzg7FnH87YjM"
    }
  ],
  iceCandidatePoolSize: 10,
};

let callId = null;

let globalVolume = 1

var singleDigits = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']

var promptsChosen = []

let reactionsLogged = {}
let playerEndorsements = []

let peerConnections = {}
let peerChannels = {}

function sendToPeers(data) {

  let parsedData = data

  Object.keys(peerChannels).forEach((peerId) => {

    if (peerChannels[peerId] == undefined || peerChannels[peerId].readyState != 'open') {
      let peerIndex = Object.keys(peerChannels).indexOf(peerId)

      peerConnections[peerId].close()
  
      delete peerConnections[peerId]
      delete peerChannels[peerId]
      delete gameState.players[peerId]

      playerBar.children[peerIndex + 1].remove()

      if (parsedData.players) {
        delete parsedData.players[peerId]
      }
    }
  })

  Object.values(peerChannels).forEach((channel) => {
    if (channel && channel.readyState == 'open') {
      channel.send(JSON.stringify(parsedData))
    }
  })

}

function disconnectPeers() {
  Object.keys(peerChannels).forEach((peerId) => {
    let peerIndex = Object.keys(peerChannels).indexOf(peerId)
    
    peerConnections[peerId].close()

    delete peerConnections[peerId]
    delete peerChannels[peerId]
    delete gameState.players[peerId]

    playerBar.children[peerIndex].remove()
  })
}

function wakeObject(object) { return JSON.parse(JSON.stringify(object)) }

const initialGameState = {
  currentRound: {
    roundNum: 0,
    segment: '',
    segmentTitle: '',
    timeLeft: 0,
    spotlight: '',
    spotlightTeaser: '',
    responses: [],
    promptType: 0,
    promptId: 0,
    player: 0,
    playerName: '',
  },
  players: {},
  gameRules: {
    votingSystem: 'score',
    pointsToWin: 4,
    numRounds: 6
  }
};

let gameState = initialGameState

var myId = null

// HTML elements
const callButton = document.getElementById('callButton');
const joinInput = document.getElementById('joinInput');
const joinButton = document.getElementById('joinButton');

const segmentText = document.getElementById('segmentText');

const preGameFrame = document.getElementById('preGameFrame')
const gameFrame = document.getElementById('gameFrame')

const gameTitle = document.getElementById('gameTitle')
const gameContext = document.getElementById('gameContext')
const gameDescription = document.getElementById('gameDescription')

const spotlightFrame = document.getElementById('spotlightFrame')
const dynamicFrame = document.getElementById('dynamicFrame')
const dynamicFrameBackground = document.getElementById('dynamicFrameBackground')
const spotlightForeground = document.getElementById('spotlightForeground');
const spotlightDecor = document.getElementById('spotlightDecor');
const spotlightText = document.getElementById('spotlightText');
const spotlightContext = document.getElementById('spotlightContext');
const spotlightContext2 = document.getElementById('spotlightContext2');

const disconnectFrame = document.getElementById('disconnectFrame')
const cardFrame = document.getElementById('cardFrame')

const dismissButton = document.getElementById('dismissButton')

const controlBar = document.getElementById('controlBar')
const nameText = document.getElementById('nameText')
const scoreText = document.getElementById('scoreText')
const roundsLeftText = document.getElementById('roundsLeftText')
const leaveButton = document.getElementById('leaveButton');
const readyButton = document.getElementById('readyButton');
const nameInput = document.getElementById('nameInput');

const playButton = document.getElementById('playButton');

const interactionPanel = document.getElementById('interactionPanel');

const playerBar = document.getElementById('playerBar')

const notificationPanel = document.getElementById('notificationPanel')

const successAudio = document.getElementById('successAudio')
const alertAudio = document.getElementById('alertAudio')
const neutralAudio = document.getElementById('neutralAudio')
const musicAudio = document.getElementById('musicAudio')
successAudio.volume = globalVolume / 12
alertAudio.volume = globalVolume / 12
neutralAudio.volume = globalVolume / 12
musicAudio.volume = globalVolume / 10

const speech = window.SpeechSynthesis


const promptList = [
  {
    'name': 'Standard', // promptType = 0
    'prompts': [
      'Industry advocates have criticised ',
      'Is anyone here ',
      'An apartment littered with strangers\' clothes. Day in the life of ',
      'If I\'m not Canadian, the President of the United States isn\'t ',
      'My dad is sceptical of the science behind ',
      'What\'s life without ',
      'Yikes. The office is in urgent need of ',
      'I\'ve travelled back in time to stop ',
      'I\'m not ill, I\'m simply ',
      'Took a trip to Timbuktu. My favourite thing? The bit where I was ',
      'Ugh, what\'s that smell? Someone\'s ',
      '1944 was a year of ',
      'Shakespeare was no artist. He was merely ',
      'Times are tough, but at least I\'m not ',
      'Sorry to inform you, but you\'re ',
      'There will always be a special place in my heart for ',
      'What the haters don\'t know is I\'m ',
      'Let\'s take a moment to appreciate ',
      'Shout out to ',
      'They\'re back at it again, ',
      'That\'s what I hate about those foreigners, they are always ',
      'Time flies when you\'re ',
      'God is good. After all, he gave us ',
      'It\'s what my great aunt does best: ',
      'Imagine my surprise when I walked into school to find a student who was ',
      'My life is best represented by ',
      'I feel like ',
      'It should be illegal to be ',
      'Seriously though, I am literally ',
      'Can we agree on ',
      'When you hit rock bottom, the only way to go is ',
      'The newest blockbuster flick is a bitter-sweet commentary on ',
      'His music makes me want to be ',
      'Her daughter is much like her, except that she\'s ',
      'Watering a plant is a little bit like ',
      'If people truly listened to the trees, they\'d realise that nature is ',
      'When life gives you lemons, lemons give you ',
      'This great nation can\'t deal with any more ',
      'That\'s surprising! This time the villain wasn\'t ',
      'Yes, you got a promotion. But why would I be jealous? I\'m ',
      'Nicole loves ',
      'I pray he\'s ',
      'Pssshhhh. That\'s about as likely as ',
    ]
  },
  {
    'name': 'Review', // promptType = 1
    'prompts': [
      {
        'rating': 4,
        'description': 'Uhh... could do with a little less tang.'
      },
      {
        'rating': 1,
        'description': 'Come on, how is this still a thing nowadays??'
      },
      {
        'rating': 5,
        'description': 'Superb. Excellent. Well-rounded.'
      },
      {
        'rating': 1,
        'description': 'Asked for a refund as soon as it came.'
      },
      {
        'rating': 4,
        'description': 'Well I love it, but it\'s certainly not for everyone.'
      },
      {
        'rating': 3,
        'description': 'Pretty average.'
      },
      {
        'rating': 3,
        'description': 'Delightful. Gets the job done most of the time.'
      },
      {
        'rating': 2,
        'description': 'Terrible surprise birthday gift, take it from me.'
      },
      {
        'rating': 4,
        'description': 'So nostalgic. Takes me back to my youth.'
      },
      {
        'rating': 1,
        'description': 'A mistake.'
      },
      {
        'rating': 3,
        'description': 'A feeling to get high on.'
      },
      {
        'rating': 2,
        'description': 'What the freak, dude.'
      },
      {
        'rating': 4,
        'description': 'Now this is something I can wholeheartedly support!'
      },
      {
        'rating': 5,
        'description': 'As a vegan, I give this my full endorsement.'
      },
      {
        'rating': 2,
        'description': 'Mid...'
      },
      {
        'rating': 1,
        'description': 'How do I put it... painfully vanilla?'
      },
      {
        'rating': 3,
        'description': 'Good enough for Hollywood, good enough for me.'
      },
      {
        'rating': 5,
        'description': 'Finally! Some fun for the entire family.'
      },
      {
        'rating': 5,
        'description': 'This is GOATED!!'
      },
      {
        'rating': 4,
        'description': 'In my opinion, massively underrated.'
      },
      {
        'rating': 3,
        'description': 'Gargantuan.'
      },
      {
        'rating': 3,
        'description': 'Ha, imagine that! What a world.'
      },
      {
        'rating': 5,
        'description': 'Had an absolute whale of a time.'
      },
    ]
  },
  {
    'name': 'Conversation', // promptType = 2
    'prompts': [
      {
        'setup': [ // structure allows for potential 'punchline' in future
          'New phone, who dis?'
        ]
      },
      {
        'setup': [
          'WHAT',
          'DO',
          'YOU',
          'WANT',
          'FROM',
          'ME??'
        ]
      },
      {
        'setup': [
          'going shoppin\'',
          'want anything?'
        ]
      },
      {
        'setup': [
          'hold up girly~',
          'are you thinking what im thinking?'
        ]
      },
      {
        'setup': [
          'I seriously don\'t get it.',
          'Like, what\'s keeping your parents together?'
        ]
      },
      {
        'setup': [
          'lads',
          'what do we put on the end-of-term bucket list'
        ]
      },
      {
        'setup': [
          'Jessie.',
          'You weren\'t at school today, my sweet.',
          'What were you doing?!?',
          'Love from Mum. <3'
        ]
      },
      {
        'setup': [
          'met ur bf today',
          'he was stuttering all over...',
          'why was he nervous around me??'
        ]
      },
      {
        'setup': [
          'i can see this absolute JOCK',
          'how do I get his attention'
        ]
      },
      {
        'setup': [
          'Dad, I can\'t live here anymore.',
          'Give me one good reason I shouldn\'t flee to Australia.'
        ]
      },
      {
        'setup': [
          'Hey, this is Sam.',
          'I had my appointment yesterday.',
          'What\'s my diagnosis?'
        ]
      },
      {
        'setup': [
          'why won\'t you return my calls'
        ]
      },
      {
        'setup': [
          'i\'ve sent the ransom email.',
          'they\'ll send us the money.',
          'cause you know what will happen if they don\'t, right?'
        ]
      },
      {
        'setup': [
          'PLEASE HELP.',
          'i think there\'s an INTRUDER in my house.',
          'what\'s my best option?'
        ]
      },
      {
        'setup': [
          'Alex, what\'s this \'C.P.\' folder on your desktop?'
        ]
      },
      {
        'setup': [
          'Okay team,',
          'time for another icebreaker game!',
          'Ready for your question? Okay!',
          'What\'s one thing that never gets old...'
        ]
      },
      {
        'setup': [
          'This is your job agent.',
          'If you were to describe your value as an employee, what would you say?'
        ]
      },
      {
        'setup': [
          'What\'s on your mind?'
        ]
      },
    ]
  },
  {
    'name': 'Newsflash', // promptType = 3
    'prompts': [
      'Cities in chaos as thousands flee',
      'Middle East tensions increased after unexpected aggression',
      'Is it really the most effective option on the table?',
      'Celebrities weigh in on new trend',
      'Latest royal drama has Britain in shellshock!',
      'Coming up: Another political scandal',
      'Critics calling it a \'huge step backwards\'',
      'Listeners raving after Taylor Swift drops new single',
      'New movement on the rise',
      'Protestors are armed and angry - and this is why',
      'Anonymous cyber criminal tells all',
      'Suspect claims she wanted to save innocent lives',
      'Book launched during mental health week',
      'Police say a lack of discipline is to blame',
      'New targets \'unachievable\' says spokesperson',
      'China closes border due to rapid increases',
      'Biggest success in \'Egyptian history\'',
      '97% approval rating, report reveals',
      'Newsflash: totally overrated',
      '8 topics inappropriate for this day and age'
    ]
  },
  /*{
    'name': 'Social', // promptType = 4
    'prompts': [
      'Worst cinematic moment of the year!'
    ]
  }
  /*{
    'name': 'Dual', // temporarily, promptType = 50
    'prompts': [
      [
        'I think ',
        ' is best described as ',
        '.'
      ],
      [
        'Stop worrying about ',
        ' and start paying attention to ',
        '.'
      ],
      [
        'Success is built on ',
        ' and ',
        '.'
      ]
    ]
  }*/
]


const responseList = []

for (let i = 0; i < numPacks; i++) {

  fetch('packs/' + i + '.json').then(response => {
    
    response.json().then(response => {

      responseList[i] = response[0]

    })
    
  })

}


window.onpointermove = event => {
  const { clientX, clientY } = event;

  dynamicFrameBackground.animate({
    'backgroundPosition': clientX / 20 + 'px' + ' ' + clientY / 10 + 'px'
  }, {duration: 2000, fill: "forwards" })
}


// 1. Setup media sources

callButton.onclick = async () => {
  

  // P A R T  1

  successAudio.load()
  successAudio.play()

  joinInput.setAttribute('disabled', true)
  joinButton.setAttribute('disabled', true)
  callButton.setAttribute('disabled', true)

  function generateResponseString() {

    let currentString = ''

    let i = 1
    while (i <= 100) { // responseString will break if no. of rounds exceeds 100

      currentString = currentString + Math.floor(Math.random() * Object.keys(responseList).length).toString(Object.keys(responseList).length)

      let responsesChosen = []

      let j = 1
      while (j <= 6) {
        
        let newResponse = Math.floor(Math.random() * 25).toString(25)

        while (responsesChosen.find(element => element == newResponse)) {
          newResponse = Math.floor(Math.random() * 25).toString(25)
        }

        currentString = currentString + newResponse
        responsesChosen.push(newResponse)
        
        j++

      }

      i++

    }

    return currentString

  }

  myId = 0

  gameState.players[myId] = ({ // reset literally everything each game (when implementing multi-game sessions) (use InitialGameState)
    id: myId,
    name: 'Host',
    ready: true,
    responses: [],
    responseString: generateResponseString(),
    endorsements: {},
    votingScore: 0,
  })

  // Reference Firestore collections for signaling

  callId = Math.floor(Math.random() * 61439 + 4096).toString(16).toLowerCase()
  joinInput.value = callId

  navigator.clipboard.writeText(callId)
  
  let callDoc = firestore.doc(db, 'calls', callId)
  await firestore.setDoc(callDoc, {})
  let offerCandidates = await firestore.collection(callDoc, 'offerCandidates');
  let answerCandidates = await firestore.collection(callDoc, 'answerCandidates');

  gameState.currentRound.segment = 'lobby'
  gameState.currentRound.segmentTitle = 'Lobby'
  gameState.currentRound.spotlight = 'Your room code is ' + callId + '.'

  segmentText.innerText = 'Lobby'
  setDynamicFrame(gameState.currentRound)

  nameText.innerText = 'Host'

  if (gameState.gameRules.votingSystem == 'score') {
    scoreText.innerText = '0'
    roundsLeftText.innerText = 'Most endorsements after ' + gameState.gameRules.numRounds + ' rounds wins'
  } else if (gameState.gameRules.votingSystem == 'quota') {
    scoreText.innerText = '0'
    roundsLeftText.innerText = 'First to ' + gameState.gameRules.pointsToWin + 'pts wins'
  }

  nameInput.placeholder = 'Host'
  leaveButton.removeAttribute('disabled')
  nameInput.removeAttribute('disabled')

  controlBar.classList.add('opened')

  Object.keys(playerBar.children).forEach((child) => {
    playerBar.children[0].remove()
  })

  let newPlayerMarker = document.createElement('div')
  newPlayerMarker.classList.add('playerMarker')
  let newPlayerIcon = document.createElement('p')
  newPlayerIcon.innerText = gameState.players[myId].name[0]
  newPlayerMarker.appendChild(newPlayerIcon)
  let newPlayerLabel = document.createElement('p')
  newPlayerLabel.innerText = gameState.players[myId].name
  newPlayerMarker.appendChild(newPlayerLabel)

  let newPlayerIndicator = document.createElement('img')
  if (!document.documentElement.classList.contains('dev')) {
    newPlayerIndicator.src = '/icons/ready.png'
  } else {
    newPlayerIndicator.src = '/icons/ready2.png'
  }
  newPlayerIndicator.classList.add('banished')
  newPlayerIndicator.classList.add('icon')
  newPlayerMarker.appendChild(newPlayerIndicator)

  playerBar.appendChild(newPlayerMarker)
  newPlayerIndicator.classList.remove('banished')

  playerBar.classList.remove('banished')
  playerBar.classList.add('opened')

  preGameFrame.classList.add('banished')

  gameFrame.classList.remove('banished')


  window.runGame = function() {

    gameState.currentRound.roundNum = 1

    promptsChosen = [] // never let roundNum exceed the number of ANY type of prompt

    playButton.classList.remove('banished')

    playButton.onclick = async () => {

      successAudio.load()
      successAudio.play()
      
      playButton.classList.add('banished')
      runRound()
      
    }

  }

  window.runRound = function() {

    function startTimer() {
      
      let timeLeft = gameState.currentRound.timeLeft

      setTimeout(() => {

        segmentText.classList.add('i')
        segmentText.innerText = gameState.currentRound.segmentTitle + ' • ' + timeLeft + 's'

        let timer = setInterval(function() {

          timeLeft--

          if (timeLeft <= 0) {
            clearInterval(timer)
            
            segmentText.classList.remove('i')
            segmentText.innerText = gameState.currentRound.segmentTitle

            gameState.currentRound.timeLeft = 0

            sendToPeers(gameState)
          } else {
            segmentText.innerText = gameState.currentRound.segmentTitle + ' • ' + timeLeft + 's'
          }

        }, 1000)

      }, 800)

    }

    let promptType = Math.floor(Math.random() * Object.keys(promptList).length)

    let promptId = Math.floor(Math.random() * (promptList[promptType].prompts.length))

    while (promptsChosen.find(element => element.type == promptType && element.id == promptId)) {
        
      promptId = Math.floor(Math.random() * (promptList[promptType].prompts.length))

    }

    promptsChosen.push({
      type: promptType,
      id: promptId
    })

    let promptString = constructPromptString(promptType, promptId)

    gameState.currentRound.segment = 'prompt'
    gameState.currentRound.segmentTitle = promptList[promptType].name + ' prompt'
    gameState.currentRound.spotlight = promptString
    gameState.currentRound.spotlightTeaser = gameState.players[Math.floor(Math.random() * Object.keys(gameState.players).length)].name
    gameState.currentRound.promptType = promptType
    gameState.currentRound.promptId = promptId
    gameState.currentRound.timeLeft = 3

    segmentText.innerText = promptList[promptType].name + ' prompt'

    if (promptType == 0) {
      setDynamicFrame(gameState.currentRound, promptList[promptType].prompts[promptId])
    } else if (promptType == 1) {
      setDynamicFrame(gameState.currentRound, promptList[promptType].prompts[promptId].description)
    } else if (promptType == 2) {
      setDynamicFrame(gameState.currentRound, promptList[promptType].prompts[promptId].setup.join(','))
    } else if (promptType == 3) {
      setDynamicFrame(gameState.currentRound, promptList[promptType].prompts[promptId])
    } else {
      setDynamicFrame(gameState.currentRound, promptList[promptType].prompts[promptId])
    }

    Object.keys(spotlightFrame.children).forEach(function(child) {
      spotlightFrame.children[0].remove()
    })

    let playerList = Object.keys(gameState.players)
        
    playerList.forEach(function(player) {

      gameState.players[player].responses = []
      gameState.players[player].ready = false

      let peerIndex = Object.keys(gameState.players).indexOf('' + player + '')

      playerBar.children[peerIndex].children[2].classList.add('banished')

    })

    controlBar.classList.remove('opened')
    playerBar.classList.remove('opened')

    readyButton.setAttribute('disabled', true)

    sendToPeers(gameState);

    startTimer()

    setTimeout(function() {

      gameState.currentRound.segment = 'response'
      gameState.currentRound.segmentTitle = 'Response'
      gameState.currentRound.timeLeft = 15

      segmentText.innerText = 'Response'

      let i = 1
      let responsePackChosen = parseInt((gameState.players[myId].responseString).charAt(7 * gameState.currentRound.roundNum - 7), Object.keys(responseList).length)
      let responsesChosen = []

      Object.keys(cardFrame.children).forEach((child) => {
        cardFrame.children[0].remove()
      })

      cardFrame.style.setProperty('--numCards', 0)

      while (i <= 6) {

        let responseId = parseInt((gameState.players[myId].responseString).charAt(7 * gameState.currentRound.roundNum - 7 + i), 25)
        
        responsesChosen.push(responseId)
        
        let newCard = cardFrame.appendChild(document.createElement('div'))
        newCard.classList.add('card')
        newCard.appendChild(document.createElement('p')).innerText = responseList[responsePackChosen].responses[responseId]
        newCard.children[0].classList.add('cardText')
        newCard.appendChild(document.createElement('p')).innerText = responseList[responsePackChosen].emoji
        newCard.children[1].classList.add('cardEmoji')
        newCard.appendChild(document.createElement('p')).innerText = ''
        newCard.children[2].classList.add('cardContext')

        twemoji.parse(newCard.children[1])

        newCard.onclick = async () => {

          neutralAudio.load()
          neutralAudio.play()

          Object.keys(newCard.parentElement.children).forEach((child) => {

            newCard.parentElement.children[child].classList.remove('selected')
            newCard.parentElement.children[child].children[2].innerText = ''

          })

          newCard.classList.add('selected')
          newCard.children[2].innerText = 'selected'

          gameState.players[myId].responses[0] = {
            card: responseId,
            pack: responsePackChosen
          }

        }

        cardFrame.style.setProperty('--numCards', 6)

        i++

      }

      setTimeout(function() {
        cardFrame.classList.remove('banished')
      }, 0)

      sendToPeers(gameState);

      startTimer()
      
      if (gameState.currentRound.promptType == 0) {
        musicAudio.src = '/sounds/music/upbeat.mp3'            
      } else if (gameState.currentRound.promptType == 1) {
        musicAudio.src = '/sounds/music/heavenly.mp3'
      } else if (gameState.currentRound.promptType == 2) {
        musicAudio.src = '/sounds/music/gritty.mp3'
      } else if (gameState.currentRound.promptType == 3) {
        musicAudio.src = '/sounds/music/lowkey.mp3'
      } else {
        musicAudio.src = '/sounds/music/upbeat.mp3'
      }

      musicAudio.load()
      musicAudio.play()

      setTimeout(function() {

        spotlightFrame.style.setProperty('--numCards', 0)

        Object.keys(interactionPanel.children).forEach((child) => {
          interactionPanel.children[0].remove()
        })

        reactionsLogged = {}

        let playerCount = Object.keys(gameState.players).length

        Object.keys(gameState.players).forEach(function(playerId) {
          
          gameState.players[playerId].endorsements = {}

          let playerResponses = gameState.players[playerId].responses

          if (playerResponses.length == 0 || responseList[playerResponses[0].pack] === undefined || responseList[playerResponses[0].pack].responses[playerResponses[0].card] === undefined) {

            let newInteraction = interactionPanel.appendChild(document.createElement('button'))
            newInteraction.classList.add('interaction')
            newInteraction.classList.add('important')
            newInteraction.innerText = (parseInt(playerId) + 1) + '📄'

            twemoji.parse(newInteraction)

            newInteraction.onclick = async () => {

              if (!newInteraction.classList.contains('simulatedActive')) {
                
                successAudio.load()
                successAudio.play()

                newInteraction.classList.add('simulatedActive')
                
                if (spotlightFrame.children.length >= (playerCount - parseInt(playerId))) {

                  spotlightFrame.children[spotlightFrame.children.length - (playerCount - parseInt(playerId))].classList.add('selected')
                  spotlightFrame.children[spotlightFrame.children.length - (playerCount - parseInt(playerId))].children[2].innerText = 'endorsed'
        
                }
                
                logReaction(myId, 0)

                gameState.players[myId].endorsements[playerId] = 5

              } else {

                alertAudio.load()
                alertAudio.play()

                newInteraction.classList.remove('simulatedActive')

                if (spotlightFrame.children.length >= (playerCount - parseInt(playerId))) {

                  spotlightFrame.children[spotlightFrame.children.length - (playerCount - parseInt(playerId))].classList.remove('selected')
                  spotlightFrame.children[spotlightFrame.children.length - (playerCount - parseInt(playerId))].children[2].innerText = gameState.players[playerId].name
        
                }

                reactionsLogged[playerId] = 0

                gameState.players[myId].endorsements[playerId] = 0

              }

              sendToPeers(gameState)

            }

          } else {
            
            let newInteraction = interactionPanel.appendChild(document.createElement('button'))
            newInteraction.classList.add('interaction')
            newInteraction.classList.add('important')
            newInteraction.innerText = (parseInt(playerId) + 1) + responseList[playerResponses[0].pack].emoji

            twemoji.parse(newInteraction)

            newInteraction.onclick = async () => {

              if (!newInteraction.classList.contains('simulatedActive')) {
                
                successAudio.load()
                successAudio.play()

                newInteraction.classList.add('simulatedActive')
                console.log()
                console.log((playerCount - parseInt(playerId)))
                if (spotlightFrame.children.length >= (playerCount - parseInt(playerId))) {
                  console.log(spotlightFrame.children[spotlightFrame.children.length - (playerCount - parseInt(playerId))])
                  spotlightFrame.children[spotlightFrame.children.length - (playerCount - parseInt(playerId))].classList.add('selected')
                  spotlightFrame.children[spotlightFrame.children.length - (playerCount - parseInt(playerId))].children[2].innerText = 'endorsed'
        
                }
                
                logReaction(myId, playerResponses[0].pack + 1)

                gameState.players[myId].endorsements[playerId] = 5

              } else {

                alertAudio.load()
                alertAudio.play()

                newInteraction.classList.remove('simulatedActive')

                if (spotlightFrame.children.length >= (playerCount - parseInt(playerId))) {

                  spotlightFrame.children[spotlightFrame.children.length - (playerCount - parseInt(playerId))].classList.remove('selected')
                  spotlightFrame.children[spotlightFrame.children.length - (playerCount - parseInt(playerId))].children[2].innerText = gameState.players[playerId].name
        
                }

                reactionsLogged[playerId] = 0

                gameState.players[myId].endorsements[playerId] = 0

              }

              sendToPeers(gameState)

            }

          }

        })

        setTimeout(function() {
          interactionPanel.classList.remove('banished')
        }, 0)

        let playerList = Object.keys(gameState.players).reverse()

        gameState.currentRound.segment = 'voting'
        gameState.currentRound.segmentTitle = 'Voting'
        gameState.currentRound.spotlight = 'Select your favourite responses from this round'
        gameState.currentRound.timeLeft = 3 * playerList.length + 5
        
        segmentText.innerText = 'Voting'
        
        playerList.forEach(function(key, keyIndex) {

          var player = gameState.players[key]

          setTimeout(function() {
            
            gameState.currentRound.player = player.id
            gameState.currentRound.playerName = player.name

            cardFrame.classList.add('banished')

            let newCard = document.createElement('div')
            newCard.classList.add('card')
            newCard.classList.add('responseCard')
            newCard.classList.add('banished')

            if (player.responses.length == 0 || responseList[player.responses[0].pack] === undefined || responseList[player.responses[0].pack].responses[player.responses[0].card] === undefined) {
              let promptString = constructPromptString(promptType, promptId)

              gameState.currentRound.spotlight = promptString
              gameState.currentRound.responses = []

              newCard.appendChild(document.createElement('p')).innerText = 'no response'
              newCard.children[0].classList.add('cardText')
              newCard.appendChild(document.createElement('p')).innerText = '📄'
              newCard.children[1].classList.add('cardEmoji')
              newCard.appendChild(document.createElement('p')).innerText = player.name
              newCard.children[2].classList.add('cardContext')

              setDynamicFrame(gameState.currentRound, 'no response')
            } else {
              let promptString = constructPromptString(promptType, promptId, [ responseList[player.responses[0].pack].responses[player.responses[0].card] ])

              gameState.currentRound.spotlight = promptString
              gameState.currentRound.responses = []
              gameState.currentRound.responses.push({
                'card': player.responses[0].card,
                'pack': player.responses[0].pack
              })

              newCard.appendChild(document.createElement('p')).innerText = responseList[player.responses[0].pack].responses[player.responses[0].card]
              newCard.children[0].classList.add('cardText')
              newCard.appendChild(document.createElement('p')).innerText = responseList[player.responses[0].pack].emoji
              newCard.children[1].classList.add('cardEmoji')
              newCard.appendChild(document.createElement('p')).innerText = player.name
              newCard.children[2].classList.add('cardContext')

              setDynamicFrame(gameState.currentRound, responseList[player.responses[0].pack].responses[player.responses[0].card])
            }

            if (interactionPanel.children[player.id].classList.contains('simulatedActive')) {
              newCard.classList.add('selected')
              newCard.children[2].innerText = 'endorsed'
            }

            spotlightFrame.style.setProperty('--numCards', Number(spotlightFrame.style.getPropertyValue('--numCards')) + 1)
            spotlightFrame.insertBefore(newCard, spotlightFrame.children[0])

            twemoji.parse(newCard.children[1])
            
            setTimeout(function() {
              newCard.classList.remove('banished')
            }, 0)

            sendToPeers(gameState);

          }, 3000 * keyIndex)

        })

        startTimer()
        
        setTimeout(function() {

          interactionPanel.classList.add('banished')

          let weightedVotes = weightVotes(gameState)

          Object.keys(weightedVotes).forEach(playerId => {
            gameState.players[playerId].votingScore += weightedVotes[playerId]
            gameState.players[playerId].endorsements = {}
          })

          sendToPeers(gameState);

          if (gameState.gameRules.votingSystem == 'score') {

            let currentLeader = 0

            Object.values(gameState.players).forEach(player => {

              if (player.votingScore > gameState.players[currentLeader].votingScore) {
                currentLeader = player.id
              }

            })

            Object.keys(gameState.players).forEach(playerId => {

              let peerIndex = Object.keys(gameState.players).indexOf(playerId)

              if (gameState.players[currentLeader].votingScore == 0) {

                playerBar.children[peerIndex].style.setProperty('--percentageOfLeadersPoints', '100%')
      
              } else {

                playerBar.children[peerIndex].style.setProperty('--percentageOfLeadersPoints', (Math.round(gameState.players[playerId].votingScore / gameState.players[currentLeader].votingScore * 100)).toString() + '%')
              
              }

              if (playerId == myId) {
                scoreText.innerText = gameState.players[playerId].votingScore
              }

            })

            roundsLeftText.innerText = (gameState.gameRules.numRounds - gameState.currentRound.roundNum) + ' rounds to go'

          } else if (gameState.gameRules.votingSystem == 'quota') {

            Object.keys(gameState.players).forEach(playerId => {

              let peerIndex = Object.keys(gameState.players).indexOf(playerId)

              playerBar.children[peerIndex].style.setProperty('--percentageOfLeadersPoints', (gameState.players[playerId].votingScore / gameState.gameRules.pointsToWin * 100).toString() + '%')

              if (playerId == myId) {
                scoreText.innerText = gameState.players[playerId].votingScore
              }
              
            })

            roundsLeftText.innerText = 'out of ' + gameState.gameRules.pointsToWin + 'pts to win'

          }

          controlBar.classList.add('opened')
          playerBar.classList.add('opened')
          
          setTimeout(function() {

            gameState.currentRound.roundNum++

            let highestScore = 0

            Object.keys(gameState.players).forEach(function(player) {

              if (gameState.players[highestScore].votingScore < gameState.players[player].votingScore) {
                highestScore = player
              }

            })

            if (gameState.gameRules.votingSystem == 'score' && gameState.currentRound.roundNum <= gameState.gameRules.numRounds) {

              gameState.currentRound.segment = 'reveal'
              gameState.currentRound.segmentTitle = 'Reveal'
              gameState.currentRound.spotlight = ''
              gameState.currentRound.timeLeft = 0

              segmentText.innerText = 'Reveal'

              playerList.forEach(function(player) {

                gameState.players[player].ready = false
      
                let peerIndex = Object.keys(gameState.players).indexOf('' + player + '')
      
                playerBar.children[peerIndex].children[2].classList.add('banished')
      
              })
      
              readyButton.removeAttribute('disabled')

              sendToPeers(gameState);

            } else if (gameState.gameRules.votingSystem == 'quota' && gameState.players[highestScore].votingScore < gameState.gameRules.pointsToWin) {
              
              gameState.currentRound.segment = 'reveal'
              gameState.currentRound.segmentTitle = 'Reveal'
              gameState.currentRound.spotlight = ''
              gameState.currentRound.timeLeft = 0

              segmentText.innerText = 'Reveal'

              playerList.forEach(function(player) {

                gameState.players[player].ready = false
      
                let peerIndex = Object.keys(gameState.players).indexOf('' + player + '')
      
                playerBar.children[peerIndex].children[2].classList.add('banished')
      
              })
      
              readyButton.removeAttribute('disabled')

              sendToPeers(gameState);

            } else {
              
              Object.keys(spotlightFrame.children).forEach(function(child) {
                spotlightFrame.children[0].remove()
              })

              gameState.currentRound.segment = 'podium'
              gameState.currentRound.segmentTitle = 'Podium'
              gameState.currentRound.timeLeft = 5

              if (gameState.gameRules.votingSystem == 'score') {
                gameState.currentRound.spotlight = gameState.players[highestScore].name + ' is the winner.'
              } else if (gameState.gameRules.votingSystem == 'quota') {
                gameState.currentRound.spotlight = gameState.players[highestScore].name + ' is the winner.'
              }

              segmentText.innerText = 'Podium'

              // Announce winners or whatever
              
              setDynamicFrame(gameState.currentRound)

              sendToPeers(gameState);

              startTimer()

              setTimeout(function() {

                disconnectPeers()

                preGameFrame.classList.add('banished')
                gameFrame.classList.add('banished')
                disconnectFrame.classList.remove('banished')

                controlBar.classList.remove('opened')
                interactionPanel.classList.add('banished')
                playerBar.classList.remove('opened')

              }, 6000)

            }

          }, 0)

        }, 3000 * playerList.length + 6000)

      }, 16000)

    }, 4000)
  
  }


  // P A R T  2



  async function newPeer() {

    let newPc = new RTCPeerConnection(servers);

    // Create channel to send other (non-media) data

    let playerId = gameState.players[Object.keys(gameState.players).length - 1].id + 1

    let newChannel = newPc.createDataChannel(playerId);

    newChannel.onopen = (event) => {
      
      peerConnections[playerId] = newPc
      peerChannels[playerId] = newChannel

      gameState.players[playerId] = ({
        id: playerId,
        name: 'Player ' + singleDigits[playerId + 1],
        ready: false,
        responses: [],
        responseString: generateResponseString(),
        endorsements: {},
        votingScore: 0,
      })

      if (Object.keys(gameState.players).length >= minPlayers && gameState.currentRound.segment == 'lobby') {
        
        let newPlayerMarker = document.createElement('div')
        newPlayerMarker.classList.add('playerMarker')
        let newPlayerIcon = document.createElement('p')
        newPlayerIcon.innerText = gameState.players[playerId].name[0]
        newPlayerMarker.appendChild(newPlayerIcon)
        let newPlayerLabel = document.createElement('p')
        newPlayerLabel.innerText = gameState.players[playerId].name
        newPlayerMarker.appendChild(newPlayerLabel)
        let newPlayerIndicator = document.createElement('img')
        if (!document.documentElement.classList.contains('dev')) {
          newPlayerIndicator.src = '/icons/ready.png'
        } else {
          newPlayerIndicator.src = '/icons/ready2.png'
        }
        newPlayerIndicator.classList.add('banished')
        newPlayerIndicator.classList.add('icon')
        newPlayerMarker.appendChild(newPlayerIndicator)
        
        playerBar.appendChild(newPlayerMarker)
        
      } else if (gameState.currentRound.segment == 'lobby') {

        let newPlayerMarker = document.createElement('div')
        newPlayerMarker.classList.add('playerMarker')
        let newPlayerIcon = document.createElement('p')
        newPlayerIcon.innerText = gameState.players[playerId].name[0]
        newPlayerMarker.appendChild(newPlayerIcon)
        let newPlayerLabel = document.createElement('p')
        newPlayerLabel.innerText = gameState.players[playerId].name
        newPlayerMarker.appendChild(newPlayerLabel)
        let newPlayerIndicator = document.createElement('img')
        if (!document.documentElement.classList.contains('dev')) {
          newPlayerIndicator.src = '/icons/ready.png'
        } else {
          newPlayerIndicator.src = '/icons/ready2.png'
        }
        newPlayerIndicator.classList.add('banished')
        newPlayerIndicator.classList.add('icon')
        newPlayerMarker.appendChild(newPlayerIndicator)
        
        playerBar.appendChild(newPlayerMarker)
        
        newPeer()

      }

      sendToPeers(gameState);
    }

    newChannel.onmessage = (event) => {
      
      const parsedGameState = parseGameState(event.data, gameState, playerId)
      
      if (gameState.players[playerId]) {

        Object.entries(parsedGameState.players[playerId].endorsements).forEach(([endorsedPlayerId, endorsedPlayerAmount]) => {

          if (endorsedPlayerAmount > gameState.players[playerId].endorsements[endorsedPlayerId] && playerId != myId) {

            let playerResponses = parsedGameState.players[endorsedPlayerId].responses

            if (playerResponses.length == 0 || responseList[playerResponses[0].pack] === undefined || responseList[playerResponses[0].pack].responses[playerResponses[0].card] === undefined) {
              logReaction(playerId, 0)
            } else {
              logReaction(playerId, playerResponses[0].pack + 1)
            }
            
          }

        })
      
      }

      let allPlayersReadied = true

      Object.values(parsedGameState.players).forEach(player => {
        
        if (player.ready == false) {
          allPlayersReadied = false
        }

      })
      
      gameState = parsedGameState

      sendToPeers(gameState);
      
      if (allPlayersReadied == true && Object.keys(parsedGameState.players).length >= minPlayers && parsedGameState.currentRound.segment == 'lobby') {

        runGame()

      } else if (allPlayersReadied == true && parsedGameState.currentRound.segment == 'reveal') {

        runRound()

      } else if (allPlayersReadied == true && Object.keys(parsedGameState.players).length >= minPlayers && parsedGameState.currentRound.segment == 'podium') {

        runGame()

      }

    }

    newChannel.onclosing = (event) => {
      sendToPeers(gameState)
    }

    // Get candidates for caller, save to db
    newPc.onicecandidate = (event) => {
      if (event.candidate != null) {
        let candidate = event.candidate.toJSON()
        candidate.uid = auth.getAuth().currentUser.uid
        firestore.addDoc(offerCandidates, candidate);
      }
    };

    // Create offer
    let offerDescription = await newPc.createOffer();
    offerDescription.sdp = offerDescription.sdp.replace('s=-', 's=heavy-handed v' + majorVersion)
    await newPc.setLocalDescription(offerDescription);

    let offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };
    
    await firestore.setDoc(callDoc, { offer });

    // Listen for remote answer
    firestore.onSnapshot(callDoc, (snapshot) => {
      let data = snapshot.data();
      let sdp = data?.answer?.sdp
      if (!newPc.currentRemoteDescription && data?.answer && sdp.substring(sdp.search('heavy-handed') + 14, sdp.search('heavy-handed') + 17) == majorVersion) { // On answer
        
        let answerDescription = new RTCSessionDescription(data.answer);
        newPc.setRemoteDescription(answerDescription);

      } else if (!newPc.currentRemoteDescription && data?.answer) { // Currently defunct, as newer clients quit peer connection upon realising they are joining an invalid room.
        
        if (+sdp.substring(sdp.search('heavy-handed') + 14, sdp.search('heavy-handed') + 17) == NaN || sdp.substring(sdp.search('heavy-handed') + 15, sdp.search('heavy-handed') + 16) != '.') {

          addNotification('An invalid client tried to join your room.')
  
        } else if (+sdp.substring(sdp.search('heavy-handed') + 14, sdp.search('heavy-handed') + 17) < majorVersion.substring(2)) {
  
          addNotification('A client on an outdated version (' + sdp.substring(sdp.search('heavy-handed') + 14, sdp.search('heavy-handed') + 17) + ') tried to join your room.')
  
        } else if (+sdp.substring(sdp.search('heavy-handed') + 14, sdp.search('heavy-handed') + 17) > majorVersion.substring(2)) {
  
          addNotification('A client on a newer version (' + sdp.substring(sdp.search('heavy-handed') + 14, sdp.search('heavy-handed') + 17) + ') tried to join your room.')
  
        }

      }
    });

    // When answered, add candidate to peer connection
    firestore.onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          let candidate = new RTCIceCandidate(change.doc.data());
          //newPc.addIceCandidate(candidate);
        }
      });
    });

  }
  
  newPeer()

};



// 3. Answer the call with the unique ID
joinButton.onclick = async () => {

  neutralAudio.load()
  neutralAudio.play()

  callId = joinInput.value.toLowerCase().trim();

  if (callId != '') {

    var callDoc = await firestore.doc(db, "calls", callId)

  }
  
  if (callDoc != null) {

    joinInput.setAttribute('disabled', true)
    joinButton.setAttribute('disabled', true)
    callButton.setAttribute('disabled', true)



    // P A R T  2



    let newPc = new RTCPeerConnection(servers);

    newPc.onconnectionstatechange = async () => {

      if (newPc.connectionState == 'disconnected' || newPc.connectionState == 'failed') {

        disconnectPeers()

        preGameFrame.classList.add('banished')
        gameFrame.classList.add('banished')
        disconnectFrame.classList.remove('banished')

        controlBar.classList.remove('opened')
        interactionPanel.classList.add('banished')
        playerBar.classList.remove('opened')
  
      }
  
    }


    // Respond to new data channel
    newPc.ondatachannel = (event) => {
      
      myId = (event.channel.label)

      let hostChannel = event.channel
      
      event.channel.onopen = (event) => {
        peerChannels[0] = hostChannel
        peerConnections[0] = newPc
      }

      hostChannel.onmessage = (event) => {
        
        let parsedGameState = JSON.parse(event.data)

        if (!parsedGameState.players) {
          
          parsedGameState = parseGameState(event.data, gameState, 0)

        }

        let prevPlayers = Object.keys(gameState.players)
        let newPlayers = Object.keys(parsedGameState.players)

        newPlayers.forEach(playerId => {
          
          if (gameState.players[playerId]) {
            
            Object.entries(parsedGameState.players[playerId].endorsements).forEach(([endorsedPlayerId, endorsedPlayerAmount]) => {
              
              if (endorsedPlayerAmount > gameState.players[playerId].endorsements[endorsedPlayerId] && playerId != myId) {

                let playerResponses = parsedGameState.players[endorsedPlayerId].responses

                if (playerResponses.length == 0 || responseList[playerResponses[0].pack] === undefined || responseList[playerResponses[0].pack].responses[playerResponses[0].card] === undefined) {
                  logReaction(playerId, 0)
                } else {
                  logReaction(playerId, playerResponses[0].pack + 1)
                }

              }

            })

          }

        })
        
        if (prevPlayers.length == 0) {

          nameText.innerText = parsedGameState.players[myId].name

          if (parsedGameState.gameRules.votingSystem == 'score') {
            scoreText.innerText = '0'
            roundsLeftText.innerText = 'Most endorsements after ' + parsedGameState.gameRules.numRounds + ' rounds wins'
          } else if (parsedGameState.gameRules.votingSystem == 'quota') {
            scoreText.innerText = '0'
            roundsLeftText.innerText = 'First to ' + parsedGameState.gameRules.pointsToWin + 'pts wins'
          }

          nameInput.placeholder = parsedGameState.players[myId].name

          leaveButton.removeAttribute('disabled')
          readyButton.removeAttribute('disabled')
          nameInput.removeAttribute('disabled')

          Object.keys(playerBar.children).forEach((child) => {
            playerBar.children[0].remove()
          })
          
          newPlayers.forEach((playerId) => {
            let newPlayerMarker = document.createElement('div')
            newPlayerMarker.classList.add('playerMarker')
            let newPlayerIcon = document.createElement('p')
            newPlayerIcon.innerText = parsedGameState.players[playerId].name[0]
            newPlayerMarker.appendChild(newPlayerIcon)
            let newPlayerLabel = document.createElement('p')
            newPlayerLabel.innerText = parsedGameState.players[playerId].name
            newPlayerMarker.appendChild(newPlayerLabel)
            let newPlayerIndicator = document.createElement('img')
            if (!document.documentElement.classList.contains('dev')) {
              newPlayerIndicator.src = '/icons/ready.png'
            } else {
              newPlayerIndicator.src = '/icons/ready2.png'
            }
            newPlayerIndicator.classList.add('banished')
            newPlayerIndicator.classList.add('icon')
            newPlayerMarker.appendChild(newPlayerIndicator)
            
            playerBar.appendChild(newPlayerMarker)

            if (parsedGameState.players[playerId].ready == true) {
              newPlayerIndicator.classList.remove('banished')
            }
          })
          
          controlBar.classList.add('opened')
          playerBar.classList.remove('banished')
          playerBar.classList.add('opened')

          preGameFrame.classList.add('banished')
          gameFrame.classList.remove('banished')

          setDynamicFrame(parsedGameState.currentRound)

        } else if (newPlayers.length > prevPlayers.length) {

          let newPlayerMarker = document.createElement('div')
          newPlayerMarker.classList.add('playerMarker')
          let newPlayerIcon = document.createElement('p')
          newPlayerIcon.innerText = parsedGameState.players[newPlayers.length - 1].name[0]
          newPlayerMarker.appendChild(newPlayerIcon)
          let newPlayerLabel = document.createElement('p')
          newPlayerLabel.innerText = parsedGameState.players[newPlayers.length - 1].name
          newPlayerMarker.appendChild(newPlayerLabel)
          let newPlayerIndicator = document.createElement('img')
          if (!document.documentElement.classList.contains('dev')) {
            newPlayerIndicator.src = '/icons/ready.png'
          } else {
            newPlayerIndicator.src = '/icons/ready2.png'
          }
          newPlayerIndicator.classList.add('banished')
          newPlayerIndicator.classList.add('icon')
          newPlayerMarker.appendChild(newPlayerIndicator)
          
          playerBar.appendChild(newPlayerMarker)

        } else if (newPlayers.length < prevPlayers.length) {

          prevPlayers.forEach(playerId => {

            if (!parsedGameState.players[playerId]) {
              let peerIndex = prevPlayers.indexOf(playerId)
              playerBar.children[peerIndex].remove()
            }

          })

        } else {

          newPlayers.forEach(playerId => {

            let peerIndex = newPlayers.indexOf(playerId)

            if (playerId == myId) {
              nameText.innerText = parsedGameState.players[playerId].name
            }

            playerBar.children[peerIndex].children[0].innerText = parsedGameState.players[playerId].name[0]
            playerBar.children[peerIndex].children[1].innerText = parsedGameState.players[playerId].name

            if (parsedGameState.players[playerId].ready == true) {
              playerBar.children[peerIndex].children[2].classList.remove('banished')
            } else {
              playerBar.children[peerIndex].children[2].classList.add('banished')
            }

          })
          
        }

        if (parsedGameState.currentRound.segment != gameState.currentRound.segment) {

          if (parsedGameState.currentRound.segment == 'lobby' || parsedGameState.currentRound.segment == 'podium') {

            controlBar.classList.add('opened')
            playerBar.classList.add('opened')

            readyButton.removeAttribute('disabled')

            setDynamicFrame(parsedGameState.currentRound)

          } else {

            controlBar.classList.remove('opened')
            playerBar.classList.remove('opened')
            readyButton.setAttribute('disabled', true)

          }
          
          if (parsedGameState.currentRound.segment == 'prompt') {

            Object.keys(spotlightFrame.children).forEach(function(child) {
              spotlightFrame.children[0].remove()
            })

            if (parsedGameState.currentRound.promptType == 0) {
              setDynamicFrame(parsedGameState.currentRound, promptList[parsedGameState.currentRound.promptType].prompts[parsedGameState.currentRound.promptId])
            } else if (parsedGameState.currentRound.promptType == 1) {
              setDynamicFrame(parsedGameState.currentRound, promptList[parsedGameState.currentRound.promptType].prompts[parsedGameState.currentRound.promptId].description)
            } else if (parsedGameState.currentRound.promptType == 2) {
              setDynamicFrame(parsedGameState.currentRound, promptList[parsedGameState.currentRound.promptType].prompts[parsedGameState.currentRound.promptId].setup.join(','))
            } else if (parsedGameState.currentRound.promptType == 3) {
              setDynamicFrame(parsedGameState.currentRound, promptList[parsedGameState.currentRound.promptType].prompts[parsedGameState.currentRound.promptId])
            } else {
              setDynamicFrame(parsedGameState.currentRound, promptList[parsedGameState.currentRound.promptType].prompts[parsedGameState.currentRound.promptId])
            }

          }

          if (parsedGameState.currentRound.segment == 'response') {

            if (parsedGameState.currentRound.promptType == 0) {
              musicAudio.src = '/sounds/music/upbeat.mp3'            
            } else if (parsedGameState.currentRound.promptType == 1) {
              musicAudio.src = '/sounds/music/heavenly.mp3'
            } else if (parsedGameState.currentRound.promptType == 2) {
              musicAudio.src = '/sounds/music/gritty.mp3'
            } else if (parsedGameState.currentRound.promptType == 3) {
              musicAudio.src = '/sounds/music/lowkey.mp3'
            } else {
              musicAudio.src = '/sounds/music/upbeat.mp3'
            }
            
            musicAudio.load()
            musicAudio.play()
  
            Object.keys(cardFrame.children).forEach((child) => {
              cardFrame.children[0].remove()
            })
  
            let i = 1
            let responsePackChosen = parseInt((parsedGameState.players[myId].responseString).charAt(7 * parsedGameState.currentRound.roundNum - 7), Object.keys(responseList).length)
            let responsesChosen = []
  
            let messagePayload = {
              responses: []
            }
  
            cardFrame.style.setProperty('--numCards', 0)
  
            while (i <= 6) {
  
              let responseId = parseInt((parsedGameState.players[myId].responseString).charAt(7 * parsedGameState.currentRound.roundNum - 7 + i), 25)
    
              responsesChosen.push(responseId)
              
              let newCard = cardFrame.appendChild(document.createElement('div'))
              newCard.classList.add('card')
              newCard.appendChild(document.createElement('p')).innerText = responseList[responsePackChosen].responses[responseId]
              newCard.children[0].classList.add('cardText')
              newCard.appendChild(document.createElement('p')).innerText = responseList[responsePackChosen].emoji
              newCard.children[1].classList.add('cardEmoji')
              newCard.appendChild(document.createElement('p')).innerText = ''
              newCard.children[2].classList.add('cardContext')
  
              twemoji.parse(newCard)
    
              newCard.onclick = async () => {
  
                neutralAudio.load()
                neutralAudio.play()
  
                Object.values(newCard.parentElement.children).forEach((card) => {
  
                  card.classList.remove('selected')
                  card.children[2].innerText = ''
    
                })
    
                newCard.classList.add('selected')
                newCard.children[2].innerText = 'selected'
                
                messagePayload.responses[0] = {
                  card: responseId,
                  pack: responsePackChosen
                }
  
                sendToPeers(messagePayload)
    
              }
  
              cardFrame.style.setProperty('--numCards', Number(cardFrame.style.getPropertyValue('--numCards')) + 1)
    
              i++
    
            }
  
            setTimeout(function() {
              cardFrame.classList.remove('banished')
            }, 0)
            
          }

          if (parsedGameState.currentRound.segment == 'voting') {

            spotlightFrame.style.setProperty('--numCards', 0)

            Object.keys(interactionPanel.children).forEach((child) => {
              interactionPanel.children[0].remove()
            })
            
            setTimeout(function() {
              interactionPanel.classList.remove('banished')
            }, 0)
  
            reactionsLogged = {}

            let playerCount = Object.keys(parsedGameState.players).length

            Object.keys(parsedGameState.players).forEach(function(playerId) {
              
              parsedGameState.players[playerId].endorsements = {}
  
              let playerResponses = parsedGameState.players[playerId].responses
  
              if (playerResponses.length == 0 || responseList[playerResponses[0].pack] === undefined || responseList[playerResponses[0].pack].responses[playerResponses[0].card] === undefined) {
  
                let newInteraction = interactionPanel.appendChild(document.createElement('button'))
                newInteraction.classList.add('interaction')
                newInteraction.classList.add('important')
                newInteraction.innerText = (parseInt(playerId) + 1) + '📄'
  
                twemoji.parse(newInteraction)
  
                newInteraction.onclick = async () => {
  
                  if (!newInteraction.classList.contains('simulatedActive')) {
                
                    successAudio.load()
                    successAudio.play()
    
                    newInteraction.classList.add('simulatedActive')

                    if (spotlightFrame.children.length >= (playerCount - parseInt(playerId))) {

                      spotlightFrame.children[spotlightFrame.children.length - (playerCount - parseInt(playerId))].classList.add('selected')
                      spotlightFrame.children[spotlightFrame.children.length - (playerCount - parseInt(playerId))].children[2].innerText = 'endorsed'
            
                    }
                    
                    logReaction(myId, 0)

                    reactionsLogged[playerId] = 5
    
                  } else {
    
                    alertAudio.load()
                    alertAudio.play()
    
                    newInteraction.classList.remove('simulatedActive')

                    if (spotlightFrame.children.length >= (playerCount - parseInt(playerId))) {

                      spotlightFrame.children[spotlightFrame.children.length - (playerCount - parseInt(playerId))].classList.remove('selected')
                      spotlightFrame.children[spotlightFrame.children.length - (playerCount - parseInt(playerId))].children[2].innerText = parsedGameState.players[playerId].name
            
                    }

                    reactionsLogged[playerId] = 0
    
                  }

                  sendToPeers({
                    endorsements: reactionsLogged
                  })
  
                }
  
              } else {
  
                let newInteraction = interactionPanel.appendChild(document.createElement('button'))
                newInteraction.classList.add('interaction')
                newInteraction.classList.add('important')
                newInteraction.innerText = (parseInt(playerId) + 1) + responseList[playerResponses[0].pack].emoji
  
                twemoji.parse(newInteraction)
  
                newInteraction.onclick = async () => {
                  
                  if (!newInteraction.classList.contains('simulatedActive')) {
                
                    successAudio.load()
                    successAudio.play()
    
                    newInteraction.classList.add('simulatedActive')

                    if (spotlightFrame.children.length >= (playerCount - parseInt(playerId))) {

                      spotlightFrame.children[spotlightFrame.children.length - (playerCount - parseInt(playerId))].classList.add('selected')
                      spotlightFrame.children[spotlightFrame.children.length - (playerCount - parseInt(playerId))].children[2].innerText = 'endorsed'
            
                    }
                    
                    logReaction(myId, playerResponses[0].pack + 1)

                    reactionsLogged[playerId] = 5
    
                  } else {
    
                    alertAudio.load()
                    alertAudio.play()
    
                    newInteraction.classList.remove('simulatedActive')

                    if (spotlightFrame.children.length >= (playerCount - parseInt(playerId))) {

                      spotlightFrame.children[spotlightFrame.children.length - (playerCount - parseInt(playerId))].classList.remove('selected')
                      spotlightFrame.children[spotlightFrame.children.length - (playerCount - parseInt(playerId))].children[2].innerText = parsedGameState.players[playerId].name
            
                    }

                    reactionsLogged[playerId] = 0
    
                  }

                  sendToPeers({
                    endorsements: reactionsLogged
                  })
  
                }
  
              }
  
            })

          }

          if (parsedGameState.currentRound.segment == 'reveal' || parsedGameState.currentRound.segment == 'podium') {

            segmentText.innerText = parsedGameState.currentRound.segmentTitle

            if (parsedGameState.gameRules.votingSystem == 'score') {

              let currentLeader = 0

              Object.values(parsedGameState.players).forEach(player => {

                if (player.votingScore > parsedGameState.players[currentLeader].votingScore) {
                  currentLeader = player.id
                }

              })

              Object.keys(parsedGameState.players).forEach(playerId => {

                let peerIndex = Object.keys(parsedGameState.players).indexOf(playerId)
    
                if (parsedGameState.players[currentLeader].votingScore == 0) {

                  playerBar.children[peerIndex].style.setProperty('--percentageOfLeadersPoints', '100%')

                } else {

                  playerBar.children[peerIndex].style.setProperty('--percentageOfLeadersPoints', (Math.round(parsedGameState.players[playerId].votingScore / parsedGameState.players[currentLeader].votingScore * 100)).toString() + '%')
                
                }

                if (playerId == myId) {
                  scoreText.innerText = parsedGameState.players[playerId].votingScore
                }

              })

              roundsLeftText.innerText = (parsedGameState.gameRules.numRounds - parsedGameState.currentRound.roundNum + 1) + ' rounds to go'

            } else if (parsedGameState.gameRules.votingSystem == 'quota') {

              Object.keys(parsedGameState.players).forEach(playerId => {
  
                let peerIndex = Object.keys(parsedGameState.players).indexOf(playerId)
                
                playerBar.children[peerIndex].style.setProperty('--percentageOfLeadersPoints', (parsedGameState.players[playerId].votingScore / parsedGameState.gameRules.pointsToWin * 100).toString() + '%')

                if (playerId == myId) {
                  scoreText.innerText = parsedGameState.players[playerId].votingScore
                }

              })

              roundsLeftText.innerText = 'out of ' + parsedGameState.gameRules.pointsToWin + 'pts to win'
  
            }

            controlBar.classList.add('opened')
            interactionPanel.classList.add('banished')
            playerBar.classList.add('opened')

            readyButton.removeAttribute('disabled')

          }

        }

        if (parsedGameState.currentRound.timeLeft > 0 && (gameState.currentRound.timeLeft != parsedGameState.currentRound.timeLeft)) {

          let timeLeft = parsedGameState.currentRound.timeLeft

          segmentText.innerText = parsedGameState.currentRound.segmentTitle

          setTimeout(() => {

            segmentText.classList.add('i')
            segmentText.innerText = parsedGameState.currentRound.segmentTitle + ' • ' + timeLeft + 's'
  
            var timer = setInterval(function() {

              timeLeft--

              if (timeLeft <= 0) {
                clearInterval(timer)
                
                segmentText.classList.remove('i')
                segmentText.innerText = parsedGameState.currentRound.segmentTitle

              } else {
                segmentText.innerText = parsedGameState.currentRound.segmentTitle + ' • ' + timeLeft + 's'
              }

            }, 1000)

          }, 800)

        }
        
        if (parsedGameState.currentRound.segment == 'voting' && (gameState.currentRound.segment != 'voting' || parsedGameState.currentRound.player != gameState.currentRound.player)) {

          cardFrame.classList.add('banished')

          let player = parsedGameState.players[parsedGameState.currentRound.player]

          let newCard = document.createElement('div')
          newCard.classList.add('card')
          newCard.classList.add('responseCard')
          newCard.classList.add('banished')

          if (player.responses.length == 0 || responseList[player.responses[0].pack] === undefined || responseList[player.responses[0].pack].responses[player.responses[0].card] === undefined) {
                       
            newCard.appendChild(document.createElement('p')).innerText = 'no response'
            newCard.children[0].classList.add('cardText')
            newCard.appendChild(document.createElement('p')).innerText = '📄'
            newCard.children[1].classList.add('cardEmoji')
            newCard.appendChild(document.createElement('p')).innerText = player.name
            newCard.children[2].classList.add('cardContext')

            setDynamicFrame(parsedGameState.currentRound, 'no response')

          } else {
            
            newCard.appendChild(document.createElement('p')).innerText = responseList[player.responses[0].pack].responses[player.responses[0].card]
            newCard.children[0].classList.add('cardText')
            newCard.appendChild(document.createElement('p')).innerText = responseList[player.responses[0].pack].emoji
            newCard.children[1].classList.add('cardEmoji')
            newCard.appendChild(document.createElement('p')).innerText = player.name
            newCard.children[2].classList.add('cardContext')

            setDynamicFrame(parsedGameState.currentRound, responseList[player.responses[0].pack].responses[player.responses[0].card])

          }

          if (interactionPanel.children[player.id].classList.contains('simulatedActive')) {
            newCard.classList.add('selected')
            newCard.children[2].innerText = 'endorsed'
          }

          spotlightFrame.style.setProperty('--numCards', Number(spotlightFrame.style.getPropertyValue('--numCards')) + 1)
          spotlightFrame.insertBefore(newCard, spotlightFrame.children[0])
          
          twemoji.parse(newCard.children[1])

          setTimeout(function() {
            newCard.classList.remove('banished')
          }, 0)

        } else if (parsedGameState.currentRound.segment == 'podium') {

          segmentText.innerText = parsedGameState.currentRound.segmentTitle
          setDynamicFrame(parsedGameState.currentRound)

          Object.keys(spotlightFrame.children).forEach(function(child) {
            spotlightFrame.children[0].remove()
          })

          interactionPanel.classList.add('banished')

        } else if (parsedGameState.currentRound.segment == 'lobby') {

          segmentText.innerText = parsedGameState.currentRound.segmentTitle

          Object.keys(spotlightFrame.children).forEach(function(child) {
            spotlightFrame.children[0].remove()
          })

          interactionPanel.classList.add('banished')

        } else if (parsedGameState.currentRound.segment == 'prompt') {


        }

        if (parsedGameState.currentRound.segment == 'response' && gameState.currentRound.segment != 'response') {

          

        }

        gameState = parsedGameState

      }

    }

    const answerCandidates = firestore.collection(callDoc, 'answerCandidates');
    const offerCandidates = firestore.collection(callDoc, 'offerCandidates');

    newPc.onicecandidate = (event) => {
      if (event.candidate != null) {
        let candidate = event.candidate.toJSON()
        candidate.uid = auth.getAuth().currentUser.uid
        firestore.addDoc(answerCandidates, candidate);
      }
    };

    const callData = (await firestore.getDoc(callDoc)).data();
    
    if (callData == undefined) {

      disconnectPeers()

      preGameFrame.classList.add('banished')
      gameFrame.classList.add('banished')
      disconnectFrame.classList.remove('banished')

      controlBar.classList.remove('opened')
      interactionPanel.classList.add('banished')
      playerBar.classList.remove('opened')

    } else if (callData) {
          
      const offerDescription = callData.offer;

      let sdp = offerDescription.sdp
      
      if (sdp.substring(sdp.search('heavy-handed') + 14, sdp.search('heavy-handed') + 17) == majorVersion) {

        await newPc.setRemoteDescription(new RTCSessionDescription(offerDescription));
        
        const answerDescription = await newPc.createAnswer();
        answerDescription.sdp = answerDescription.sdp.replace('s=-', 's=heavy-handed v' + majorVersion)
        await newPc.setLocalDescription(answerDescription);
        
        const answer = {
          sdp: answerDescription.sdp,
          type: answerDescription.type,
        };

        await firestore.updateDoc(callDoc, { answer });
        
        firestore.onSnapshot(offerCandidates, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              let data = change.doc.data();
              newPc.addIceCandidate(new RTCIceCandidate(data));
            }
          });
        });

      } else {

        newPc.close()

        joinInput.removeAttribute('disabled')
        joinButton.removeAttribute('disabled')
        callButton.removeAttribute('disabled')

        if (+sdp.substring(sdp.search('heavy-handed') + 14, sdp.search('heavy-handed') + 17) == NaN || sdp.substring(sdp.search('heavy-handed') + 15, sdp.search('heavy-handed') + 16) != '.') {

          addNotification('This room is running an invalid version.')

        } else if (+sdp.substring(sdp.search('heavy-handed') + 14, sdp.search('heavy-handed') + 17) < majorVersion.substring(2)) {

          addNotification('This room is running an older version (' + sdp.substring(sdp.search('heavy-handed') + 14, sdp.search('heavy-handed') + 17) + '). Ask the host to update.')

        } else if (+sdp.substring(sdp.search('heavy-handed') + 14, sdp.search('heavy-handed') + 17) > majorVersion.substring(2)) {

          addNotification('This room is running a newer version (' + sdp.substring(sdp.search('heavy-handed') + 14, sdp.search('heavy-handed') + 17) + '). Please update in order to join.')

        }

      }
    
    }

  }

};



leaveButton.onclick = async () => {

  successAudio.load()
  successAudio.play()

  if (myId == 0) {

    disconnectPeers()

  } else {

    disconnectPeers()

  }

  gameState = initialGameState

  preGameFrame.classList.remove('banished')
  gameFrame.classList.add('banished')
  disconnectFrame.classList.add('banished')

  joinInput.value = ''
  joinInput.removeAttribute('disabled')
  joinButton.removeAttribute('disabled')
  callButton.removeAttribute('disabled')

  playerBar.classList.add('banished')
  interactionPanel.classList.add('banished')

  nameInput.placeholder = ''

  leaveButton.setAttribute('disabled', true)
  readyButton.setAttribute('disabled', true)
  nameInput.setAttribute('disabled', true)

  Object.keys(spotlightFrame.children).forEach(function(child) {
    spotlightFrame.children[0].remove()
  })

}

readyButton.onclick = async () => {

  successAudio.load()
  successAudio.play()

  readyButton.setAttribute('disabled', true)

  if (myId == 0) {

    gameState.players[myId].ready = true
    playerBar.children[myId].children[2].classList.remove('banished')

    sendToPeers(gameState);

    let allPlayersReadied = true

    Object.values(gameState.players).forEach(player => {
      
      if (player.ready == false) {
        allPlayersReadied = false
      }

    })

    if (allPlayersReadied == true && gameState.currentRound.segment == 'reveal') {

      runRound()

    }

  } else {

    sendToPeers({
      ready: true
    })

  }

}

nameInput.onchange = async (event) => {

  if (nameInput.value.length <= 14 && (nameInput.value).trim() != '') {

    if (myId == 0) {

      gameState.players[myId].name = (nameInput.value).trim()
      nameText.innerText = (nameInput.value).trim()
      playerBar.children[myId].children[0].innerText = (nameInput.value).trim()[0]
      playerBar.children[myId].children[1].innerText = (nameInput.value).trim()

      sendToPeers(gameState);

    } else {

      sendToPeers({
        name: (nameInput.value).trim()
      })

    }

  } else if ((nameInput.value).trim() == '') {

    if (myId == 0) {

      gameState.players[myId].name = nameInput.placeholder
      nameText.innerText = nameInput.placeholder
      playerBar.children[myId].children[0].innerText = nameInput.placeholder[0]
      playerBar.children[myId].children[1].innerText = nameInput.placeholder

      sendToPeers(gameState);

    } else {

      sendToPeers({
        name: nameInput.placeholder
      })

    }

  } else {

    nameInput.value = gameState.players[myId].name
 
  }
  
}

muteButton.onclick = async () => {

  if (globalVolume == 0) {
    
    successAudio.load()
    successAudio.play()

    globalVolume = 1

    muteButton.innerText = 'mute'

  } else {

    globalVolume = 0

    window.speechSynthesis.cancel()

    muteButton.innerText = 'unmute'

  }

  successAudio.volume = globalVolume / 12
  alertAudio.volume = globalVolume / 12
  neutralAudio.volume = globalVolume / 12
  musicAudio.volume = globalVolume / 10

}



dismissButton.onclick = async () => {

  neutralAudio.load()
  neutralAudio.play()

  gameState = initialGameState

  preGameFrame.classList.remove('banished')
  disconnectFrame.classList.add('banished')
  
  joinInput.value = ''
  joinInput.removeAttribute('disabled')
  joinButton.removeAttribute('disabled')
  callButton.removeAttribute('disabled')

  playerBar.classList.add('banished')
  interactionPanel.classList.add('banished')

  nameInput.placeholder = ''

  leaveButton.setAttribute('disabled', true)
  readyButton.setAttribute('disabled', true)
  nameInput.setAttribute('disabled', true)

  Object.keys(spotlightFrame.children).forEach(function(child) {
    spotlightFrame.children[0].remove()
  })

}



var keysDown = []

onkeydown = async (event) => {

  if (!keysDown.find(value => { return value == event.key })) {

    keysDown.push(event.key)
    
    if (!preGameFrame.classList.contains('banished') && event.key == 'v' && keysDown.find(value => { return value == 'd' }) && keysDown.find(value => { return value == 'e' }) && keysDown.findIndex(value => { return value == 'd' }) < keysDown.findIndex(value => { return value == 'e' })) {

      document.documentElement.classList.add('dev')

      gameTitle.innerText = '¶ dev'
      gameContext.innerText = '[ dee-ee-vee ] • developer edition'
      gameDescription.innerText = 'running version ' + majorVersion + '.' + minorVersion

      readyButton.children[0].src = '/icons/ready2.png'

      gameState.gameRules.votingSystem = 'quota'

    }

    if (gameState.currentRound.segment == 'voting' && Object.keys(gameState.players).includes((parseInt(event.key) - 1).toString())) {

      let player = gameState.players[parseInt(event.key) - 1]

      if (!reactionsLogged[parseInt(event.key) - 1]) {
        reactionsLogged[parseInt(event.key) - 1] = 1
      } else {
        reactionsLogged[parseInt(event.key) - 1] += 1
      }

      if (reactionsLogged[parseInt(event.key) - 1] == 5) {

        let playerCount = Object.keys(gameState.players).length

        successAudio.load()
        successAudio.play()

        interactionPanel.children[parseInt(event.key) - 1].classList.add('simulatedActive')

        if (spotlightFrame.children.length >= (playerCount - (parseInt(event.key) - 1))) {

          spotlightFrame.children[spotlightFrame.children.length - (playerCount - (parseInt(event.key) - 1))].classList.add('selected')
          spotlightFrame.children[spotlightFrame.children.length - (playerCount - (parseInt(event.key) - 1))].children[2].innerText = 'endorsed'

        }
        
        if (player.responses.length == 0 || responseList[player.responses[0].pack] === undefined || responseList[player.responses[0].pack].responses[player.responses[0].card] === undefined) {
          logReaction(myId, 0)
        } else {
          logReaction(myId, player.responses[0].pack + 1)
        }

      } else {

        neutralAudio.load()
        neutralAudio.play()

        if (player.responses.length == 0 || responseList[player.responses[0].pack] === undefined || responseList[player.responses[0].pack].responses[player.responses[0].card] === undefined) {
          logReaction(myId, 0)
        } else {
          logReaction(myId, player.responses[0].pack + 1)
        }

      }

      if (myId == 0) {

        gameState.players[myId].endorsements = reactionsLogged
        sendToPeers(gameState)

      } else {

        sendToPeers({
          endorsements: reactionsLogged
        })

      }

    }

  }

}

onkeyup = async (event) => {

  if (keysDown.find(value => { return value == event.key })) {
    keysDown.splice(keysDown.findIndex(value => { return value == event.key }), 1)
  }

}

function logReaction(playerId, cardPack) { // could rework this into a general 'submit interaction' function

  let emoji = '📄'

  if (cardPack != 0) {
    emoji = responseList[cardPack - 1].emoji
  }

  let indicatorReactionEffect = document.createElement('p')
  indicatorReactionEffect.classList.add('reactionEffect')
  indicatorReactionEffect.innerText = emoji

  twemoji.parse(indicatorReactionEffect)

  let indicatorSize = Math.floor(Math.random() * 10 + 20)
  let indicatorRotation = Math.floor(Math.random() * 20 - 10)
  indicatorReactionEffect.style.fontSize = indicatorSize + 'px'
  indicatorReactionEffect.style.height = indicatorSize + 'px'
  indicatorReactionEffect.style.width = indicatorSize + 'px'
  indicatorReactionEffect.children[0].style.transform = 'rotate(' + indicatorRotation + 'deg)'
  indicatorReactionEffect.style.right = 'calc(3% + 416.25px - 52.5px * ' + (parseInt(playerId) + 1) + ' - ' + indicatorSize / 2 + 'px + 26.25px)'
  
  document.body.appendChild(indicatorReactionEffect)

  indicatorReactionEffect.getAnimations()[0].onfinish = () => {
    indicatorReactionEffect.remove()
  }

  let popupReactionEffect = document.createElement('p')
  popupReactionEffect.classList.add('reactionEffect')
  popupReactionEffect.innerText = emoji

  twemoji.parse(popupReactionEffect)

  let popupSize = Math.floor(Math.random() * 20 + 52)
  let popupRotation = Math.floor(Math.random() * 30 - 15)
  let popupXOffset = Math.floor(Math.random() * 400)
  let popupYOffset = Math.floor(Math.random() * 300)
  let popupDir = Math.floor(Math.random() * 2)
  popupReactionEffect.style.fontSize = popupSize + 'px'
  popupReactionEffect.style.height = popupSize + 'px'
  popupReactionEffect.style.width = popupSize + 'px'
  popupReactionEffect.children[0].style.transform = 'rotate(' + popupRotation + 'deg)'

  popupReactionEffect.style.animationDelay = (Math.random() / 2 + 0.25) + 's'

  if (popupDir == 0) {
    popupReactionEffect.style.left = 'calc(3% + ' + popupXOffset + 'px)'
  } else {
    popupReactionEffect.style.right = 'calc(3% + ' + popupXOffset + 'px)'
  }

  popupReactionEffect.style.bottom = 'calc(80px + 200px + ' + popupYOffset + 'px)'

  document.body.appendChild(popupReactionEffect)

  popupReactionEffect.getAnimations()[0].onfinish = () => {
    popupReactionEffect.remove()
  }

  let popupReactionEffect2 = document.createElement('p')
  popupReactionEffect2.classList.add('reactionEffect')
  popupReactionEffect2.innerText = emoji

  twemoji.parse(popupReactionEffect2)

  let popup2Size = Math.floor(Math.random() * 20 + 52)
  let popup2Rotation = Math.floor(Math.random() * 30 - 15)
  let popup2XOffset = Math.floor(Math.random() * 400)
  let popup2YOffset = Math.floor(Math.random() * 300)
  let popup2Dir = Math.floor(Math.random() * 2)
  popupReactionEffect2.style.fontSize = popup2Size + 'px'
  popupReactionEffect2.style.height = popup2Size + 'px'
  popupReactionEffect2.style.width = popup2Size + 'px'
  popupReactionEffect2.children[0].style.transform = 'rotate(' + popup2Rotation + 'deg)'

  popupReactionEffect2.style.animationDelay = (Math.random() / 2 + 0.25) + 's'

  if (popup2Dir == 0) {
    popupReactionEffect2.style.left = 'calc(3% + ' + popup2XOffset + 'px)'
  } else {
    popupReactionEffect2.style.right = 'calc(3% + ' + popup2XOffset + 'px)'
  }

  popupReactionEffect2.style.bottom = 'calc(80px + 200px + ' + popup2YOffset + 'px)'

  document.body.appendChild(popupReactionEffect2)

  popupReactionEffect2.getAnimations()[0].onfinish = () => {
    popupReactionEffect2.remove()
  }

}



function parseGameState(data, gameState, playerId) {

  var message = JSON.parse(data)

  let parsedGameState = wakeObject(gameState)
  
  if (typeof(message.ready) == 'boolean') {

    let peerIndex = Object.keys(parsedGameState.players).indexOf('' + playerId + '')
    
    parsedGameState.players[playerId].ready = message.ready

    if (message.ready == true) {
      playerBar.children[peerIndex].children[2].classList.remove('banished')
    } else {
      playerBar.children[peerIndex].children[2].classList.add('banished')
    }
    
  }

  if (typeof(message.name) == 'string' && message.name.length <= 14 && message.name.trim() != '') {

    let peerIndex = Object.keys(parsedGameState.players).indexOf('' + playerId + '')
    
    parsedGameState.players[playerId].name = (message.name).trim()
    
    if (playerId == myId) {
      nameText.innerText = (message.name).trim()
    }

    playerBar.children[peerIndex].children[0].innerText = (message.name).trim()[0]
    playerBar.children[peerIndex].children[1].innerText = (message.name).trim()
    
  }

  if (typeof(message.responses) == 'object' && gameState.currentRound.segment == 'response') {

    let responseIsValid = false

    let i = 1
    while (i <= 66) {

      if (message.responses[0].card == parseInt((parsedGameState.players[playerId].responseString).charAt(7 * parsedGameState.currentRound.roundNum - 7 + i), 25) && message.responses[0].pack == parseInt((gameState.players[playerId].responseString).charAt(7 * gameState.currentRound.roundNum - 7), Object.keys(responseList).length)) {
        responseIsValid = true
      }
      
      i++

    }
    
    if (responseIsValid) {
      parsedGameState.players[playerId].responses = message.responses
    }

  }

  if (typeof(message.endorsements) == 'object' && gameState.currentRound.segment == 'voting') {

    Object.entries(message.endorsements).forEach(([endorsedPlayerId, endorsedPlayerAmount]) => {

      if (gameState.players[endorsedPlayerId]) {
        parsedGameState.players[playerId].endorsements[endorsedPlayerId] = endorsedPlayerAmount
      }

    })

  }

  return parsedGameState

}



function addNotification(message) {

  let notification = document.createElement('p')
  notification.innerText = message
  notification.classList.add('banished')

  notificationPanel.appendChild(notification)

  setTimeout(function() {
    notification.classList.remove('banished')
  }, 0)

  setTimeout(function() {

    notification.classList.add('banished')

    setTimeout(function() {
      notification.remove()
    }, 1000)

  }, 5000)

}



function weightVotes(gameState) {

  let numPlayerEndorsements = {}
  
  let quotaPoints = {}

  Object.keys(gameState.players).forEach(function(playerId) {

    Object.entries(gameState.players[playerId].endorsements).forEach(([endorsedPlayerId, endorsedPlayerAmount]) => {

      if (!numPlayerEndorsements[endorsedPlayerId]) {
        numPlayerEndorsements[endorsedPlayerId] = 0
      }

      if (endorsedPlayerAmount >= 5) {
        numPlayerEndorsements[endorsedPlayerId] += 1
      }

    })

  })

  Object.keys(numPlayerEndorsements).forEach(function(playerId) {

    if (numPlayerEndorsements[playerId] >= 2) {
      quotaPoints[playerId] = 1
    } else {
      quotaPoints[playerId] = 0
    }

  })
  
  if (gameState.gameRules.votingSystem == 'score') {

    return numPlayerEndorsements

  } else if (gameState.gameRules.votingSystem == 'quota') {

    return quotaPoints

  }

}



function constructPromptString(promptType, promptId, responses) {

  let responseStrings = responses
  
  if (responses == null) {
    responseStrings = ['_____', '_____']
  }
  
  let promptString = ''

  if (promptType == 0) { // Standard

    promptString = promptList[promptType].prompts[promptId] + responseStrings[0]

  } else if (promptType == 1) { // Review

    promptString = '\"' + promptList[promptType].prompts[promptId].description + '\"'

  } else if (promptType == 2) { // Conversation

    promptString = promptList[promptType].prompts[promptId].setup.join('\n')

  } else if (promptType == 3) { // Newsflash

    promptString = promptList[promptType].prompts[promptId]

  } else if (promptType == 500) {

    let i = 1

    while (i < promptList[promptType].prompts[promptId].length) {

      promptString = promptString + promptList[promptType].prompts[promptId][i - 1] + responseStrings[i - 1]

      i++

    }

    promptString = promptString + promptList[promptType].prompts[promptId][i - 1]
    
  }

  return promptString

}

function setDynamicFrame(currentRound, announcerText) {

  spotlightForeground.classList.add('banished')
  spotlightDecor.classList.add('banished')
  spotlightText.classList.add('banished')
  spotlightContext.classList.add('banished')
  spotlightContext2.classList.add('banished')

  let spotlightTextElements = document.getElementsByClassName('spotlightTextElement')
  
  Object.values(spotlightTextElements).forEach(element => {
    element.classList.add('banished')
  })
  
  dynamicFrameBackground.style.backgroundColor = getComputedStyle(dynamicFrameBackground).getPropertyValue('--black')
  dynamicFrameBackground.style.filter = 'blur(3px)'

  setTimeout(() => {
    
    setTimeout(() => {
      let utterance = new SpeechSynthesisUtterance(announcerText)
      utterance.rate = 1.2
      utterance.volume = globalVolume * 0.7

      window.speechSynthesis.speak(utterance)
    }, 500)

    dynamicFrame.setAttribute('promptType', promptList[currentRound.promptType].name)

    if (currentRound.promptType != 2 || currentRound.segment == 'lobby' || currentRound.segment == 'podium') {

      Object.values(spotlightTextElements ).forEach(element => {
        element.remove()
      })

    }

    spotlightText.innerText = ''
    spotlightContext.innerText = ''
    spotlightContext2.innerText = ''
    spotlightDecor.innerText = ''

    if (currentRound.segment == 'prompt') {
    
      dynamicFrameBackground.style.backgroundImage = new URL('/banners/1.png', 'https://localhost:3000')

      if (currentRound.promptType == 0 || currentRound.promptType == 500) { // Standard or Dual

        spotlightText.innerText = currentRound.spotlight

      } else if (currentRound.promptType == 1) { // Review

        spotlightText.innerText = currentRound.spotlight + '\n' + '⭐'.repeat(promptList[currentRound.promptType].prompts[currentRound.promptId].rating)
        if (promptList[currentRound.promptType].prompts[currentRound.promptId].rating < 3) {
          spotlightContext.innerText = currentRound.spotlightTeaser + ' does not recommend ' + '_____'
        } else {
          spotlightContext.innerText = currentRound.spotlightTeaser + ' recommends ' + '_____'
        }
        spotlightDecor.innerText = currentRound.spotlightTeaser[0]

        twemoji.parse(spotlightText)

      } else if (currentRound.promptType == 2) { // Conversation

        spotlightTextElements = document.getElementsByClassName('spotlightTextElement')

        Object.values(spotlightTextElements).forEach(element => {
          element.remove()
        })
        
        let lines = currentRound.spotlight.split(/\r?\n/)

        Object.keys(lines).forEach(line => {
          
          let newLine = document.createElement('p')
          newLine.classList.add('banished')
          newLine.classList.add('spotlightTextElement')
          newLine.style.setProperty('--numElements', line)

          newLine.innerText += lines[line]

          dynamicFrameBackground.appendChild(newLine)

        })

        spotlightContext.innerText = currentRound.spotlightTeaser
        spotlightDecor.innerText = currentRound.spotlightTeaser[0]

      } else if (currentRound.promptType == 3) { // Newsflash

        spotlightText.innerText = '_____'
        spotlightContext.innerText = currentRound.spotlight
        spotlightContext2.innerText = currentRound.spotlight
        spotlightDecor.innerText = currentRound.spotlightTeaser[0]

      }

    } else if (currentRound.segment == 'voting') {

      let packIdOrZero = 0

      if (currentRound.responses.length != 0) {
        packIdOrZero = currentRound.responses[0].pack + 1
      }

      dynamicFrame.setAttribute('promptType', promptList[currentRound.promptType].name)
      dynamicFrameBackground.style.backgroundImage = new URL('/banners/' + packIdOrZero + '.png', 'https://localhost:3000')

      // set spotlightDecor to match card emoji

      if (currentRound.promptType == 0 || currentRound.promptType == 500) { // Standard or Dual

        spotlightText.innerText = currentRound.spotlight
        spotlightContext.innerText = currentRound.playerName

      } else if (currentRound.promptType == 1) { // Review

        spotlightText.innerText = currentRound.spotlight + '\n' + '⭐'.repeat(promptList[currentRound.promptType].prompts[currentRound.promptId].rating)
        spotlightDecor.innerText = currentRound.spotlightTeaser[0]

        if (currentRound.responses.length != 0) {
          if (promptList[currentRound.promptType].prompts[currentRound.promptId].rating < 3) {
            spotlightContext.innerText = currentRound.spotlightTeaser + ' does not recommend ' + responseList[currentRound.responses[0].pack].responses[currentRound.responses[0].card]
          } else {
            spotlightContext.innerText = currentRound.spotlightTeaser + ' recommends ' + responseList[currentRound.responses[0].pack].responses[currentRound.responses[0].card]
          }
        } else {
          if (promptList[currentRound.promptType].prompts[currentRound.promptId].rating < 3) {
            spotlightContext.innerText = currentRound.spotlightTeaser + ' does not recommend ' + '_____'
          } else {
            spotlightContext.innerText = currentRound.spotlightTeaser + ' recommends ' + '_____'
          }
        }

        twemoji.parse(spotlightText)

      } else if (currentRound.promptType == 2) { // Conversation

        if (currentRound.responses.length != 0) {
          spotlightText.innerText = responseList[currentRound.responses[0].pack].responses[currentRound.responses[0].card]
        } else {
          spotlightText.innerText = ''
        }

        spotlightContext.innerText = currentRound.spotlightTeaser
        spotlightDecor.innerText = currentRound.spotlightTeaser[0]

      } else if (currentRound.promptType == 3) { // Newsflash

        if (currentRound.responses.length != 0) {
          spotlightText.innerText = responseList[currentRound.responses[0].pack].responses[currentRound.responses[0].card]
        } else {
          spotlightText.innerText = '_____'
        }

        spotlightContext.innerText = currentRound.spotlight
        spotlightContext2.innerText = currentRound.spotlight
        spotlightDecor.innerText = currentRound.spotlightTeaser[0]

      }

    } else if (currentRound.segment == 'lobby') {

      dynamicFrame.setAttribute('promptType', 'Standard')
      dynamicFrameBackground.style.backgroundImage = new URL('/banners/1.png', 'https://localhost:3000')

      spotlightText.innerText = currentRound.spotlight
      spotlightContext.innerText = ''
      spotlightContext2.innerText = ''
      spotlightDecor.innerText = ''

    } else if (currentRound.segment == 'podium') {

      dynamicFrame.setAttribute('promptType', 'Standard')
      dynamicFrameBackground.style.backgroundImage = new URL('/banners/1.png', 'https://localhost:3000')

      spotlightText.innerText = currentRound.spotlight
      spotlightContext.innerText = ''
      spotlightContext2.innerText = ''
      spotlightDecor.innerText = ''

    }

    spotlightForeground.classList.remove('banished')
    spotlightDecor.classList.remove('banished')
    spotlightContext.classList.remove('banished')
    spotlightContext2.classList.remove('banished')

    spotlightTextElements = document.getElementsByClassName('spotlightTextElement')
      
    Object.keys(spotlightTextElements).forEach(index => {
      setTimeout(() => {
        spotlightTextElements[index].classList.remove('banished')
      }, 500 * index)
    })

    if (currentRound.promptType == 0 || currentRound.promptType == 500) { // Standard or Dual

      dynamicFrameBackground.style.backgroundColor = getComputedStyle(dynamicFrame).getPropertyValue('--white')
      dynamicFrameBackground.style.filter = 'none'

      spotlightText.classList.remove('banished')

    } else if (currentRound.promptType == 1) { // Review

      dynamicFrameBackground.style.backgroundColor = getComputedStyle(dynamicFrame).getPropertyValue('--white')
      dynamicFrameBackground.style.filter = 'none'

      spotlightText.classList.remove('banished')

    } else if (currentRound.promptType == 2) { // Conversation

      dynamicFrameBackground.style.backgroundColor = getComputedStyle(dynamicFrame).getPropertyValue('--white')
      dynamicFrameBackground.style.filter = 'none'

      setTimeout(() => {
        spotlightText.classList.remove('banished')
      }, 1000)

    } else if (currentRound.promptType == 3) { // Conversation

      dynamicFrameBackground.style.backgroundColor = getComputedStyle(dynamicFrame).getPropertyValue('--white')
      dynamicFrameBackground.style.filter = 'none'

      spotlightText.classList.remove('banished')

    }

    

  }, 300);

}
