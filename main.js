twemoji.parse(document.body)


const majorVersion = '0.3'

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

let localStream = null
// https://blog.mozilla.org/webrtc/perfect-negotiation-in-webrtc/

let voiceInput = null;
let voiceOutput = null;

let callId = null;

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
    promptType: '',
    promptId: '',
    player: ''
  },
  numRounds: 5,
  players: {},
  //numPlayers: 2,
};

let gameState = initialGameState

var myId = null

// HTML elements
const callButton = document.getElementById('callButton');
const joinInput = document.getElementById('joinInput');
const joinButton = document.getElementById('joinButton');
const readyButton = document.getElementById('readyButton');

const outputAudio = document.getElementById('outputAudio');

const segmentText = document.getElementById('segmentText');
const spotlightText = document.getElementById('spotlightText');

const preGameFrame = document.getElementById('preGameFrame')
const gameFrame = document.getElementById('gameFrame')
const disconnectFrame = document.getElementById('disconnectFrame')
const cardFrame = document.getElementById('cardFrame')

const dismissButton = document.getElementById('dismissButton')

const responseCard = document.getElementById('responseCard');
const responseText = responseCard.children[0];
const responseEmoji = responseCard.children[1];
const responseContext = responseCard.children[2];

const playerBar = document.getElementById('playerBar')

const leaveButton = document.getElementById('leaveButton');
const muteButton = document.getElementById('muteButton');
const nameInput = document.getElementById('nameInput');

const notificationPanel = document.getElementById('notificationPanel')


// Element classes
const cards = document.getElementsByClassName('card');


const prompts = [
  {
    'name': 'Standard',
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
      'That\'s what I hate about those foreigners, they are always '
    ]
  },
  /*{
    'name': 'Dual',
    'prompts': [
      [
        'I think ',
        ' is best described as ',
        '.'
      ]
    ]
  }*/
]

