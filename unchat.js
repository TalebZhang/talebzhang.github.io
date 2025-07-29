const socket = io('https://dn.zhe.nz'); // Establish a connection with the server
const chatBox = document.getElementById("chat-box"); // Get the chat container element
const input = document.getElementById("message-input"); // Get the message input element
const sendButton = document.getElementById("send-button"); // Get the send button element
const systemMessagePopup = document.getElementById("systemMessagePopup"); // Get the system message popup element
const renderedMessages = new Set(); // To keep track of already rendered messages
const room = window.location.pathname.split("/").pop().replace(".html", ""); // Get the room name from the URL

firebase.initializeApp({
  apiKey: "AIzaSyAwOki0XUie9WKZDLYuV98kwXRkWJS4HU8",
  authDomain: "unchat-82fee.firebaseapp.com",
  projectId: "unchat-82fee",
  storageBucket: "unchat-82fee.firebasestorage.app",
  messagingSenderId: "299427116361",
  appId: "1:299427116361:web:0139208f404a30b74c9698"
});


const messaging = firebase.messaging();

// Service Worker 注册
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then(registration => {
      console.log('Service Worker 注册成功:', registration.scope);

      // 获取 FCM token
      if (Notification.permission === 'granted') {
        messaging.getToken({ vapidKey: 'BHG5X8atDcbCXaTv81tTwX3hej4dkZEgLHe5GLRvruRWEBsc69ixxXNlrLANn9lZdmrcOgaKzEFUnAKsvXdwLBk' })
          .then(currentToken => {
            if (currentToken) {
              console.log('FCM token:', currentToken);
              sendTokenToServer(currentToken, room); // 将 token 发给后台
            } else {
              console.warn('获取 FCM token 为空');
            }
          })
          .catch(err => {
            console.error('获取 FCM token 失败:', err);
          });
      } else if (Notification.permission !== 'denied') {
        // 请求通知权限
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            messaging.getToken({ vapidKey: 'BHG5X8atDcbCXaTv81tTwX3hej4dkZEgLHe5GLRvruRWEBsc69ixxXNlrLANn9lZdmrcOgaKzEFUnAKsvXdwLBk' })
              .then(currentToken => {
                if (currentToken) {
                  console.log('FCM token:', currentToken);
                  sendTokenToServer(currentToken, room);
                } else {
                  console.warn('获取 FCM token 为空');
                }
              })
              .catch(err => {
                console.error('获取 FCM token 失败:', err);
              });
          }
        });
      }
    })
    .catch(err => {
      console.error('Service Worker 注册失败:', err);
    });
} else {
  console.warn('浏览器不支持 Service Worker');
}




messaging.onMessage(payload => {
  console.log('Message received:', payload);
   const { title, body } = payload.notification || {};
  if (title && body) {
    new Notification(title, {
      body,
    });
  }
});


async function sendTokenToServer(token, room) {
  console.log("💡 正在尝试发送 FCM token 到服务器...");
  console.log("📦 token =", token);
  console.log("📦 room =", room);

  try {
    await fetch("https://dn.zhe.nz/api/save-fcm-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token, room })
    });

    console.log("🌐 fetch 请求已发送，等待服务器响应...");
    
    if (!response.ok) {
      const text = await response.text();
      console.error("❌ 服务器返回非 200 状态码:", response.status);
      console.error("❌ 响应内容:", text);
    } else {
      console.log("✅ Token 成功发送至服务器");
    }
  } catch (error) {
    console.error("Failed to send FCM token to server:", error);
  }
}

// Retrieve pending and sent message timestamps from local storage
let pendingTimestamps = JSON.parse(localStorage.getItem('pendingTimestamps') || '[]');
let sentMessageTimestamps = JSON.parse(localStorage.getItem('sentMessageTimestamps') || '[]');

// Function to update localStorage with the current message states
function updateStorage() {
  localStorage.setItem('pendingTimestamps', JSON.stringify(pendingTimestamps)); // Store pending timestamps
  localStorage.setItem('sentMessageTimestamps', JSON.stringify(sentMessageTimestamps)); // Store sent message timestamps
}

// When the socket connection is established, join the specific room
socket.on("connect", () => {
  socket.emit('join room', room); // Emit the join room event with the current room
  loadChatHistory(room); // Load the chat history for this room
});

