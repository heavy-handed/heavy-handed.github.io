twemoji.parse(document.body)

const minPlayers = 4

const majorVersion = '0.4'

// var is global, let is block scope

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

var globalVolume = 1

var promptsChosen = []

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

  Object.keys(peerChannels).forEach((peerId) => {
    if (peerChannels[peerId] && peerChannels[peerId].readyState == 'open') {
      peerChannels[peerId].send(JSON.stringify(parsedData))
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
  numRounds: 5,
  players: {},
};

let gameState = initialGameState

var myId = null

// HTML elements
const callButton = document.getElementById('callButton');
const joinInput = document.getElementById('joinInput');
const joinButton = document.getElementById('joinButton');
const playButton = document.getElementById('playButton');

const segmentText = document.getElementById('segmentText');

const preGameFrame = document.getElementById('preGameFrame')
const gameFrame = document.getElementById('gameFrame')

const segmentFrame = document.getElementById('segmentFrame')
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

const playerBar = document.getElementById('playerBar')

const leaveButton = document.getElementById('leaveButton');
const readyButton = document.getElementById('readyButton');
const nameInput = document.getElementById('nameInput');

const notificationPanel = document.getElementById('notificationPanel')

const successAudio = document.getElementById('successAudio')
const neutralAudio = document.getElementById('neutralAudio')
const musicAudio = document.getElementById('musicAudio')
successAudio.volume = globalVolume / 20
neutralAudio.volume = globalVolume / 20
musicAudio.volume = globalVolume / 10
// add mute functionality

const speech = window.SpeechSynthesis



const promptList = [
  {
    'name': 'Standard', // promptType = 0
    'prompts': [
      'Industry advocates have criticised ',
      'Is anyone here ',
      'An apartment littered with strangers\' clothes. Day in the life of ',
      'The President of the United States is ',
      'My dad is skeptical of the science behind ',
      'What\'s life without ',
      'Yikes. The office is in urgent need of ',
      'I\'ve travelled back in time to stop ',
      'I\'m not ill, I\'m simply ',
      'Took a trip to Timbuktu. My favourite thing? The bit where I was ',
      'Ugh, what\'s that smell? Someone\'s ',
      '1944, a year of ',
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
      'Yes, you got a raise. But why would I be jealous? I\'m ',
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
        'description': 'Terrible birthday surprise (in my own personal experience).'
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
        'rating': 5,
        'description': 'Now this is something I can wholeheartedly support!'
      },
      {
        'rating': 4,
        'description': 'As a vegan, I give this my full endorsement.'
      },
      {
        'rating': 3,
        'description': 'Mid...'
      },
      {
        'rating': 1,
        'description': 'How do I put it... painfully vanilla?'
      },
      {
        'rating': 3,
        'description': 'Good enough for the White House, good enough for me.'
      },
      {
        'rating': 5,
        'description': 'Finally! Some fun for the entire family.'
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
          'Jerry.',
          'You weren\'t at school today, my sweet.',
          'What were you doing?!?',
          'Love from Mum. <3'
        ]
      },
    ]
  },
  {
    'name': 'Newsflash',
    'prompts': [
      'Cities in chaos as thousands flee',
      'Middle East tensions increased after unexpected aggression',
      'Is it really the most effective option on the table?',
      'Celebrities weigh in on new trend',
      'Latest royal drama has Britain in shellshock!',
      'Coming up: Another political scandal',
      'Critics calling it a \'huge step backwards\'',
      'Listeners raving after Taylor Swift drops new single',
      'The next big religion?',
      'Protestors are armed and angry - and this is why',
      'Black-listed cyber criminal tells all',
      'Suspect claims she wanted to save innocent lives',
      'Book launched during mental health week',
      'Police say a lack of discipline is to blame',
      'New targets \'unachievable\' says spokesperson',
      'China closes border due to rapid increases'
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


const responseList = [ // responseString will break if no. of card packs exceeds 36
  {
    'emoji': '🏳️‍🌈',
    'responses': [
      'gay',
      'a skittle, a poof, and a bumboy',
      'being homophobic',
      'pride month pizazz',
      'a colourful word which rhymes with maggot',
      'coming out in a nursing home',
      'an LGBTQ rights activist',
      'that kid who has two dads for some reason',
      'an avid viewer of lesbian porn',
      'a hard-line \'no\' voter',
      'pansexual (attracted to cooking appliances)',
      'a tad fruity',
      'okay with me being gay',
      'slayyy',
      'more closeted than George Washington',
      'legalizing same-sex marriage',
      'the definition of bi-erasure',
      'a dyke',
      'one o\' them raging homosexuals',
      'The Grinch but for pride month',
      'a big fan of compulsory homosexuality',
      'livin\' life queer',
      'getting conversion therapy',
      'twink marriage',
      'getting pissed at Mardi Gras'
    ]
  },
  {
    'emoji': '🤓',
    'responses': [
      'factorising a non-monic derivative',
      'Albert Einstein',
      'pursuing quantum physics',
      'reciting pi to three digits',
      'giving major nerd emoji right now, I can\'t lie',
      'gifted',
      'paying off college debt',
      'studying some social skills',
      'a sweaty nerd',
      'pullin\' a Kowalski',
      'assessing the probability that you\'re wrong',
      'asking for extension work',
      'a product of the private education system',
      'Dweeb of the Year',
      'calculating',
      'a virgin for life',
      'mentally divergent at such an early age',
      'stealing our lunch money and paying us for assignments',
      'doing homework',
      'the next Stephen Hawking',
      'a Nobel Prize winner',
      'Mayor of Dorktopia',
      'hanging out in the bully-free zone',
      'gettin\' schooled',
      'one of our greatest minds'
    ]
  },
  {
    'emoji': '🇬🇷',
    'responses': [
      'a stupid Kalymnian',
      'spraying tzatziki everywhere',
      'adding incest to the Olympics',
      'Greece\'s debt collector',
      'certified Greek, seven days a week',
      'grillin\' and chillin\'',
      'shouting \'Eureka\' and running nude down the street',
      'the godfather of democracy',
      'Aristotle',
      'sailing to Athens for an orgy',
      'fantasising over calamari rings',
      'inventing democracy, then giving it to the male elite',
      'the owner of a construction company',
      'a good-for-nothing wog',
      'pretending that a bunch of little islands is a \'country\'',
      'Hercules',
      'doing the Macarena',
      'smoking my souvlaki',
      'strong Greek sperm',
      'a matter of Greek mythology',
      'penetrating Troy with a horse',
      'better than the Turkish',
      'an aspiring carpenter',
      'down bad for a yiros right about now',
      'daddy\'s little malaka'
    ]
  },
  {
    'emoji': '🔎',
    'responses': [
      'conspiracy theories',
      'in the Illuminati',
      'the proud owner of a tin foil hat',
      'reptilian overlords',
      'caught bleeding out blue blood',
      'the deep-state',
      'spying on citizens',
      'accused of collusion with the Mafia',
      'simply false',
      'taking down the shadow government',
      'a reputable fact-checker',
      'doing your own research',
      'a White House inside job',
      'exactly what they want you to believe',
      'Hillary Clinton and Bill Gates',
      'the Unabomber',
      'a sheeple of the mainstream media',
      'wire-tapping our calls',
      'doubting the legitimacy of vaccines',
      'a \'survivor\' of the September 11 \'attacks\'',
      'flat earthers from across the globe',
      'QAnon\'s biggest believer',
      'selling children\'s blood on the black market',
      'smashing a 5G modem',
      'faking the moon landing'
    ]
  },
  {
    'emoji': '🥀',
    'responses': [
      'having an affair',
      'eager to arrange a divorce',
      'heartbreak',
      'a poor victim of temptation',
      'couped up, caring for a family and whatnot',
      'a whore',
      'hooking up with my least kissable ex',
      'being unfaithful',
      'getting frisky with the handyman',
      'a recent widow',
      '\'Hunky Julio\'',
      'making my mistress sign an NDA',
      'cheating',
      'enjoying a solid hour of pretending I don\'t have a wife',
      'the dying rose of our marriage',
      'no-good prostitute scum',
      'notifying my rebounds about an upcoming job offer',
      'sexing a married man',
      'finding a side-fling',
      'wasting that sexual talent',
      'a sex scandal',
      'a home-wrecking wife-stealer',
      'trying out polyamory',
      'in a husband-sharing arrangement (apparently)',
      'conveniently leaving the ring at home'
    ]
  }
]


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

  myId = 0

  function generateResponseString() {

    let currentString = ''

    let i = 1
    while (i <= gameState.numRounds) {

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

  gameState.players[myId] = ({
    id: myId,
    name: 'Host',
    ready: true,
    responses: [],
    responseString: generateResponseString(),
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

  nameInput.setAttribute('placeholder', 'Host')

  leaveButton.removeAttribute('disabled')
  nameInput.removeAttribute('disabled')

  Object.keys(playerBar.children).forEach((child) => {
    playerBar.children[0].remove()
  })

  let newPlayerDiv = document.createElement('div')
  let newPlayerLabel = document.createElement('p')
  newPlayerLabel.innerText = gameState.players[myId].name
  newPlayerDiv.appendChild(newPlayerLabel)
  let newPlayerIndicator = document.createElement('img')
  newPlayerIndicator.src = '/icons/ready.png'
  newPlayerIndicator.classList.add('banished')
  newPlayerIndicator.classList.add('icon')
  newPlayerDiv.appendChild(newPlayerIndicator)

  playerBar.appendChild(newPlayerDiv)
  newPlayerIndicator.classList.remove('banished')

  playerBar.classList.remove('banished')

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

      }, 1000)

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

      playerBar.children[peerIndex].children[1].classList.add('banished')

    })

    readyButton.setAttribute('disabled', true)

    sendToPeers(gameState);

    startTimer()

    setTimeout(function() {

      gameState.currentRound.segment = 'response'
      gameState.currentRound.segmentTitle = 'Response'
      gameState.currentRound.timeLeft = 15

      segmentText.innerText = 'Response'

      Object.keys(cardFrame.children).forEach((child) => {
        cardFrame.children[0].remove()
      })

      let i = 1
      let responsePackChosen = parseInt((gameState.players[myId].responseString).charAt(7 * gameState.currentRound.roundNum - 7), Object.keys(responseList).length)
      let responsesChosen = []

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

        cardFrame.style.setProperty('--numCards', Number(cardFrame.style.getPropertyValue('--numCards')) + 1)

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

        let playerList = Object.keys(gameState.players)

        spotlightFrame.style.setProperty('--numCards', 0)
        
        playerList.forEach(function(key, keyIndex) {

          var player = gameState.players[key]

          setTimeout(function() {
            
            gameState.currentRound.segment = 'reveal'
            gameState.currentRound.segmentTitle = 'Reveal'
            gameState.currentRound.timeLeft = 2
            gameState.currentRound.player = player.id
            gameState.currentRound.playerName = player.name            

            segmentText.innerText = 'Reveal'

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

            spotlightFrame.style.setProperty('--numCards', Number(spotlightFrame.style.getPropertyValue('--numCards')) + 1)
            spotlightFrame.insertBefore(newCard, spotlightFrame.children[0])

            twemoji.parse(newCard.children[1])
            
            setTimeout(function() {
              newCard.classList.remove('banished')
            }, 0)

            sendToPeers(gameState);

            startTimer()

          }, 3000 * keyIndex)

        })
        
        setTimeout(function() {

          gameState.currentRound.roundNum++

          if (gameState.currentRound.roundNum <= gameState.numRounds) {

            playerList.forEach(function(player) {

              gameState.players[player].ready = false
    
              let peerIndex = Object.keys(gameState.players).indexOf('' + player + '')
    
              playerBar.children[peerIndex].children[1].classList.add('banished')
    
            })
    
            readyButton.removeAttribute('disabled')

          } else {

            gameState.currentRound.segment = 'podium'
            gameState.currentRound.segmentTitle = 'Podium'
            gameState.currentRound.timeLeft = 5
            gameState.currentRound.spotlight = 'The real winner was friendship.'

            segmentText.innerText = 'Podium'
            setDynamicFrame(gameState.currentRound)

            Object.keys(spotlightFrame.children).forEach(function(child) {
              spotlightFrame.children[0].remove()
            })

            // Announce winners or whatever

            sendToPeers(gameState);

            startTimer()

            setTimeout(function() {

              disconnectPeers()

              preGameFrame.classList.add('banished')
              gameFrame.classList.add('banished')
              disconnectFrame.classList.remove('banished')

            }, 6000)

          }

        }, 3000 * playerList.length)

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
        name: 'Player ' + (playerId + 1),
        ready: false,
        responses: [],
        responseString: generateResponseString(),
      })

      if (Object.keys(gameState.players).length >= minPlayers && gameState.currentRound.segment == 'lobby') {
        
        let newPlayerDiv = document.createElement('div')
        let newPlayerLabel = document.createElement('p')
        newPlayerLabel.innerText = gameState.players[playerId].name
        newPlayerDiv.appendChild(newPlayerLabel)
        let newPlayerIndicator = document.createElement('img')
        newPlayerIndicator.src = '/icons/ready.png'
        newPlayerIndicator.classList.add('banished')
        newPlayerIndicator.classList.add('icon')
        newPlayerDiv.appendChild(newPlayerIndicator)

        playerBar.appendChild(newPlayerDiv)
        
      } else if (gameState.currentRound.segment == 'lobby') {

        let newPlayerDiv = document.createElement('div')
        let newPlayerLabel = document.createElement('p')
        newPlayerLabel.innerText = gameState.players[playerId].name
        newPlayerDiv.appendChild(newPlayerLabel)
        let newPlayerIndicator = document.createElement('img')
        newPlayerIndicator.src = '/icons/ready.png'
        newPlayerIndicator.classList.add('banished')
        newPlayerIndicator.classList.add('icon')
        newPlayerDiv.appendChild(newPlayerIndicator)

        playerBar.appendChild(newPlayerDiv)
        
        newPeer()

      }

      sendToPeers(gameState);
    }

    newChannel.onmessage = (event) => {
      
      const parsedGameState = parseGameState(event.data, gameState, playerId)
      
      let allPlayersReadied = true

      Object.keys(parsedGameState.players).forEach(player => {
        
        if (parsedGameState.players[player].ready == false) {
          allPlayersReadied = false
        }

      })
      
      gameState = parsedGameState

      sendToPeers(gameState);
      
      if (allPlayersReadied == true && Object.keys(parsedGameState.players).length >= minPlayers && parsedGameState.currentRound.segment == 'lobby') {

        runGame()

      } else if (allPlayersReadied == true && parsedGameState.currentRound.segment == 'reveal' && parsedGameState.currentRound.player == Object.keys(parsedGameState.players).length - 1) {

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

      } else if (!newPc.currentRemoteDescription && data?.answer) {

        if (+sdp.substring(sdp.search('heavy-handed') + 14, sdp.search('heavy-handed') + 17) == NaN || sdp.substring(sdp.search('heavy-handed') + 15, sdp.search('heavy-handed') + 16) != '.') {

          addNotification('An invalid client tried to join your room.')
  
        } else if (+sdp.substring(sdp.search('heavy-handed') + 14, sdp.search('heavy-handed') + 17) < majorVersion) {
  
          addNotification('A client on an outdated version (' + sdp.substring(sdp.search('heavy-handed') + 14, sdp.search('heavy-handed') + 17) + ') tried to join your room.')
  
        } else if (+sdp.substring(sdp.search('heavy-handed') + 14, sdp.search('heavy-handed') + 17) > majorVersion) {
  
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
        
        if (prevPlayers.length == 0) {

          nameInput.setAttribute('placeholder', parsedGameState.players[myId].name)

          leaveButton.removeAttribute('disabled')
          readyButton.removeAttribute('disabled')
          nameInput.removeAttribute('disabled')

          Object.keys(playerBar.children).forEach((child) => {
            playerBar.children[0].remove()
          })
          
          newPlayers.forEach((player) => {
            let newPlayerDiv = document.createElement('div')
            let newPlayerLabel = document.createElement('p')
            newPlayerLabel.innerText = parsedGameState.players[player].name
            newPlayerDiv.appendChild(newPlayerLabel)
            let newPlayerIndicator = document.createElement('img')
            newPlayerIndicator.src = '/icons/ready.png'
            newPlayerIndicator.classList.add('banished')
            newPlayerIndicator.classList.add('icon')
            newPlayerDiv.appendChild(newPlayerIndicator)

            playerBar.appendChild(newPlayerDiv)

            if (parsedGameState.players[player].ready == true) {
              newPlayerIndicator.classList.remove('banished')
            }
          })
        
          playerBar.classList.remove('banished')
          preGameFrame.classList.add('banished')
          gameFrame.classList.remove('banished')

          setDynamicFrame(parsedGameState.currentRound)

        } else if (newPlayers.length > prevPlayers.length) {

          let newPlayerDiv = document.createElement('div')
          let newPlayerLabel = document.createElement('p')
          newPlayerLabel.innerText = parsedGameState.players[newPlayers.length - 1].name
          newPlayerDiv.appendChild(newPlayerLabel)
          let newPlayerIndicator = document.createElement('img')
          newPlayerIndicator.src = '/icons/ready.png'
          newPlayerIndicator.classList.add('banished')
          newPlayerIndicator.classList.add('icon')
          newPlayerDiv.appendChild(newPlayerIndicator)

          playerBar.appendChild(newPlayerDiv)

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

            playerBar.children[peerIndex].children[0].innerText = parsedGameState.players[playerId].name

            if (parsedGameState.players[playerId].ready == true) {
              playerBar.children[peerIndex].children[1].classList.remove('banished')
            } else {
              playerBar.children[peerIndex].children[1].classList.add('banished')
            }

          })
          
        }

        if (parsedGameState.currentRound.segment != gameState.currentRound.segment) {

          if (parsedGameState.currentRound.segment == 'lobby' || parsedGameState.currentRound.segment == 'podium') {
            readyButton.removeAttribute('disabled')

            setDynamicFrame(parsedGameState.currentRound)
          } else {
            readyButton.setAttribute('disabled', true)
          }
          
          if (parsedGameState.currentRound.segment == 'prompt') {

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

          } else if (parsedGameState.currentRound.segment != 'reveal') {

            spotlightFrame.style.setProperty('--numCards', 0)

          }

        }

        if (parsedGameState.currentRound.segment == 'reveal' && parsedGameState.currentRound.player == Object.keys(parsedGameState.players).length - 1 && !parsedGameState.players[myId].ready) {

          readyButton.removeAttribute('disabled')

        }

        if (parsedGameState.currentRound.timeLeft > 0 && gameState.currentRound.timeLeft != parsedGameState.currentRound.timeLeft) {

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

          }, 1000)

        }
        
        if (parsedGameState.currentRound.segment == 'reveal' && (gameState.currentRound.segment != 'reveal' || parsedGameState.currentRound.player != gameState.currentRound.player)) {

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

          spotlightFrame.style.setProperty('--numCards', Number(spotlightFrame.style.getPropertyValue('--numCards')) + 1)
          spotlightFrame.insertBefore(newCard, spotlightFrame.children[0])
          
          twemoji.parse(newCard.children[1])

          setTimeout(function() {
            newCard.classList.remove('banished')
          }, 0)

        } else if (parsedGameState.currentRound.segment == 'podium') {

          Object.keys(spotlightFrame.children).forEach(function(child) {
            spotlightFrame.children[0].remove()
          })

        } else if (parsedGameState.currentRound.segment == 'lobby') {

          segmentText.innerText = parsedGameState.currentRound.segmentTitle

          Object.keys(spotlightFrame.children).forEach(function(child) {
            spotlightFrame.children[0].remove()
          })

        } else if (parsedGameState.currentRound.segment == 'prompt') {

          Object.keys(spotlightFrame.children).forEach(function(child) {
            spotlightFrame.children[0].remove()
          })

        }

        if (parsedGameState.currentRound.segment == 'response' && gameState.currentRound.segment != 'response') {

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

              Object.keys(newCard.parentElement.children).forEach((child) => {

                newCard.parentElement.children[child].classList.remove('selected')
                newCard.parentElement.children[child].children[2].innerText = ''
  
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

        } else if (+sdp.substring(sdp.search('heavy-handed') + 14, sdp.search('heavy-handed') + 17) < majorVersion) {

          addNotification('This room is running an older version (' + sdp.substring(sdp.search('heavy-handed') + 14, sdp.search('heavy-handed') + 17) + '). Ask the host to update.')

        } else if (+sdp.substring(sdp.search('heavy-handed') + 14, sdp.search('heavy-handed') + 17) > majorVersion) {

          addNotification('This room is running a newer version (' + sdp.substring(sdp.search('heavy-handed') + 14, sdp.search('heavy-handed') + 17) + '). Please update in order to join.')

        }

      }
    
    }

  }

};



