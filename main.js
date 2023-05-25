import * as firebase from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import * as firestore from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js'

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

  var db = firestore.getFirestore(app)
}

const servers = {
  iceServers: [
    {
      urls: "stun:a.relay.metered.ca:80",
    },
    {
      urls: "relay1.expressturn.com:3478",
      username: "efG6D6WWAEIJ3WIA6P",
      credential: "qktQdzg7FnH87YjM",
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
        console.log('si 0.5')
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
    segment: '',
    timeLeft: 0,
    spotlight: '',
    promptType: '',
    player: ''
  },
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

const playerBar = document.getElementById('playerBar')

const leaveButton = document.getElementById('leaveButton');
const muteButton = document.getElementById('muteButton');
const nameInput = document.getElementById('nameInput');


// Element classes
const cards = document.getElementsByClassName('card');


const prompts = {
  'standard': {
    'name': 'Standard prompt',
    'prompts':  [
        'Industry advocates have criticised',
        'Is anyone here',
        'An apartment littered with strangers\' clothes. Day in the life of',
        'Yikes. This place is in urgent need of',
        'The President of the United States is',
        'Riddle me this:',
        'My dad is skeptical of the science behind',
        'What\'s life without',
        'Yikes. The office is in urgent need of',
        'I\'ve travelled back in time to stop',
        'I\'m not ill, I\'m simply',
        'Took a trip to Timbuktu. My favourite thing? The bit where I was',
        'Come on, how does this exist: ',
        'Ugh, what\'s that smell? Someone\'s',
        'New num, who dis?',
        '1944, a year of',
        'Times are tough, but at least I\'m not',
        'Sorry to inform you, but you\'re',
        'There will always be a special place in my heart for',
        'What the haters don\'t know is I\'m',
        'Let\'s take a moment to appreciate',
        'Shout out to',
        'They\'re back at it again,'
    ]
  }
}

const responses = [
  {
    'emoji': '🏳️‍🌈',
    'responses': [
      'gay',
      'a fairy, skittle, special snowflake',
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
      'in agreement that lesbians are a woke myth',
      'one o\' them raging homosexuals',
      'the pride month equivalent of The Grinch',
      'a big fan of compulsory homosexuality',
      'livin\' life queer',
      'banging men',
      'attending drama classes',
      'a drag queen'
    ]
  },
  {
    'emoji': '🤓',
    'responses': [
      'factorising the polynomial',
      'the next Einstein',
      'pursuing a career in quantum physics',
      'reciting pi to at least three digits',
      'radiating nerd emoji',
      'mentally gifted',
      'paying off my college debt',
      'studying some social skills',
      'a sweaty nerd',
      'the Kowalski of the class',
      'calculating the probability that you\'re a nerd',
      'asking for extension questions',
      'a product of the private education system',
      'the Dweeb of the Year',
      'focusing on math and music, nothing else matters',
      'a virgin',
      'a brainiac',
      'selling cheat-sheets, 50 cents a pop',
      'doing homework',
      'Stephen Hawking',
      'a Nobel Prize winner',
      'Mayor of Dorktopia',
      'hanging out at the bully-free zone',
      'schooling these other nerds to prove superiority',
      'one of our greatest minds'
    ]
  },
  {
    'emoji': '🇬🇷',
    'responses': [
      'a malakia',
      'spraying tzatziki everywhere',
      'adding incest to the Olympics',
      'Greece\'s debt collector',
      'certified Greek, seven days a week',
      'grillin\' and chillin\'',
      'shouting \'Eureka\' and running nude down the street',
      'the godfather of democracy',
      'Plato',
      'sailing to Athens',
      'using calamari as a means of torture',
      'bringing democracy to the people (only the male elite)',
      'the owner of a construction company',
      'a good-for-nothing wog',
      'pretending that a bunch of little islands is a \'country\'',
      'Hercules',
      'doing the Macarena',
      'more smoked than a souvla',
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

  gameState.players[myId] = ({
    id: myId,
    name: 'Host',
    ready: false,
    muted: false,
    responsePack: 0,
    response: 0
  })

  // Reference Firestore collections for signaling

  callId = Math.floor(Math.random() * 61439 + 4096).toString(16).toLowerCase()
  joinInput.value = callId

  navigator.clipboard.writeText(callId)
  
  let callDoc = firestore.doc(db, 'calls', callId)
  await firestore.setDoc(callDoc, {})
  let offerCandidates = firestore.collection(callDoc, 'offerCandidates');
  let answerCandidates = firestore.collection(callDoc, 'answerCandidates');

  segmentText.innerText = 'Lobby'
  spotlightText.innerText = `Waiting for 4 players to join the game.
Your room code is ` + callId + `.`

  gameState.currentRound.segment = 'Lobby'
  gameState.currentRound.spotlight = `Waiting for 4 players to join the game.
Your room code is ` + callId + `.`

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

    let roundNum = 1
    let promptsChosen = []

    readyButton.classList.remove('banished')

    readyButton.onclick = async () => {
      
      readyButton.classList.add('banished')
      runRound()
      
    }

    function runRound() {

      var promptId = Math.floor(Math.random() * (prompts.standard.prompts.length))

      while (promptsChosen.find(element => element == promptId)) {
         
        promptId = Math.floor(Math.random() * (prompts.standard.prompts.length))

      }

      var prompt = prompts.standard.prompts[promptId]
      promptsChosen.push(promptId)

      gameState.currentRound.segment = 'Prompt'
      gameState.currentRound.spotlight = prompt + ' _____'
      gameState.currentRound.promptType = 'standard'
      gameState.currentRound.timeLeft = 3

      
      segmentText.innerText = 'Prompt'
      spotlightText.innerText = prompt + ' _____'

      responseCard.classList.add('banished')

      let playerList = Object.keys(gameState.players)
          
      playerList.forEach(function(key, keyIndex) {

        gameState.players[key].responsePack = 0
        gameState.players[key].response = 0

      })

      sendToPeers(gameState);

      setTimeout(function() {

        gameState.currentRound.segment = 'Response'
        gameState.currentRound.timeLeft = 15

        segmentText.innerText = 'Response'

        Object.keys(cardFrame.children).forEach((child) => {
          cardFrame.children[0].remove()
        })

        let i = 1
        let responsePackChosen = Math.floor(Math.random() * (responses.length))
        let responsesChosen = []

        while (i <= 5) {

          let responseId = Math.floor(Math.random() * (responses[responsePackChosen].responses.length))

          while (responsesChosen.find(element => element == responseId)) {
         
            responseId = Math.floor(Math.random() * (responses[responsePackChosen].responses.length))

          }

          responsesChosen.push(responseId)
          
          let newCard = cardFrame.appendChild(responseCard.cloneNode(true))
          newCard.removeAttribute('id')
          newCard.classList.remove('banished')
          newCard.children[0].innerText = responses[responsePackChosen].responses[responseId]
          newCard.children[1].innerText = responses[responsePackChosen].emoji

          twemoji.parse(newCard.children[1])

          newCard.onclick = async () => {

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
              
              gameState.currentRound.segment = 'Reveal'
              gameState.currentRound.timeLeft = 6
              gameState.currentRound.player = player.id

              segmentText.innerText = 'Reveal'

              cardFrame.classList.add('banished')

              responseCard.classList.remove('banished')

              gameState.currentRound.spotlight = player.id

              if (player.responsePack == 0 || responses[player.responsePack - 1] === undefined || player.response == 0 || responses[player.responsePack - 1].responses[player.response - 1] === undefined) {
                responseText.innerText = player.name + ' gave no response'
                responseEmoji.innerText = '📄'
              } else {
                responseText.innerText = responses[player.responsePack - 1].responses[player.response - 1]
                responseEmoji.innerText = responses[player.responsePack - 1].emoji
              }

              twemoji.parse(responseEmoji)

              sendToPeers(gameState);

            }, 6000 * keyIndex)

          })
          
          setTimeout(function() {

            responseCard.classList.add('banished')

            roundNum++

            if (roundNum <= 5) {

              runRound()

            } else {

              gameState.currentRound.segment = 'Podium'
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
        segmentText.innerText = gameState.currentRound.segment + ' • ' + timeLeft + 's'

        var timer = setInterval(function() {

          timeLeft--

          if (timeLeft <= 0) {
            clearInterval(timer)
            
            segmentText.classList.remove('i')
          } else {
            segmentText.innerText = gameState.currentRound.segment + ' • ' + timeLeft + 's'
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
        responsePack: 0,
        response: 0
      })

      if (Object.keys(gameState.players).length >= 4 && gameState.currentRound.segment == 'Lobby') {
        
        let newPlayerLabel = document.createElement('p')
        newPlayerLabel.innerText = gameState.players[playerId].name

        playerBar.appendChild(newPlayerLabel)
        
        runGame()
        
      } else if (gameState.currentRound.segment == 'Lobby') {

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
      console.log('discon.')
      sendToPeers(gameState)
    }

    // Get candidates for caller, save to db
    newPc.onicecandidate = (event) => {
      event.candidate && firestore.addDoc(offerCandidates, event.candidate.toJSON());
    };

    // Create offer
    let offerDescription = await newPc.createOffer();
    await newPc.setLocalDescription(offerDescription);

    let offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    await firestore.setDoc(callDoc, { offer });

    // Listen for remote answer
    firestore.onSnapshot(callDoc, (snapshot) => {
      let data = snapshot.data();
      if (!newPc.currentRemoteDescription && data?.answer) { // On answer
        let answerDescription = new RTCSessionDescription(data.answer);
        newPc.setRemoteDescription(answerDescription);
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

  callId = joinInput.value.toLowerCase();

  const callDoc = await firestore.doc(db, "calls", callId)
  
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
          console.log('mal')
          console.log(gameState)
          console.log(parsedGameState)

        } else if (newPlayers.length < prevPlayers.length) {
          console.log('si')

          prevPlayers.forEach(playerId => {

            if (!parsedGameState.players[playerId]) {
              let peerIndex = prevPlayers.indexOf(playerId)
              console.log('muy bien')
              playerBar.children[peerIndex].remove()
            }

          })

        } else {

          newPlayers.forEach(playerId => {

            let peerIndex = newPlayers.indexOf(playerId)

            playerBar.children[peerIndex].innerText = parsedGameState.players[playerId].name

          })
          
        }

        
        if (parsedGameState.currentRound.segment == 'Reveal') {

          segmentText.innerText = parsedGameState.currentRound.segment

          cardFrame.classList.add('banished')

          responseCard.classList.remove('banished')

          let player = parsedGameState.players[parsedGameState.currentRound.player]

          if (player.responsePack == 0 || responses[player.responsePack - 1] === undefined || player.response == 0 || responses[player.responsePack - 1].responses[player.response - 1] === undefined) {
            responseText.innerText = player.name + ' gave no response'
            responseEmoji.innerText = '📄'
          } else {
            responseText.innerText = responses[player.responsePack - 1].responses[player.response - 1]
            responseEmoji.innerText = responses[player.responsePack - 1].emoji
          }

          twemoji.parse(responseEmoji)

        } else if (parsedGameState.currentRound.segment == 'Podium') {

          segmentText.innerText = parsedGameState.currentRound.segment
          spotlightText.innerText = parsedGameState.currentRound.spotlight

          responseCard.classList.add('banished')

        } 
        
        if (parsedGameState.currentRound.segment == 'Lobby' || parsedGameState.currentRound.segment == 'Prompt') {

          responseCard.classList.add('banished')

          segmentText.innerText = parsedGameState.currentRound.segment
          spotlightText.innerText = parsedGameState.currentRound.spotlight

        }

        if (parsedGameState.currentRound.segment == 'Response' && gameState.currentRound.segment != 'Response') {

          var timeLeft = 15

          segmentText.classList.add('i')
          segmentText.innerText = parsedGameState.currentRound.segment + ' • ' + timeLeft + 's'
          spotlightText.innerText = parsedGameState.currentRound.spotlight

          var timer = setInterval(function() {

            timeLeft--

            if (timeLeft <= 0) {
              clearInterval(timer)
              
              segmentText.classList.remove('i')
            } else {
              segmentText.innerText = parsedGameState.currentRound.segment + ' • ' + timeLeft + 's'
            }

          }, 1000)

          Object.keys(cardFrame.children).forEach((child) => {
            cardFrame.children[0].remove()
          })

          let i = 1
          let responsePackChosen = Math.floor(Math.random() * (responses.length))
          let responsesChosen = []

          while (i <= 5) {

            let responseId = Math.floor(Math.random() * (responses[responsePackChosen].responses.length))
  
            while (responsesChosen.find(element => element == responseId)) {
           
              responseId = Math.floor(Math.random() * (responses[responsePackChosen].responses.length))
  
            }
  
            responsesChosen.push(responseId)
            
            let newCard = cardFrame.appendChild(responseCard.cloneNode(true))
            newCard.removeAttribute('id')
            newCard.classList.remove('banished')
            newCard.children[0].innerText = responses[responsePackChosen].responses[responseId]
            newCard.children[1].innerText = responses[responsePackChosen].emoji

            twemoji.parse(newCard)
  
            newCard.onclick = async () => {
  
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
      event.candidate && firestore.addDoc(answerCandidates, event.candidate.toJSON());
    };

    const callData = (await firestore.getDoc(callDoc)).data();

    const offerDescription = callData.offer;
    await newPc.setRemoteDescription(new RTCSessionDescription(offerDescription));

    const answerDescription = await newPc.createAnswer();
    await newPc.setLocalDescription(answerDescription);

    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
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
      event.candidate && firestore.addDoc(answerCandidates, event.candidate.toJSON());
    };

    const callData = (await firestore.get(callDoc)).data();

    const offerDescription = callData.offer;
    await newPc.setRemoteDescription(new RTCSessionDescription(offerDescription));

    const answerDescription = await newPc.createAnswer();
    await newPc.setLocalDescription(answerDescription);

    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
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

  if (typeof(message.response) == 'number' && gameState.currentRound.segment == 'Response') {
    
    parsedGameState.players[playerId].response = message.response
    
  }

  if (typeof(message.responsePack) == 'number' && gameState.currentRound.segment == 'Response') {
    
    parsedGameState.players[playerId].responsePack = message.responsePack
    
  }

  return parsedGameState

}



/* OVERVIEW OF OBSERVATIONS

  1. Peer connects to host as usual, call established, nothing wrong

x 2. When host mutes, they fail to send that info to the client and so they are oblivious (and don't print '1b')

x 3. First time the host unmutes, the CreateGame function appears to address this NegotiationNeeded and creates offers

  4. These offers are answered by the UnmuteButton (as desired, but this means the host is re-negotiating with itself)

  5. The subsequent attempts of the host to unmute seem to answer non-existant offers?

Address the 'muted' communication failure, stop CreateGame from doing whatever it is doing.

*/