// Show system messages in a popup
socket.on("system message", (msg) => {
  systemMessagePopup.innerText = msg; // Display the system message
  systemMessagePopup.style.display = "block"; // Show the popup
  setTimeout(() => systemMessagePopup.style.display = "none", 3000); // Hide the popup after 3 seconds
});

// Event listeners for sending messages
sendButton.addEventListener("click", sendTextMessage); // Send message on button click
input.addEventListener("keydown", e => e.key === "Enter" && sendTextMessage()); // Send message on Enter key press

// Function to send a text message
function sendTextMessage() {
  const text = input.value.trim(); // Get the trimmed message text
  if (!text) return; // If the message is empty, do nothing
  const now = Date.now(); // Get the current timestamp
  pendingTimestamps.push(now); // Add the timestamp to the pending timestamps
  updateStorage(); // Update the localStorage with new timestamps

  socket.emit('chat message', { room, text, clientTimestamp: now }); // Send the message to the server with the room, text, and timestamp
  input.value = ""; // Clear the input field after sending the message
}

// Listener to receive new messages
socket.on('chat message', (msg) => {
  const index = pendingTimestamps.findIndex(t => Math.abs(t - msg.clientTimestamp) < 100); // Find the corresponding pending message
  let sender;
  
  // Determine the sender based on the message role or its timestamp
  if (msg.role === "assistant") sender = "gpt"; // If the message is from the assistant
  else if (index !== -1) { // If the message is from the self (sent by the user)
    sender = "self";
    pendingTimestamps.splice(index, 1); // Remove the message from pending timestamps
    if (!sentMessageTimestamps.includes(msg.timestamp)) sentMessageTimestamps.push(msg.timestamp); // Add the timestamp to sent messages
    updateStorage(); // Update localStorage
  } else sender = "user"; // Otherwise, it’s from the user

  appendMessage(msg.text, sender, msg.timestamp, msg.id); // Append the message to the chat box
});

// Convert a timestamp to milliseconds, handling both string and number formats
const toMillisTimestamp = time => typeof time === 'number' ? time : (typeof time === 'string' ? new Date(time).getTime() : 0);

// Function to load the chat history from the server
async function loadChatHistory(room) {
  try {
    const res = await fetch(`https://dn.zhe.nz/api/chat-history/${room}`); // Fetch the chat history for the room
    if (!res.ok) throw new Error('Failed to get chat history'); // Handle error if the fetch fails
    const messages = await res.json(); // Parse the response as JSON
    sentMessageTimestamps = JSON.parse(localStorage.getItem('sentMessageTimestamps') || '[]'); // Load sent message timestamps

    messages.forEach(msg => {
      let sender = msg.role === "assistant" ? "gpt" : // Determine if the message is from the assistant
        sentMessageTimestamps.some(t => Math.abs(toMillisTimestamp(t) - toMillisTimestamp(msg.timestamp)) < 100) ? "self" : "user"; // Otherwise, it’s from the user or self
      appendMessage(msg.text, sender, msg.timestamp, msg.id); // Append the message to the chat box
    });
  } catch (e) {
    console.error(e); // Log any error that occurs
  }
}

// Function to append a new message to the chat box
function appendMessage(text, sender, timeStr, id) {
  id = id || `${text}|${timeStr}`; // Generate a unique id for the message
  if (renderedMessages.has(id)) return; // Avoid rendering the same message again
  renderedMessages.add(id); // Add the message id to the rendered messages set

  const msg = document.createElement("div"); // Create a new div for the message
  msg.className = `chat-message ${sender}`; // Assign class based on sender type

  const time = document.createElement("div"); // Create a div for the timestamp
  time.className = "timestamp"; // Assign timestamp class
  time.innerText = timeStr ? new Date(timeStr).toLocaleString() : new Date().toLocaleString(); // Format the timestamp

  const bubble = document.createElement("p"); // Create a paragraph for the message text
  bubble.innerText = text; // Set the message text

  msg.appendChild(time); // Append the timestamp to the message
  msg.appendChild(bubble); // Append the message text to the message
  chatBox.appendChild(msg); // Add the message to the chat box
  chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom of the chat box
}