const responses = [ // responseString will break if no. of card packs exceeds 36
  {
    'emoji': '🏳️‍🌈',
    'responses': [
      'gay',
      'a fairy, a skittle, a special snowflake',
      'being homophobic',
      'converting my straight friends',
      'using a colourful word which rhymes with maggot',
      'coming out in a nursing home',
      'an LGBTQ rights activist',
      'that kid who has two dads for some reason',
      'an avid viewer of lesbian porn',
      'a hard-line \'no\' voter',
      'pansexual (attracted to cooking appliances)',
      'a tad fruity',
      'okay with me being gay',
      'slaying',
      'more closeted than George Washington',
      'regretting the legalization of same-sex marriage',
      'the definition of bi-erasure',
      'a lesbian (lol)',
      'one o\' them raging homosexuals',
      'the pride month equivalent of The Grinch',
      'a big fan of compulsory homosexuality',
      'livin\' life queer',
      'banging men',
      'a twink in the drama class',
      'getting pissed at Mardi Gras'
    ]
  },
  {
    'emoji': '🤓',
    'responses': [
      'factorising the polynomial',
      'Albert Einstein',
      'pursuing a career in quantum physics',
      'reciting pi to at least three digits',
      'giving nerd emoji right now, I can\'t lie',
      'gifted',
      'paying off college debt',
      'studying some social skills',
      'a sweaty nerd',
      'the Kowalski of the class',
      'calculating the probability that you\'re a twig',
      'asking for extension questions',
      'a product of the private education system',
      'Dweeb of the Year',
      'focusing on math and music, nothing else matters',
      'a virgin for life',
      'mentally divergent at such a young age',
      'stealing lunch money and paying for assignments',
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
      'a douchebag Kalymnian',
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
  }
]

// 1. Setup media sources

callButton.onclick = async () => {
  

  // P A R T  1



  joinInput.setAttribute('disabled', true)
  joinButton.setAttribute('disabled', true)
  callButton.setAttribute('disabled', true)

  localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  let remoteStream = new MediaStream();

  myId = 0

  function generateResponseString() {

    let currentString = ''

    let i = 1
    while (i <= gameState.numRounds) {

      currentString = currentString + Math.floor(Math.random() * Object.keys(responses).length).toString(Object.keys(responses).length)

      let responsesChosen = []

      let j = 1
      while (j <= 5) {
        
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
    ready: false,
    muted: false,
    response: 0,
    responsePack: 0,
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

  segmentText.innerText = 'Lobby'
  spotlightText.innerText = `Waiting for 4 players to join the game.
Your room code is ` + callId + `.`

  gameState.currentRound.segment = 'lobby'
  gameState.currentRound.segmentTitle = 'Lobby'
  gameState.currentRound.spotlight = `Waiting for 4 players to join the game.
Your room code is ` + callId + `.`

  nameInput.setAttribute('placeholder', 'Host')

  leaveButton.removeAttribute('disabled')
  //muteButton.removeAttribute('disabled')
  nameInput.removeAttribute('disabled')

  Object.keys(playerBar.children).forEach((child) => {
    playerBar.children[0].remove()
  })

  let newPlayerLabel = document.createElement('p')
  newPlayerLabel.innerText = gameState.players[myId].name

  playerBar.appendChild(newPlayerLabel)

  playerBar.classList.remove('banished')

  preGameFrame.classList.add('banished')

  gameFrame.classList.remove('banished')


  function runGame() {

    gameState.currentRound.roundNum = 1
    let promptsChosen = []

    readyButton.classList.remove('banished')

    readyButton.onclick = async () => {
      
      readyButton.classList.add('banished')
      runRound()
      
    }

    function runRound() {

      function constructPromptString(promptType, promptId, responses) {

        let responseStrings = responses
        
        if (responses == null) {
          responseStrings = ['_____', '_____']
        }
        
        let promptString = ''

        if (promptType == 0) {

          promptString = prompts[promptType].prompts[promptId] + responseStrings[0]

        } else if (promptType == 1) {

          let i = 1

          while (i < prompts[promptType].prompts[promptId].length) {

            promptString = promptString + prompts[promptType].prompts[promptId][i - 1] + responseStrings[i - 1]

            i++

          }

          promptString = promptString + prompts[promptType].prompts[promptId][i - 1]
          
        }

        return promptString

      }

      let promptType = Math.floor(Math.random() * prompts.length)

      let promptId = Math.floor(Math.random() * (prompts[promptType].prompts.length))

      while (promptsChosen.find(element => element == promptId)) {
         
        promptId = Math.floor(Math.random() * (prompts[promptType].prompts.length))

      }

      promptsChosen.push(promptId)

      let promptString = constructPromptString(promptType, promptId)

      gameState.currentRound.segment = 'prompt'
      gameState.currentRound.segmentTitle = prompts[promptType].name + ' prompt'
      gameState.currentRound.spotlight = promptString
      gameState.currentRound.promptType = promptType
      gameState.currentRound.promptId = promptId
      gameState.currentRound.timeLeft = 3

      segmentText.innerText = prompts[promptType].name + ' prompt'
      spotlightText.innerText = promptString

      responseCard.classList.add('banished')

      let playerList = Object.keys(gameState.players)
          
      playerList.forEach(function(key, keyIndex) {

        gameState.players[key].responsePack = 0
        gameState.players[key].response = 0

      })

      sendToPeers(gameState);

      setTimeout(function() {

        gameState.currentRound.segment = 'response'
        gameState.currentRound.segmentTitle = 'Response'
        gameState.currentRound.timeLeft = 15

        segmentText.innerText = 'Response'

        Object.keys(cardFrame.children).forEach((child) => {
          cardFrame.children[0].remove()
        })

        let i = 1
        let responsePackChosen = parseInt((gameState.players[myId].responseString).charAt(6 * gameState.currentRound.roundNum - 6), Object.keys(responses).length)
        let responsesChosen = []

        while (i <= 5) {

          let responseId = parseInt((gameState.players[myId].responseString).charAt(6 * gameState.currentRound.roundNum - 6 + i), 25)
          
          responsesChosen.push(responseId)
          
          let newCard = cardFrame.appendChild(responseCard.cloneNode(true))
          newCard.removeAttribute('id')
          newCard.classList.remove('banished')
          newCard.children[0].innerText = responses[responsePackChosen].responses[responseId]
          newCard.children[1].innerText = responses[responsePackChosen].emoji
          newCard.children[2].innerText = ''

          twemoji.parse(newCard.children[1])

          newCard.onclick = async () => {

            Object.keys(newCard.parentElement.children).forEach((child) => {

              newCard.parentElement.children[child].classList.remove('selected')
              newCard.parentElement.children[child].children[2].innerText = ''

            })

            newCard.classList.add('selected')
            newCard.children[2].innerText = 'selected'

            gameState.players[myId].responsePack = responsePackChosen + 1
            gameState.players[myId].response = responseId + 1

          }

          i++

        }

        setTimeout(function() {
          cardFrame.classList.remove('banished')
        }, 0)

        sendToPeers(gameState);

        setTimeout(function() {

          let playerList = Object.keys(gameState.players)
          
          playerList.forEach(function(key, keyIndex) {

            var player = gameState.players[key]

            setTimeout(function() {
              
              gameState.currentRound.segment = 'reveal'
              gameState.currentRound.segmentTitle = 'Reveal'
              gameState.currentRound.timeLeft = 6
              gameState.currentRound.player = player.id

              segmentText.innerText = 'Reveal'

              cardFrame.classList.add('banished')

              responseCard.classList.remove('banished')

              if (player.responsePack == 0 || responses[player.responsePack - 1] === undefined || player.response == 0 || responses[player.responsePack - 1].responses[player.response - 1] === undefined) {
                let promptString = constructPromptString(promptType, promptId)

                gameState.currentRound.spotlight = promptString

                spotlightText.innerText = promptString                
                responseText.innerText = 'no response'
                responseEmoji.innerText = '📄'
                responseContext.innerText = player.name
              } else {
                let promptString = constructPromptString(promptType, promptId, [ responses[player.responsePack - 1].responses[player.response - 1] ])

                gameState.currentRound.spotlight = promptString

                spotlightText.innerText = promptString
                responseText.innerText = responses[player.responsePack - 1].responses[player.response - 1]
                responseEmoji.innerText = responses[player.responsePack - 1].emoji
                responseContext.innerText = player.name
              }

              twemoji.parse(responseEmoji)
              
              sendToPeers(gameState);

            }, 6000 * keyIndex)

          })
          
          setTimeout(function() {

            responseCard.classList.add('banished')

            gameState.currentRound.roundNum++

            if (gameState.currentRound.roundNum <= gameState.numRounds) {

              runRound()

            } else {

              gameState.currentRound.segment = 'podium'
              gameState.currentRound.segmentTitle = 'Podium'
              gameState.currentRound.timeLeft = 5
              gameState.currentRound.spotlight = 'The real winner was friendship.'

              segmentText.innerText = 'Podium'
              spotlightText.innerText = 'The real winner was friendship.'

              // Announce winners or whatever

              sendToPeers(gameState);

              setTimeout(function() {

                disconnectPeers()

                gameFrame.classList.add('banished')
                disconnectFrame.classList.remove('banished')

              }, 5000)

            }

          }, 6000 * playerList.length)

        }, 15000)

        var timeLeft = 15

        gameState.currentRound.timeLeft = timeLeft

        segmentText.classList.add('i')
        segmentText.innerText = gameState.currentRound.segmentTitle + ' • ' + timeLeft + 's'

        var timer = setInterval(function() {

          timeLeft--

          if (timeLeft <= 0) {
            clearInterval(timer)
            
            segmentText.classList.remove('i')
          } else {
            segmentText.innerText = gameState.currentRound.segmentTitle + ' • ' + timeLeft + 's'
          }

        }, 1000)

      }, 3000)
    
    }

  }


  // P A R T  2



  async function newPeer() {

    let newPc = new RTCPeerConnection(servers);

    // Push tracks from local stream to peer connection
    localStream.getTracks().forEach((track) => {
      voiceInput = newPc.addTrack(track, localStream);
    });

    // Pull tracks from remote stream, add to video stream
    newPc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        voiceOutput = remoteStream.addTrack(track);
      });
    };

    //outputAudio.srcObject = remoteStream;

    // Create channel to send other (non-media) data

    let playerId = Object.keys(gameState.players).length

    let newChannel = newPc.createDataChannel(playerId);

    newChannel.onopen = (event) => {
      
      peerConnections[playerId] = newPc
      peerChannels[playerId] = newChannel

      gameState.players[playerId] = ({
        id: playerId,
        name: 'Player ' + (playerId + 1),
        ready: false,
        muted: false,
        response: 0,
        responsePack: 0,
        responseString: generateResponseString(),
      })

      if (Object.keys(gameState.players).length >= 4 && gameState.currentRound.segment == 'lobby') {
        
        let newPlayerLabel = document.createElement('p')
        newPlayerLabel.innerText = gameState.players[playerId].name

        playerBar.appendChild(newPlayerLabel)
        
        runGame()
        
      } else if (gameState.currentRound.segment == 'lobby') {

        let newPlayerLabel = document.createElement('p')
        newPlayerLabel.innerText = gameState.players[playerId].name

        playerBar.appendChild(newPlayerLabel)
        
        newPeer()

      }

      sendToPeers(gameState);
    }

    newChannel.onmessage = (event) => {
      
      const parsedGameState = parseGameState(event.data, gameState, playerId)
      
      sendToPeers(parsedGameState);

      if (gameState.players[playerId].muted) { // yes bro, this is correct

        newPc.onnegotiationneeded = async () => { // because this picks up a problem

          if (gameState.players[playerId].muted) {

            let offerDescription = await newPc.createOffer();
            await newPc.setLocalDescription(offerDescription);
            
            let offer = {
              sdp: offerDescription.sdp,
              type: offerDescription.type,
            };

            let callDoc = await firestore.doc(db, "calls", callId)
        
            await firestore.setDoc(callDoc, { offer });
            
            // disabled the following because each event has an ongoing trigger, seen line 203 and below

            // Listen for remote answer
            /*callDoc.onSnapshot((snapshot) => {
              let data = snapshot.data();
              if (!newPc.currentRemoteDescription && data?.answer) { // On answer
                let answerDescription = new RTCSessionDescription(data.answer);
                newPc.setRemoteDescription(answerDescription);
              }
            });*/

            // When answered, add candidate to peer connection
            /*answerCandidates.onSnapshot((snapshot) => {
              snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                  let candidate = new RTCIceCandidate(change.doc.data());
                  newPc.addIceCandidate(candidate);

                }
              });
            });*/

          }

        }

      }

      gameState = parsedGameState

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

  callId = joinInput.value.toLowerCase().trim();

  if (callId != '') {

    var callDoc = await firestore.doc(db, "calls", callId)

  }
  
  if (callDoc != null) {

    joinInput.setAttribute('disabled', true)
    joinButton.setAttribute('disabled', true)
    callButton.setAttribute('disabled', true)

    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    let remoteStream = new MediaStream();



    // P A R T  2



    let newPc = new RTCPeerConnection(servers);

    newPc.onconnectionstatechange = async () => {

      if (newPc.connectionState == 'disconnected' || newPc.connectionState == 'failed') {
  
        newPc.close()
  
        gameFrame.classList.add('banished')
        disconnectFrame.classList.remove('banished')
  
      }
  
    }

    // Push tracks from local stream to peer connection
    localStream.getTracks().forEach((track) => {
      voiceInput = newPc.addTrack(track, localStream);
    });

    // Pull tracks from remote stream, add to video stream
    newPc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        voiceOutput = remoteStream.addTrack(track);
      });
    };

    //outputAudio.srcObject = remoteStream;


    // Respond to new data channel
    newPc.ondatachannel = (event) => {
      
      myId = (event.channel.label)

      let hostChannel = event.channel
      
      event.channel.onopen = (event) => {
        peerChannels[0] = hostChannel
        peerConnections[0] = newPc
        
        sendToPeers({
          ready: true
        });
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
          //muteButton.removeAttribute('disabled')
          nameInput.removeAttribute('disabled')

          Object.keys(playerBar.children).forEach((child) => {
            playerBar.children[0].remove()
          })
          
          newPlayers.forEach((player) => {
            let newPlayerLabel = document.createElement('p')
            newPlayerLabel.innerText = parsedGameState.players[player].name
          
            playerBar.appendChild(newPlayerLabel)
          })
        
          playerBar.classList.remove('banished')
      
          preGameFrame.classList.add('banished')
      
          gameFrame.classList.remove('banished')

        } else if (newPlayers.length > prevPlayers.length) {

          let newPlayerLabel = document.createElement('p')
          newPlayerLabel.innerText = parsedGameState.players[newPlayers.length - 1].name

          playerBar.appendChild(newPlayerLabel)

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

            playerBar.children[peerIndex].innerText = parsedGameState.players[playerId].name

          })
          
        }

        
        if (parsedGameState.currentRound.segment == 'reveal') {

          segmentText.innerText = parsedGameState.currentRound.segmentTitle
          spotlightText.innerText = parsedGameState.currentRound.spotlight

          cardFrame.classList.add('banished')

          responseCard.classList.remove('banished')

          let player = parsedGameState.players[parsedGameState.currentRound.player]

          if (player.responsePack == 0 || responses[player.responsePack - 1] === undefined || player.response == 0 || responses[player.responsePack - 1].responses[player.response - 1] === undefined) {
            responseText.innerText = 'no response'
            responseEmoji.innerText = '📄'
            responseContext.innerText = player.name
          } else {
            responseText.innerText = responses[player.responsePack - 1].responses[player.response - 1]
            responseEmoji.innerText = responses[player.responsePack - 1].emoji
            responseContext.innerText = player.name
          }

          twemoji.parse(responseEmoji)

        } else if (parsedGameState.currentRound.segment == 'podium') {

          segmentText.innerText = parsedGameState.currentRound.segmentTitle
          spotlightText.innerText = parsedGameState.currentRound.spotlight

          responseCard.classList.add('banished')

        } 
        
        if (parsedGameState.currentRound.segment == 'lobby' || parsedGameState.currentRound.segment == 'prompt') {

          responseCard.classList.add('banished')

          segmentText.innerText = parsedGameState.currentRound.segmentTitle
          spotlightText.innerText = parsedGameState.currentRound.spotlight

        }

        if (parsedGameState.currentRound.segment == 'response' && gameState.currentRound.segment != 'response') {

          var timeLeft = 15

          segmentText.classList.add('i')
          segmentText.innerText = parsedGameState.currentRound.segmentTitle + ' • ' + timeLeft + 's'
          spotlightText.innerText = parsedGameState.currentRound.spotlight

          var timer = setInterval(function() {

            timeLeft--

            if (timeLeft <= 0) {
              clearInterval(timer)
              
              segmentText.classList.remove('i')
            } else {
              segmentText.innerText = parsedGameState.currentRound.segmentTitle + ' • ' + timeLeft + 's'
            }

          }, 1000)

          Object.keys(cardFrame.children).forEach((child) => {
            cardFrame.children[0].remove()
          })

          let i = 1
          let responsePackChosen = parseInt((gameState.players[myId].responseString).charAt(6 * gameState.currentRound.roundNum - 6), Object.keys(responses).length)
          let responsesChosen = []

          while (i <= 5) {

            let responseId = parseInt((gameState.players[myId].responseString).charAt(6 * gameState.currentRound.roundNum - 6 + i), 25)
  
            responsesChosen.push(responseId)
            
            let newCard = cardFrame.appendChild(responseCard.cloneNode(true))
            newCard.removeAttribute('id')
            newCard.classList.remove('banished')
            newCard.children[0].innerText = responses[responsePackChosen].responses[responseId]
            newCard.children[1].innerText = responses[responsePackChosen].emoji
            newCard.children[2].innerText = ''

            twemoji.parse(newCard)
  
            newCard.onclick = async () => {

              Object.keys(newCard.parentElement.children).forEach((child) => {

                newCard.parentElement.children[child].classList.remove('selected')
                newCard.parentElement.children[child].children[2].innerText = ''
  
              })
  
              newCard.classList.add('selected')
              newCard.children[2].innerText = 'selected'
  
              sendToPeers({
                responsePack: responsePackChosen + 1,
                response: responseId + 1
              })
  
            }
  
            i++
  
          }

          setTimeout(function() {
            cardFrame.classList.remove('banished')
          }, 0)

        }


        if (gameState.players[0] != null) {
          if (gameState.players[0].muted == true) {

            newPc.onnegotiationneeded = async () => {
              
              if (gameState.players[0].muted == true) {

                const offerDescription = await newPc.createOffer();
                await newPc.setLocalDescription(offerDescription);
                
                const offer = {
                  sdp: offerDescription.sdp,
                  type: offerDescription.type,
                };
            
                await firestore.setDoc(callDoc, { offer });

                // Listen for remote answer
                firestore.onSnapshot(callDoc, (snapshot) => {
                  const data = snapshot.data();
                  if (!newPc.currentRemoteDescription && data?.answer) { // On answer
                    const answerDescription = new RTCSessionDescription(data.answer);
                    newPc.setRemoteDescription(answerDescription);      
                  }
                });

                // When answered, add candidate to peer connection
                firestore.onSnapshot(answerCandidates, (snapshot) => {
                  snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                      const candidate = new RTCIceCandidate(change.doc.data());
                      newPc.addIceCandidate(candidate);
                    }
                  });
                });

              }

            }

          }
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
    console.log(callData)
    
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

};