readyButton.onclick = async () => {

  neutralAudio.load()
  neutralAudio.play()

  readyButton.setAttribute('disabled', true)

  if (myId == 0) {

    gameState.players[myId].ready = true
    playerBar.children[myId].children[1].classList.remove('banished')

    sendToPeers(gameState);

    let allPlayersReadied = true

    Object.keys(gameState.players).forEach(player => {
      
      if (gameState.players[player].ready == false) {
        allPlayersReadied = false
      }

    })

    if (allPlayersReadied == true && gameState.currentRound.segment == 'reveal' && gameState.currentRound.player == Object.keys(gameState.players).length - 1) {

      runRound()

    }

  } else {

    sendToPeers({
      ready: true
    })

  }

}


nameInput.onkeyup = async (event) => {

  if (event.key == 'Enter' && nameInput.value.length <= 15 && (nameInput.value).trim() != '') {

    if (myId == 0) {

      gameState.players[myId].name = (nameInput.value).trim()
      playerBar.children[myId].children[0].innerText = (nameInput.value).trim()

      sendToPeers(gameState);

    } else {

      sendToPeers({
        name: (nameInput.value).trim()
      })

    }

  } else if (event.key == 'Enter') {

    nameInput.value = gameState.players[myId].name

  }
  
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

  nameInput.setAttribute('placeholder', '')

  leaveButton.setAttribute('disabled', true)
  readyButton.setAttribute('disabled', true)
  nameInput.setAttribute('disabled', true)

  Object.keys(spotlightFrame.children).forEach(function(child) {
    spotlightFrame.children[0].remove()
  })

}


