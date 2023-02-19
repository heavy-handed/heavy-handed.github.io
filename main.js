import firebase from 'firebase/app';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBJogGCKQFmy36HfQeHnxgr7sL930E6GFk",
  authDomain: "gamesnight-server.firebaseapp.com",
  databaseURL: "https://gamesnight-server-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "gamesnight-server",
  storageBucket: "gamesnight-server.appspot.com",
  messagingSenderId: "347855657762",
  appId: "1:347855657762:web:e5845d10d138e42401637b"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const firestore = firebase.firestore();

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

// Global State
let pc = new RTCPeerConnection(servers);

let localStream = null
// https://blog.mozilla.org/webrtc/perfect-negotiation-in-webrtc/

let voiceInput = null;
let voiceOutput = null;

let callId = null;

let gameStateChannel = null;

function createId() { return Math.floor(Math.random() * 1000000) }

let playerConnections = {}

const initialGameState = {
  currentRound: {
    segment: '',
    timeLeft: 0,
    spotlight: '',
    promptType: '',
    player: ''
  },
  players: {},
  numPlayers: 2,
};

let gameState = initialGameState

// HTML elements
const callButton = document.getElementById('callButton');
const joinInput = document.getElementById('joinInput');
const joinButton = document.getElementById('joinButton');
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

const responses = {
  'pride': {
    'emoji': '🏳‍🌈',
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
      'learning theatre',
      'a drag queen'
    ]
  }
}


// 1. Setup media sources

