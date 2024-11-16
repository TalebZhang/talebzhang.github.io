const user = localStorage.getItem('user');
const userData = user ? JSON.parse(user) : null; // Handle null case
let userName = userData ? userData.email : '';  // Use email from userData
let password = '';
let socket; // Declare socket in the higher scope

(async () => {
    if (!userName) {
        console.error("No username found in localStorage or userData.");
        return;
    }

    try {
        const response = await fetch(`https://chatapp-bsrk.onrender.com/get-password/${userName}`);
        if (!response.ok) {
            throw new Error("Failed to fetch password");
        }

        const data = await response.json();
        password = data.password;

        console.log("Socket initialized with username and password:", password);

        //if trying it on a phone, use this instead...
        // const socket = io.connect('https://LOCAL-DEV-IP-HERE:8181/',{
        socket = io.connect('https://chatapp-bsrk.onrender.com',{
            auth: {
                userName,password
            }
        })
    } catch (error) {
        console.error("Error fetching password or initializing socket:", error);
    }
})();

const localVideoEl = document.querySelector('#local-video');
const remoteVideoEl = document.querySelector('#remote-video');

let localStream; //a var to hold the local video stream
let remoteStream; //a var to hold the remote video stream
let peerConnection; //the peerConnection that the two clients use to talk
let didIOffer = false;

let peerConfiguration = {
    iceServers:[
        {
            urls:[
              'stun:stun.l.google.com:19302',
              'stun:stun1.l.google.com:19302'
            ]
        }
    ]
}

//when a client initiates a call
const call = async e=>{
    await fetchUserMedia();

    //peerConnection is all set with our STUN servers sent over
    await createPeerConnection();

    //create offer time!
    try{
        console.log("Creating offer...")
        const offer = await peerConnection.createOffer();
        console.log(offer);
        peerConnection.setLocalDescription(offer);
        didIOffer = true;
        socket.emit('newOffer',offer); //send offer to signalingServer
    }catch(err){
        console.log(err)
    }

}

const answerOffer = async(offerObj)=>{
    await fetchUserMedia()
    await createPeerConnection(offerObj);
    const answer = await peerConnection.createAnswer({}); //just to make the docs happy
    await peerConnection.setLocalDescription(answer); //this is CLIENT2, and CLIENT2 uses the answer as the localDesc
    console.log(offerObj)
    console.log(answer)
    // console.log(peerConnection.signalingState) //should be have-local-pranswer because CLIENT2 has set its local desc to it's answer (but it won't be)
    //add the answer to the offerObj so the server knows which offer this is related to
    offerObj.answer = answer 
    //emit the answer to the signaling server, so it can emit to CLIENT1
    //expect a response from the server with the already existing ICE candidates
    const offerIceCandidates = await socket.emitWithAck('newAnswer',offerObj)
    offerIceCandidates.forEach(c=>{
        peerConnection.addIceCandidate(c);
        console.log("======Added Ice Candidate======")
    })
    console.log(offerIceCandidates)
}

const addAnswer = async(offerObj)=>{
    //addAnswer is called in socketListeners when an answerResponse is emitted.
    //at this point, the offer and answer have been exchanged!
    //now CLIENT1 needs to set the remote
    await peerConnection.setRemoteDescription(offerObj.answer)
    // console.log(peerConnection.signalingState)
}

const fetchUserMedia = ()=>{
    return new Promise(async(resolve, reject)=>{
        try{
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            localVideoEl.srcObject = stream;
            localStream = stream;    
            resolve();    
        }catch(err){
            console.log(err);
            reject()
        }
    })
}

const createPeerConnection = (offerObj)=>{
    return new Promise(async(resolve, reject)=>{
        //RTCPeerConnection is the thing that creates the connection
        //we can pass a config object, and that config object can contain stun servers
        //which will fetch us ICE candidates
        peerConnection = await new RTCPeerConnection(peerConfiguration)
        remoteStream = new MediaStream()
        remoteVideoEl.srcObject = remoteStream;


        localStream.getTracks().forEach(track=>{
            //add localtracks so that they can be sent once the connection is established
            peerConnection.addTrack(track,localStream);
        })

        peerConnection.addEventListener("signalingstatechange", (event) => {
            console.log(event);
            console.log(peerConnection.signalingState)
        });

        peerConnection.addEventListener('icecandidate',e=>{
            console.log('........Ice candidate found!......')
            console.log(e)
            if(e.candidate){
                socket.emit('sendIceCandidateToSignalingServer',{
                    iceCandidate: e.candidate,
                    iceUserName: userName,
                    didIOffer,
                })    
            }
        })
        
        peerConnection.addEventListener('track',e=>{
            console.log("Got a track from the other peer!! How excting")
            console.log(e)
            e.streams[0].getTracks().forEach(track=>{
                remoteStream.addTrack(track,remoteStream);
                console.log("Here's an exciting moment... fingers cross")
            })
        })

        if(offerObj){
            //this won't be set when called from call();
            //will be set when we call from answerOffer()
            // console.log(peerConnection.signalingState) //should be stable because no setDesc has been run yet
            await peerConnection.setRemoteDescription(offerObj.offer)
            // console.log(peerConnection.signalingState) //should be have-remote-offer, because client2 has setRemoteDesc on the offer
        }
        resolve();
    })
}

const addNewIceCandidate = iceCandidate=>{
    peerConnection.addIceCandidate(iceCandidate)
    console.log("======Added Ice Candidate======")
}

// Hang up the call (close the WebRTC connection)
const  hangup = () => {
    if (peerConnection) {
        // Close peer connection
        peerConnection.close();
        peerConnection = null;

        // Stop local media stream
        localStream.getTracks().forEach(track => {
            track.stop();
        });
        localStream = null;

        // Stop remote media stream
        if (remoteStream) {
            remoteStream.getTracks().forEach(track => {
                track.stop();
            });
            remoteStream = null;
        }

        // Notify server that the call is ended
        socket.emit('hangup');
    }
}


socket.on('hangup', () => {
    alert('The other user has hung up the call.');
    hangup();
});

document.getElementById('hangup').addEventListener('click', hangup);

document.querySelector('#call').addEventListener('click',call);

let isVideoActive = true; 
const toggleVideoButton = document.querySelector('#toggle-video');

const toggleVideo = () => {
    if (isVideoActive) {
        stopVideo();
        toggleVideoButton.innerHTML = '<i class="fas fa-video"></i>'; 
    } else {
        fetchUserMedia().catch(err => {
            console.error('Error accessing media devices:', err);
        });
        toggleVideoButton.innerHTML = '<i class="fas fa-video-slash"></i>';   
    }

    isVideoActive = !isVideoActive;
};


const stopVideo = () => {
    if (localStream) {
        const videoTracks = localStream.getVideoTracks();
        videoTracks.forEach(track => track.stop());
        localVideoEl.srcObject = null;  
    }
};

toggleVideoButton.addEventListener('click', toggleVideo);