muteButton.onclick = async () => { // newPc is not right, it's temporary considering mute function is disabled

  if (muteButton.classList.contains('selected')) {

    muteButton.classList.remove('selected')
    muteButton.innerText = 'Mute'

    sendToPeers({
      muted: false
    })

    // Push tracks from local stream to peer connection
    localStream.getTracks().forEach((track) => {
      voiceInput = newPc.addTrack(track, localStream);
    });

    const callDoc = await firestore.doc(db, "calls", callId)
    const answerCandidates = firestore.collection(callDoc, 'answerCandidates');
    const offerCandidates = firestore.collection(callDoc, 'offerCandidates');

    newPc.onicecandidate = (event) => {
      if (event.candidate != null) {
        let candidate = event.candidate.toJSON()
        candidate.uid = auth.getAuth().currentUser.uid
        firestore.addDoc(answerCandidates, candidate);
      }
    };

    const callData = (await firestore.get(callDoc)).data();

    const offerDescription = callData.offer;
    await newPc.setRemoteDescription(new RTCSessionDescription(offerDescription));

    const answerDescription = await newPc.createAnswer();
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
          //newPc.addIceCandidate(new RTCIceCandidate(data));  just uncomment this when the function is re-opened
        }
      });
    });

    // Unsure why the localStream appears not to reconnect the same way it initally connected.
    // Could it be that remoteStream has lost connection and must be reconfigured somehow?

  } else {

    muteButton.classList.add('selected')
    muteButton.innerText = 'Unmute'

    sendToPeers({
      muted: true
    })

    newPc.removeTrack(voiceInput)

  }

}