callButton.onclick = async () => {

  joinInput.setAttribute('disabled', true)
  joinButton.setAttribute('disabled', true)
  callButton.setAttribute('disabled', true)

  leaveButton.removeAttribute('disabled')
  //muteButton.removeAttribute('disabled')
  nameInput.removeAttribute('disabled')

  localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  let remoteStream = new MediaStream();

  // Push tracks from local stream to peer connection
  localStream.getTracks().forEach((track) => {
    voiceInput = pc.addTrack(track, localStream);
  });

  // Pull tracks from remote stream, add to video stream
  pc.ontrack = (event) => {
    console.log('pc.ontrack fired')
    event.streams[0].getTracks().forEach((track) => {
      voiceOutput = remoteStream.addTrack(track);
    });
  };

  //outputAudio.srcObject = remoteStream;

  var hostId = 0

  gameState.players[hostId] = ({
    id: hostId,
    name: 'Host',
    ready: false,
    muted: false,
    response: 0
  })

  // Create channel to send other (non-media) data
  gameStateChannel = pc.createDataChannel('gameState', { id: 1 });

  gameStateChannel.onopen = (event) => {
    gameStateChannel.send(JSON.stringify(gameState));
  }

  var playerId = createId()

  playerConnections[createId()] = pc

  gameState.players[playerId] = ({
    id: playerId,
    name: 'Player',
    ready: false,
    muted: false,
    response: 0
  })

  gameStateChannel.onmessage = (event) => {

    let parsedGameState = parseGameState(event.data, gameState, playerId)

    gameStateChannel.send(JSON.stringify(parsedGameState));

    console.log('GameState updated:')
    console.log(parsedGameState)

    if (gameState.players[playerId].muted) { // yes shane, this is correct
      console.log('1a')

      pc.onnegotiationneeded = async () => { // because this picks up a problem
        console.log('3a')
        if (gameState.players[playerId].muted) {

          console.log('2a')

          const offerDescription = await pc.createOffer();
          await pc.setLocalDescription(offerDescription);
      
          const offer = {
            sdp: offerDescription.sdp,
            type: offerDescription.type,
          };

          const callDoc = firestore.collection('calls').doc(callId);
      
          await callDoc.set({ offer });
          
          // disabled the following because each event has an ongoing trigger, seen line 203 and below

          // Listen for remote answer
          /*callDoc.onSnapshot((snapshot) => {
            const data = snapshot.data();
            if (!pc.currentRemoteDescription && data?.answer) { // On answer
              const answerDescription = new RTCSessionDescription(data.answer);
              pc.setRemoteDescription(answerDescription);      
            }
          });*/

          // When answered, add candidate to peer connection
          /*answerCandidates.onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                console.log('A resolve answer')

                const candidate = new RTCIceCandidate(change.doc.data());
                pc.addIceCandidate(candidate);

              }
            });
          });*/

        }
      }

    }

    if (parsedGameState.players[playerId].ready && gameState.currentRound.segment == 'Lobby') {
      
      runGame()

    }

    gameState = parsedGameState

  }
  

  // P A R T  2
  
  
  // Reference Firestore collections for signaling
  const callDoc = firestore.collection('calls').doc();
  const offerCandidates = callDoc.collection('offerCandidates');
  const answerCandidates = callDoc.collection('answerCandidates');

  callId = callDoc.id
  joinInput.value = callId

  segmentText.innerText = 'Lobby'
  spotlightText.innerText = 'Your room code is ' + callId

  gameState.currentRound.segment = 'Lobby'
  gameState.currentRound.spotlight = 'Your room code is ' + callId

  navigator.clipboard.writeText(callId)

  // Get candidates for caller, save to db
  pc.onicecandidate = (event) => {
    event.candidate && offerCandidates.add(event.candidate.toJSON());
  };

  // Create offer
  const offerDescription = await pc.createOffer();
  await pc.setLocalDescription(offerDescription);

  const offer = {
    sdp: offerDescription.sdp,
    type: offerDescription.type,
  };

  await callDoc.set({ offer });

  // Listen for remote answer
  callDoc.onSnapshot((snapshot) => {
    const data = snapshot.data();
    if (!pc.currentRemoteDescription && data?.answer) { // On answer
      const answerDescription = new RTCSessionDescription(data.answer);
      pc.setRemoteDescription(answerDescription);      
    }
  });

  // When answered, add candidate to peer connection
  answerCandidates.onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        console.log('CreateCall resolve answer')

        const candidate = new RTCIceCandidate(change.doc.data());
        pc.addIceCandidate(candidate);
      }
    });
  });

  preGameFrame.classList.add('banished')

  gameFrame.classList.remove('banished')

  function runGame() {

    let roundNum = 1

    runRound()

    function runRound() {

      var promptId = Math.floor(Math.random() * (prompts.standard.prompts.length))
      var prompt = prompts.standard.prompts[promptId]
      console.log(promptId)

      gameState.currentRound.segment = 'Prompt'
      gameState.currentRound.spotlight = prompt
      gameState.currentRound.promptType = 'standard'
      gameState.currentRound.timeLeft = 2

      
      segmentText.innerText = 'Prompt'
      spotlightText.innerText = prompt + ' _____'

      responseCard.classList.add('banished')

      let playerList = Object.keys(gameState.players)
          
      playerList.forEach(function(key, keyIndex) {

        gameState.players[key].response = 0

      })

      gameStateChannel.send(JSON.stringify(gameState));

      setTimeout(function() {

        gameState.currentRound.segment = 'Response'
        gameState.currentRound.timeLeft = 8

        segmentText.innerText = 'Response'

        Object.keys(cardFrame.children).forEach((child) => {
          cardFrame.children[0].remove()
        })

        let i = 1

        let responseIds = []

        while (i <= 5) {

          let responseId = Math.floor(Math.random() * (responses.pride.responses.length))

          while (responseIds.find(element => element == responseId)) {
         
            responseId = Math.floor(Math.random() * (responses.pride.responses.length))

          }

          responseIds.push(responseId)
          
          const newCard = cardFrame.appendChild(responseCard.cloneNode(true))
          newCard.removeAttribute('id')
          newCard.classList.remove('banished')
          newCard.children[0].innerText = responses.pride.responses[responseId]
          newCard.children[1].innerText = responses.pride.emoji

          newCard.onclick = async () => {

            console.log(responseId + 1)

            gameState.players[hostId].response = responseId + 1

          }

          i++

        }

        setTimeout(function() {
          cardFrame.classList.remove('banished')
        }, 0)

        gameStateChannel.send(JSON.stringify(gameState));

        setTimeout(function() {

          let playerList = Object.keys(gameState.players)
          
          playerList.forEach(function(key, keyIndex) {

            var player = gameState.players[key]

            setTimeout(function() {
              
              gameState.currentRound.segment = 'Reveal'
              gameState.currentRound.timeLeft = 4
              gameState.currentRound.player = player.name

              segmentText.innerText = 'Reveal'

              cardFrame.classList.add('banished')

              responseCard.classList.remove('banished')

              if (player.response == 0 || responses.pride.responses[player.response - 1] === undefined) {
                gameState.currentRound.spotlight = 0
                responseText.innerText = player.name + ' gave no response'
                responseEmoji.innerText = '📄'
              } else {
                gameState.currentRound.spotlight = player.response
                responseText.innerText = responses.pride.responses[player.response - 1]
                responseEmoji.innerText = responses.pride.emoji
              }

              gameStateChannel.send(JSON.stringify(gameState));

            }, 4000 * keyIndex)

          })
          
          setTimeout(function() {

            responseCard.classList.add('banished')

            roundNum++

            if (roundNum <= 5) {

              runRound()

            } else {

              gameState.currentRound.segment = 'Podium'
              gameState.currentRound.timeLeft = 5
              gameState.currentRound.spotlight = 'Nobody wins, nobody loses...'

              segmentText.innerText = 'Podium'
              spotlightText.innerText = 'Nobody wins, nobody loses...'

              // Announce winners or whatever

              gameStateChannel.send(JSON.stringify(gameState));

              setTimeout(function() {

                pc.close()

                console.log('connection ended with grace :)')

                gameFrame.classList.add('banished')
                disconnectFrame.classList.remove('banished')

              }, 5000)

            }

          }, 4000 * playerList.length)

        }, 8000)

      }, 2000)
    
    }

  }


};

