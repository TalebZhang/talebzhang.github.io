const chatBox = document.getElementById('chat-box');
        const messageInput = document.getElementById('message-input');
        const sendButton = document.getElementById('send-button');
        const callOverlay = document.getElementById('callOverlay');
        const imageUpload = document.getElementById('imageUpload');
        const sendImageBtn = document.getElementById('sendImageBtn');
        
        
        const user = localStorage.getItem('user');
        const userData = JSON.parse(user);
        let Memail = userData.email;


        messageInput.addEventListener('focus', () => {
            messageInput.classList.add('expanded');
            sendButton.style.display = 'inline';
        });
        
        const triggerAction = () => {
          // Your action here
            const message = messageInput.value.trim();
            if (message !== '') {
                messageInput.value = '';
                sendButton.style.display = 'none';
                notifyNewMessage(message);  
                // Save the message to the database
                saveMessageToDatabase(Memail, message, 'text');
            }
        };

        // Event listener for the sendButton click
        sendButton.addEventListener('click', triggerAction);
        // Event listener for the Enter key press
        document.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            triggerAction();
        }
        });


        // Open the file picker when clicking the button
        sendImageBtn.addEventListener('click', () => {
            imageUpload.click();
        });

        // Handle the selected image file
        imageUpload.addEventListener('change', () => {
            const file = imageUpload.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                    const base64Image = reader.result;
                    sendSignal({ type: 'image', data: base64Image });
                };
                reader.readAsDataURL(file);
            }
        });


        
        // Append the message to the chat box
        function appendMessage(message, sender, timestamp, type) {
            const messageElement = document.createElement('div');
            messageElement.classList.add('chat-message', sender); 

            // Create and add timestamp element
            const timestampElement = document.createElement('small');
            timestampElement.classList.add('timestamp');
            timestampElement.textContent = formatTimestamp(timestamp); // Format timestamp for readability
            messageElement.appendChild(timestampElement);

            if (type === 'audio') {
            const audioElement = document.createElement('audio');
            audioElement.controls = true;
            audioElement.src = message; // URL to the audio file (you'll save this on the server)
            messageElement.appendChild(audioElement);
        } else {
            const messageText = document.createElement('p');
            messageText.textContent = message;
            messageElement.appendChild(messageText);
        }
            
            chatBox.appendChild(messageElement);
        }

        

        // Format the timestamp (e.g., convert to readable format like '12:30 PM')
        function formatTimestamp(timestamp) {
            // Check if the timestamp is valid
            if (!timestamp) return 'Invalid date';
            
            const date = new Date(timestamp);
            
            // Check if the date conversion succeeded
            if (isNaN(date.getTime())) {
                return 'Invalid date'; 
            }
            // Format the date to include year, month, day, hour, and minute
            return date.toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });
            }


        
        // Save message to the database
        function saveMessageToDatabase(email, message, type = 'text') {
            fetch(`https://chatapp-bsrk.onrender.com/send-message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email, messageContent: message }),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Message saved', data);
                loadMessages(email);
            })
            .catch(error => {
                console.error('Error saving message:', error);
            });
        }

        let lastLoadedTimestamp = 0; // Track the last loaded message timestamp
        
        // Load previous messages
        function loadMessages(email, type = '') {
        
            // Construct query parameters for email and type
            const queryParam = `?email=${encodeURIComponent(email)}${type ? `&type=${type}` : ''}`;
    
            fetch(`https://chatapp-bsrk.onrender.com/messages${queryParam}`, {
                method: 'GET', // Using GET since we’re sending data as query parameters
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(response => response.json())
            .then(messages => {
                let newMessages = [];
                    
                if (Array.isArray(messages)) {
                    newMessages = messages.filter(msg => new Date(msg.timestamp).getTime() > lastLoadedTimestamp);
                    
                    // Append each new message to the chat box
                    newMessages.forEach(msg => {
                        if(email==='test@gmail.com'){
                            const sender = 'self';
                            appendMessage(msg.content, sender, msg.timestamp, msg.type);
                        } else {
                            const sender = 'user';
                            appendMessage(msg.content, sender, msg.timestamp, msg.type);
                        }
                    
                    });

                         // If there are new messages, show a reminder
                    if (newMessages.length > 0) {
                        showNewMessageReminder(newMessages.length);
                        showNewMessageReminder1(newMessages.length);
                        chatBox.scrollTop = chatBox.scrollHeight;
                    }

                    // Update lastLoadedTimestamp to the latest message timestamp
                    if (messages.length > 0) {
                        lastLoadedTimestamp = new Date(messages[messages.length - 1].timestamp).getTime();
                    }
                } else {
                    console.error('Received data is not an array:', messages);
                }
            })
            .catch(error => {
                console.error('Error loading messages:', error);
            });
        }

        


        // Check if notifications are supported by the browser
        if ("Notification" in window) {
            // Ask for notification permission
            Notification.requestPermission().then(function(permission) {
                if (permission === "granted") {
                    console.log("Notification permission granted.");
                } else {
                    console.log("Notification permission denied.");
                }
            }).catch(function(error) {
                console.error("Error requesting notification permission:", error);
            });
        } else {
            console.log("Notifications are not supported by this browser.");
        }

        // Function to show a reminder when new messages are loaded
        function showNewMessageReminder1(newMessageCount) {
            if (Notification.permission === "granted") {
                const notification = new Notification("新消息", {
                    body: `${newMessageCount} new message${newMessageCount > 1 ? 's' : ''}`,
                    icon: 'https://yozipic.top/pic/icon.png', // Update this to the correct URL
                    badge: 'https://yozipic.top/pic/badge.png', // Use your badge URL
                    tag: 'new-message-notification', // Used to group multiple notifications
                });

                // Automatically close the notification after a few seconds
                setTimeout(() => {
                    notification.close();
                }, 5000);
            }
        }

        

        // Function to show a reminder when new messages are loaded
        function showNewMessageReminder(newMessageCount) {
            const reminder = document.createElement('div');
            reminder.classList.add('new-message-reminder');
            reminder.textContent = `${newMessageCount} new message${newMessageCount > 1 ? 's' : ''}`;
            document.body.appendChild(reminder);

            // Remove the reminder after a few seconds
            setTimeout(() => {
                reminder.remove();
            }, 3000);
        }

        // Function to handle friend item click
        const friendItems = document.querySelectorAll('.friend-item');
        const friendsPage = document.getElementById('friends-page');
        const chatPageBox = document.getElementById('chatpagebox');


        // Loop through each friend item and add a click event
        friendItems.forEach(item => {
        item.addEventListener('click', function() {
            // Hide friends page and show friend details page
            friendsPage.style.display = 'none';
            chatPageBox.style.display = 'block';

            // // Get the friend's name and status dynamically
            // const friendName = item.querySelector('.friend-name').textContent;
            // const friendStatus = item.querySelector('.friend-status').textContent;
            // const friendTime = item.querySelector('.message-time').textContent;

            // // Populate the details page with the clicked friend's information
            // chatPageBox.innerHTML = `
            //   <h3>${friendName}</h3>
            //   <p><strong>Status:</strong> ${friendStatus}</p>
            //   <p><strong>Last seen:</strong> ${friendTime}</p>
            //   <!-- Add more details here if necessary -->
            // `;
            loadMessages('test1@example.com');
        });
        });
        loadMessages('test@gmail.com');

        function toggleSearch() {
            var container = document.querySelector('.search-container');
            container.classList.toggle('active');
            var searchInput = document.getElementById('searchInput');
          
            if (container.classList.contains('active')) {
              searchInput.focus(); // Focus on input when expanded
            } else {
              searchInput.blur(); // Blur the input when collapsed
            }
          }
          
          function closeSearch() {
            var container = document.querySelector('.search-container');
            if (!document.getElementById('searchInput').value) {
              container.classList.remove('active');
            }
          }
          
          
        
        // Function to go back to the friends page
        function goBack() {
          friendsPage.style.display = 'block';
          chatPageBox.style.display = 'none';
        }
        


       
        function notifyNewMessage(message) {
            // Check if the user has notification permissions
            if (Notification.permission === 'granted') {
                const notification = new Notification("新しいメッセージ", {
                    body: message,
                    icon: 'https://yozipic.top/pic/icon.png', // Update this to the correct URL
                    badge: 'https://yozipic.top/pic/badge.png' // Update this to the correct URL
                });

                // Close the notification after a few seconds
                setTimeout(() => {
                    notification.close();
                }, 5000);
            } else {
                console.warn('User has not granted notification permission');
            }
        }

        // Get the audio record button element
        const audioRecordButton = document.getElementById('audio-record-button');

        // Define variables for recording audio
        let isRecording = false;
        let mediaRecorder;
        let audioChunks = [];

        // Start or stop audio recording
        audioRecordButton.addEventListener('click', () => {
            if (isRecording) {
                mediaRecorder.stop();
                isRecording = false;

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    const audioUrl = URL.createObjectURL(audioBlob);

                    // Save audio to the backend
                    saveAudioMessageToDatabase(Memail, audioBlob);
                    audioChunks = []; // Clear the audio chunks array
                };

                audioRecordButton.classList.remove('fa-stop'); 
                audioRecordButton.classList.add('fa-microphone'); 
            } else {
                
                startRecording();
                isRecording = true;
        
                audioRecordButton.classList.remove('fa-microphone');
                audioRecordButton.classList.add('fa-stop'); 
            }
        });

        // Start recording the audio
        function startRecording() {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    mediaRecorder = new MediaRecorder(stream);
                    audioChunks = []; // Initialize or clear the audio chunks array

                    mediaRecorder.ondataavailable = event => {
                        audioChunks.push(event.data);
                    };
                    
                    mediaRecorder.start();
                })
                .catch(error => {
                    console.error('Error accessing microphone:', error);
                });
        }


        // Modify `saveMessageToDatabase` function to send audio to the server
        function saveAudioMessageToDatabase(email, audioBlob) {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'audio-message.wav'); // Append the audio file
            formData.append('type', 'audio'); 

             // Construct query parameters for email and type
             const queryParam = `?email=${encodeURIComponent(email)}`;

            fetch(`https://chatapp-bsrk.onrender.com/send-audio-message${queryParam}`, {
                method: 'POST',
                body: formData
            })
            .then(response =>  {
                if (!response.ok) {
                    throw new Error('Failed to upload audio file');
                }
                return response.json();
            })
            .then(data => {
                const audioUrl = data.filePath;

                // Send the audio URL as a message, with its type set as 'audio'
                return fetch(`https://chatapp-bsrk.onrender.com/send-message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    messageContent: audioUrl, // Send the audio URL
                    type: 'audio' // Specify the type as audio
                })
                }).then(response => response.json()
                ).then(data => {
                    console.log('Audio message saved', data);
                    if(email==='test@gmail.com'){
                            const sender = 'self';
                            appendMessage(audioUrl, sender, data.timestamp, type='audio') 
                        } else {
                            const sender = 'user';
                            appendMessage(audioUrl, sender, data.timestamp, type='audio') 
                        }
                    
                }).catch(error => {
                console.error('Error saving audio message:', error);
                });
            }).catch(error => {
                console.error('Error uploading audio file:', error);
            });
        }

         // Get references to the containers
const initialContainer = document.querySelector('#chatpagebox');
const videoCallContainer = document.querySelector('#videoCallContainer');

// Get references to the buttons
const startCallBtn = document.querySelector('#startCallBtn');
const hangupBtn = document.querySelector('#hangup');

// Function to start the call (hide initial container, show video call container)
startCallBtn.addEventListener('click', () => {
    initialContainer.style.display = 'none'; // Hide the initial container
    videoCallContainer.style.display = 'block'; // Show the video call container
});

        

        window.onload = function() {
            const user = localStorage.getItem('user');
            if (!user) {
                // If no user data is found, redirect to the login page
                window.location.href = 'https://yozipic.top/login.html';
            } else {
                // Optionally, parse and use the user data
                const userData = JSON.parse(user);
                // You can update the UI or use the user info as needed
                console.log('Logged in user:', userData);
            }
        };