nameInput.onkeyup = async (event) => {

  if (event.key == 'Enter') {
    if (myId == 0) {

      gameState.players[myId].name = nameInput.value
      playerBar.children[myId].innerText = nameInput.value

      sendToPeers(gameState);

    } else {

      playerBar.children[myId].innerText = nameInput.value

      sendToPeers({
        name: nameInput.value
      })

    }

  }
  
}



dismissButton.onclick = async () => {

  gameState = initialGameState

  disconnectFrame.classList.add('banished')
  preGameFrame.classList.remove('banished')

  joinInput.value = ''
  joinInput.removeAttribute('disabled')
  joinButton.removeAttribute('disabled')
  callButton.removeAttribute('disabled')

  playerBar.classList.add('banished')

  nameInput.setAttribute('placeholder', '')

  leaveButton.setAttribute('disabled', true)
  //muteButton.setAttribute('disabled', true)
  nameInput.setAttribute('disabled', true)

  responseCard.classList.add('banished')

}



function parseGameState(data, gameState, playerId) {

  var message = JSON.parse(data)

  let parsedGameState = wakeObject(gameState)
  
  if (typeof(message.ready) == 'boolean') {
    
    parsedGameState.players[playerId].ready = message.ready
    
  }

  if (typeof(message.name) == 'string') {

    let peerIndex = Object.keys(parsedGameState.players).indexOf('' + playerId + '')
    
    parsedGameState.players[playerId].name = message.name
    playerBar.children[peerIndex].innerText = message.name
    
  }

  if (typeof(message.muted) == 'boolean') {
    
    parsedGameState.players[playerId].muted = message.muted

    /*if (message.muted == true) {

      newPc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          voiceOutput = remoteStream.addTrack(track);
        });
      };

    }*/
    
  }

  if (typeof(message.response) == 'number' && gameState.currentRound.segment == 'response') {

    let responseIsValid = false

    let i = 1
    while (i <= 5) {

      if (message.response - 1 == parseInt((parsedGameState.players[playerId].responseString).charAt(6 * parsedGameState.currentRound.roundNum - 6 + i), 25)) {
        responseIsValid = true
      }
      
      i++

    }
    
    if (responseIsValid) {
      parsedGameState.players[playerId].response = message.response
    }

  }

  if (typeof(message.responsePack) == 'number' && gameState.currentRound.segment == 'response' && message.responsePack - 1 == parseInt((parsedGameState.players[playerId].responseString).charAt(6 * parsedGameState.currentRound.roundNum - 6), Object.keys(responses).length)) {
    
    parsedGameState.players[playerId].responsePack = message.responsePack
    
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



/* OVERVIEW OF OBSERVATIONS

  1. Peer connects to host as usual, call established, nothing wrong

x 2. When host mutes, they fail to send that info to the client and so they are oblivious (and don't print '1b')

x 3. First time the host unmutes, the CreateGame function appears to address this NegotiationNeeded and creates offers

  4. These offers are answered by the UnmuteButton (as desired, but this means the host is re-negotiating with itself)

  5. The subsequent attempts of the host to unmute seem to answer non-existant offers?

Address the 'muted' communication failure, stop CreateGame from doing whatever it is doing.

*/