// 3. Answer the call with the unique ID
joinButton.onclick = async () => {

  callId = joinInput.value;
  const callDoc = firestore.collection('calls').doc(callId);
  
  if (callDoc != null) {

    joinInput.setAttribute('disabled', true)
    joinButton.setAttribute('disabled', true)
    callButton.setAttribute('disabled', true)

    leaveButton.removeAttribute('disabled')
    //muteButton.removeAttribute('disabled')
    nameInput.removeAttribute('disabled')


    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    let remoteStream = new MediaStream();

    // Push tracks from local stream to peer connection
    localStream.getTracks().forEach((track) => {
      voiceInput = pc.addTrack(track, localStream);
    });

    // Pull tracks from remote stream, add to video stream
    pc.ontrack = (event) => {
      console.log('pc.ontrack fired')
      event.streams[0].getTracks().forEach((track) => {
        voiceOutput = remoteStream.addTrack(track);
      });
    };

    //outputAudio.srcObject = remoteStream;


    // Respond to new data channel
    pc.ondatachannel = (event) => {
      if (event.channel.id == 1) {

        gameStateChannel = event.channel;

        gameStateChannel.onopen = (event) => {
          gameStateChannel.send(JSON.stringify({
            ready: true
          }));
        }

        gameStateChannel.onmessage = (event) => {

          var parsedGameState = JSON.parse(event.data)

          if (!parsedGameState.players) {
            console.log('must parse new message')
            parsedGameState = parseGameState(event.data, gameState, 0)

          }

          console.log('GameState received:')
          console.log(parsedGameState);

          segmentText.innerText = parsedGameState.currentRound.segment

          if (parsedGameState.currentRound.segment == 'Reveal') {

            cardFrame.classList.add('banished')

            responseCard.classList.remove('banished')

            if (parsedGameState.currentRound.spotlight == 0) {
              responseText.innerText = parsedGameState.currentRound.player + ' gave no response'
              responseEmoji.innerText = '📄'
            } else {
              responseText.innerText = responses.pride.responses[parsedGameState.currentRound.spotlight - 1]
              responseEmoji.innerText = responses.pride.emoji
            }

          } else if (parsedGameState.currentRound.segment == 'Podium') {

            responseCard.classList.add('banished')

            spotlightText.innerText = parsedGameState.currentRound.spotlight

          } else {

            responseCard.classList.add('banished')

            spotlightText.innerText = parsedGameState.currentRound.spotlight + ' _____'

          }

          if (parsedGameState.currentRound.segment == 'Response' && gameState.currentRound.segment != 'Response') {

            Object.keys(cardFrame.children).forEach((child) => {
              cardFrame.children[0].remove()
            })

            let i = 1

            let responseIds = []

            while (i <= 5) {

              let responseId = Math.floor(Math.random() * (responses.pride.responses.length))

              while (responseIds.find(element => element == responseId)) {
            
                responseId = Math.floor(Math.random() * (responses.pride.responses.length))

              }

              responseIds.push(responseId)
              
              const newCard = cardFrame.appendChild(responseCard.cloneNode(true))
              newCard.removeAttribute('id')
              newCard.classList.remove('banished')
              newCard.children[0].innerText = responses.pride.responses[responseId]
              newCard.children[1].innerText = responses.pride.emoji

              newCard.onclick = async () => {

                console.log(responseId + 1)

                gameStateChannel.send(JSON.stringify({
                  response: responseId + 1
                }));

              }

              i++

            }

            setTimeout(function() {
              cardFrame.classList.remove('banished')
            }, 0)

          }


          if (gameState.players[0] != null) {
            if (gameState.players[0].muted == true) {
              console.log('1b')

              pc.onnegotiationneeded = async () => {
                console.log('3b')
                if (gameState.players[0].muted == true) {
                    
                  console.log('2b')

                  const offerDescription = await pc.createOffer();
                  await pc.setLocalDescription(offerDescription);

                  const offer = {
                    sdp: offerDescription.sdp,
                    type: offerDescription.type,
                  };
              
                  await callDoc.set({ offer });

                  // Listen for remote answer
                  callDoc.onSnapshot((snapshot) => {
                    const data = snapshot.data();
                    if (!pc.currentRemoteDescription && data?.answer) { // On answer
                      const answerDescription = new RTCSessionDescription(data.answer);
                      pc.setRemoteDescription(answerDescription);      
                    }
                  });

                  // When answered, add candidate to peer connection
                  answerCandidates.onSnapshot((snapshot) => {
                    snapshot.docChanges().forEach((change) => {
                      if (change.type === 'added') {
                        console.log('B resolve answer')

                        const candidate = new RTCIceCandidate(change.doc.data());
                        pc.addIceCandidate(candidate);
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
    }


    // P A R T  2


    const answerCandidates = callDoc.collection('answerCandidates');
    const offerCandidates = callDoc.collection('offerCandidates');

    pc.onicecandidate = (event) => {
      event.candidate && answerCandidates.add(event.candidate.toJSON());
    };

    const callData = (await callDoc.get()).data();

    const offerDescription = callData.offer;
    await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

    const answerDescription = await pc.createAnswer();
    await pc.setLocalDescription(answerDescription);

    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    };

    await callDoc.update({ answer });

    offerCandidates.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          console.log('JoinGame respond to offer')

          let data = change.doc.data();
          pc.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });

    preGameFrame.classList.add('banished')

    gameFrame.classList.remove('banished')

  }

};


muteButton.onclick = async () => {

  if (muteButton.classList.contains('selected')) {

    muteButton.classList.remove('selected')
    muteButton.innerText = 'Mute'

    gameStateChannel.send(JSON.stringify({
      muted: false
    }))

    // Push tracks from local stream to peer connection
    localStream.getTracks().forEach((track) => {
      voiceInput = pc.addTrack(track, localStream);
    });

    const callDoc = firestore.collection('calls').doc(callId);
    const answerCandidates = callDoc.collection('answerCandidates');
    const offerCandidates = callDoc.collection('offerCandidates');

    pc.onicecandidate = (event) => {
      event.candidate && answerCandidates.add(event.candidate.toJSON());
    };

    const callData = (await callDoc.get()).data();

    const offerDescription = callData.offer;
    await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

    const answerDescription = await pc.createAnswer();
    await pc.setLocalDescription(answerDescription);

    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    };

    await callDoc.update({ answer });

    offerCandidates.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          console.log('UnmuteButton respond to offer')

          let data = change.doc.data();
          pc.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });

    // Unsure why the localStream appears not to reconnect the same way it initally connected.
    // Could it be that remoteStream has lost connection and must be reconfigured somehow?

  } else {

    muteButton.classList.add('selected')
    muteButton.innerText = 'Unmute'

    gameStateChannel.send(JSON.stringify({
      muted: true
    }))

    pc.removeTrack(voiceInput)

  }

}

dismissButton.onclick = async () => {

  pc = new RTCPeerConnection(servers);

  pc.onconnectionstatechange = async () => {
    console.log(pc.connectionState)
  
    if (pc.connectionState == 'disconnected') {
  
      pc.close()
      
      console.log('connection ended with grace :)')
  
      gameFrame.classList.add('banished')
      disconnectFrame.classList.remove('banished')
  
    }
  
  }

  gameState = initialGameState

  disconnectFrame.classList.add('banished')
  preGameFrame.classList.remove('banished')

  joinInput.value = ''
  joinInput.removeAttribute('disabled')
  joinButton.removeAttribute('disabled')
  callButton.removeAttribute('disabled')

  leaveButton.setAttribute('disabled', true)
  //muteButton.setAttribute('disabled', true)
  nameInput.setAttribute('disabled', true)

  responseCard.classList.add('banished')

}


pc.onconnectionstatechange = async () => {
  console.log(pc.connectionState)

  if (pc.connectionState == 'disconnected' || pc.connectionState == 'failed') {

    pc.close()
    
    console.log('connection ended with grace :)')

    gameFrame.classList.add('banished')
    disconnectFrame.classList.remove('banished')

  }

}


function parseGameState(data, gameState, playerId) {

  var message = JSON.parse(data)
  var parsedGameState = gameState
  
  if (typeof(message.ready) == 'boolean') {
    
    parsedGameState.players[playerId].ready = message.ready
    
  }

  if (typeof(message.name) == 'string') {
    
    parsedGameState.players[playerId].name = message.name
    
  }

  if (typeof(message.muted) == 'boolean') {
    
    parsedGameState.players[playerId].muted = message.muted

    /*if (message.muted == true) {

      pc.ontrack = (event) => {
        console.log('pc.ontrack fired')
        event.streams[0].getTracks().forEach((track) => {
          voiceOutput = remoteStream.addTrack(track);
        });
      };

    }*/
    
  }

  if (typeof(message.response) == 'number' && gameState.currentRound.segment == 'Response') {
    
    parsedGameState.players[playerId].response = message.response
    
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