leaveButton.onclick = async () => {

  neutralAudio.load()
  neutralAudio.play()

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

  nameInput.setAttribute('placeholder', '')

  leaveButton.setAttribute('disabled', true)
  readyButton.setAttribute('disabled', true)
  nameInput.setAttribute('disabled', true)

  Object.keys(spotlightFrame.children).forEach(function(child) {
    spotlightFrame.children[0].remove()
  })

}


muteButton.onclick = async () => {

  if (globalVolume == 0) {
    
    neutralAudio.load()
    neutralAudio.play()

    globalVolume = 1

    muteButton.children[0].setAttribute('src', '/icons/unmuted.png')

  } else {

    globalVolume = 0

    muteButton.children[0].setAttribute('src', '/icons/muted.png')

  }

  successAudio.volume = globalVolume / 20
  neutralAudio.volume = globalVolume / 20
  musicAudio.volume = globalVolume / 10

}



function parseGameState(data, gameState, playerId) {

  var message = JSON.parse(data)

  let parsedGameState = wakeObject(gameState)
  
  if (typeof(message.ready) == 'boolean') {

    let peerIndex = Object.keys(parsedGameState.players).indexOf('' + playerId + '')
    
    parsedGameState.players[playerId].ready = message.ready

    if (message.ready == true) {
      playerBar.children[peerIndex].children[1].classList.remove('banished')
    } else {
      playerBar.children[peerIndex].children[1].classList.add('banished')
    }
    
  }

  if (typeof(message.name) == 'string' && message.name.length <= 15 && message.name.trim() != '') {

    let peerIndex = Object.keys(parsedGameState.players).indexOf('' + playerId + '')
    
    parsedGameState.players[playerId].name = (message.name).trim()
    playerBar.children[peerIndex].children[0].innerText = (message.name).trim()
    
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
  
  Object.keys(spotlightTextElements).forEach(index => {
    spotlightTextElements[index].classList.add('banished')
  })
  
  dynamicFrameBackground.style.backgroundColor = getComputedStyle(dynamicFrameBackground).getPropertyValue('--black')
  dynamicFrameBackground.style.filter = 'blur(3px)'

  setTimeout(() => {
    
    setTimeout(() => {
      let utterance = new SpeechSynthesisUtterance(announcerText)
      utterance.rate = 1.5
      utterance.volume = globalVolume * 0.7

      window.speechSynthesis.speak(utterance)
    }, 500)

    dynamicFrame.setAttribute('promptType', promptList[currentRound.promptType].name)

    if (currentRound.promptType != 2) {

      Object.keys(spotlightTextElements).forEach(index => {
        spotlightTextElements[index].remove()
      })

    }

    spotlightText.innerText = ''
    spotlightContext.innerText = ''
    spotlightContext2.innerText = ''
    spotlightDecor.innerText = ''

    if (currentRound.segment == 'prompt') {
    
      dynamicFrameBackground.style.backgroundImage = new URL('/banners/0.png', 'https://localhost:3000')

      if (currentRound.promptType == 0 || currentRound.promptType == 500) { // Standard or Dual

        spotlightText.innerText = currentRound.spotlight

      } else if (currentRound.promptType == 1) { // Review

        spotlightText.innerText = currentRound.spotlight + '\n' + '⭐'.repeat(promptList[currentRound.promptType].prompts[currentRound.promptId].rating)
        spotlightContext.innerText = currentRound.spotlightTeaser + ' says:'
        spotlightDecor.innerText = currentRound.spotlightTeaser[0]

        twemoji.parse(spotlightText)

      } else if (currentRound.promptType == 2) { // Conversation

        spotlightTextElements = document.getElementsByClassName('spotlightTextElement')

        Object.keys(spotlightTextElements).forEach(index => {
          spotlightTextElements[0].remove()
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

    } else if (currentRound.segment == 'reveal') {

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
        spotlightContext.innerText = '- ' + currentRound.spotlightTeaser
        spotlightDecor.innerText = currentRound.spotlightTeaser[0]

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
      dynamicFrameBackground.style.backgroundImage = new URL('/banners/0.png', 'https://localhost:3000')

      spotlightText.innerText = currentRound.spotlight
      spotlightContext.innerText = ''
      spotlightContext2.innerText = ''
      spotlightDecor.innerText = ''

    } else if (currentRound.segment == 'podium') {

      dynamicFrame.setAttribute('promptType', 'Standard')
      dynamicFrameBackground.style.backgroundImage = new URL('/banners/0.png', 'https://localhost:3000')

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