// 1. Authentication Guard
const token = localStorage.getItem('accessToken');
const myPhone = localStorage.getItem('phone');
if (!token || !myPhone) {
  alert('请先登录');
  window.location.href = './login.html';
}

const API_BASE = 'http://localhost:3000';
const socket = io(API_BASE, { auth: { token }, withCredentials: true });

// Correctly matched selectors based on your HTML IDs
const chatBox = document.getElementById("chat-messages-box");
const input = document.getElementById("chat-msg-input");
const sendButton = document.getElementById("send-btn");
const systemMessagePopup = document.getElementById("systemMessagePopup");
const renderedMessages = new Set();

let currentRoom = null;
let activeFriendPhone = null;

// 2. Storage Helpers
let pendingTimestamps = JSON.parse(localStorage.getItem('pendingTimestamps') || '[]');
let sentMessageTimestamps = JSON.parse(localStorage.getItem('sentMessageTimestamps') || '[]');

const updateStorage = () => {
  localStorage.setItem('pendingTimestamps', JSON.stringify(pendingTimestamps));
  localStorage.setItem('sentMessageTimestamps', JSON.stringify(sentMessageTimestamps));
};

const toMillisTimestamp = t => typeof t === 'number' ? t : (typeof t === 'string' ? new Date(t).getTime() : 0);

// 3. Initialization & Event Handlers
document.addEventListener('DOMContentLoaded', () => {
  const mePhoneEl = document.getElementById('me-phone');
  const meWxidEl = document.getElementById('me-wxid');
  const logoutBtn = document.getElementById('btn-logout');

  if (mePhoneEl) mePhoneEl.textContent = myPhone;
  if (meWxidEl) meWxidEl.textContent = myPhone;

  renderContactsList();

  if (sendButton) {
    sendButton.addEventListener("click", sendTextMessage);
  }

  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        sendTextMessage();
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.clear();
      window.location.href = './login.html';
    });
  }
  renderChatList();
});

// 4. Socket & Chat Logic
socket.on("system message", (msg) => {
  if (systemMessagePopup) {
    systemMessagePopup.innerText = msg;
    systemMessagePopup.style.display = "block";
    setTimeout(() => systemMessagePopup.style.display = "none", 3000);
  }
});

function sendTextMessage() {
  if (!input) return;
  const text = input.value.trim();
  if (!text || !currentRoom) return;
  const now = Date.now();
  pendingTimestamps.push(now);
  updateStorage();

  socket.emit('chat message', { room: currentRoom, text, clientTimestamp: now });
  input.value = "";
}

socket.on('chat message', (msg) => {
  const index = pendingTimestamps.findIndex(t => Math.abs(t - msg.clientTimestamp) < 100);
  let sender = msg.role === "assistant" ? "gpt" : (index !== -1 ? "self" : "user");
  
  if (index !== -1) {
    pendingTimestamps.splice(index, 1);
    if (!sentMessageTimestamps.includes(msg.timestamp)) sentMessageTimestamps.push(msg.timestamp);
    updateStorage();
  }
  appendMessage(msg.text, sender, msg.timestamp, msg.id);
});

async function loadChatHistory(roomName) {
  try {
    const res = await fetch(`${API_BASE}/api/chat-history?room=` + encodeURIComponent(roomName));
    if (!res.ok) throw new Error('Failed to get chat history');
    const messages = await res.json();
    sentMessageTimestamps = JSON.parse(localStorage.getItem('sentMessageTimestamps') || '[]');

    messages.forEach(msg => {
      let sender = msg.role === "assistant" ? "gpt" :
        sentMessageTimestamps.some(t => Math.abs(toMillisTimestamp(t) - toMillisTimestamp(msg.timestamp)) < 100) ? "self" : "user";
      appendMessage(msg.text, sender, msg.timestamp, msg.id);
    });
  } catch (e) { console.error(e); }
}

function appendMessage(text, sender, timeStr, id) {
  id = id || `${text}|${timeStr}`;
  if (renderedMessages.has(id)) return;
  renderedMessages.add(id);

  const msg = document.createElement("div");
  msg.className = `chat-message ${sender}`;

  // Generate dynamic initials for the avatar
  const avatarText = sender === 'self' ? myPhone.slice(-2) : (activeFriendPhone ? activeFriendPhone.slice(-2) : '友');

  // Create message row structure with avatar
  msg.innerHTML = `
    <div class="timestamp">${timeStr ? new Date(timeStr).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
    <div class="msg-content-wrapper">
      <div class="wx-avatar msg-avatar">${avatarText}</div>
      <div class="msg-bubble"><p>${text}</p></div>
    </div>
  `;

  const chatBoxEl = document.getElementById("chat-messages-box");
  if (chatBoxEl) {
    chatBoxEl.appendChild(msg);
    chatBoxEl.scrollTop = chatBoxEl.scrollHeight;
  }
}

// 5. Navigation & UI Tabs
function switchTab(tabId, titleText, element) {
  document.querySelectorAll('.tab-view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.tabbar-item').forEach(i => i.classList.remove('active'));

  document.getElementById(`tab-${tabId}`).classList.add('active');
  element.classList.add('active');

  const topHeader = document.getElementById('top-header');
  const headerTitle = document.getElementById('header-title');
  if (topHeader) topHeader.style.display = (tabId === 'me') ? 'none' : 'flex';
  if (tabId !== 'me' && headerTitle) headerTitle.textContent = titleText;
}

function renderContactsList() {
  let friends = [];
  try { friends = JSON.parse(localStorage.getItem('friends')) || []; } catch(e) {}
  const container = document.getElementById('contacts-list-container');
  if (!container) return;
  container.innerHTML = '';

  friends.forEach(friend => {
    const row = document.createElement('div');
    row.className = 'contact-row';
    row.innerHTML = `<div class="wx-avatar">${friend.slice(-2)}</div><div class="contact-name">${friend}</div>`;
    row.onclick = () => openChatWindow(friend);
    container.appendChild(row);
  });
}

function openChatWindow(friendPhone) {
  activeFriendPhone = friendPhone;
  const friendNameEl = document.getElementById('chat-friend-name');
  const chatWindowEl = document.getElementById('active-chat-window');
  const chatBoxEl = document.getElementById("chat-messages-box");

  if (friendNameEl) friendNameEl.textContent = friendPhone;
  if (chatWindowEl) chatWindowEl.style.display = 'flex';

  if (chatBoxEl) {
    chatBoxEl.innerHTML = '';
  } else {
    console.error("Target element '#chat-messages-box' was not found in the DOM.");
    return;
  }

  renderedMessages.clear();
  currentRoom = [myPhone, friendPhone].sort().join('_');
  socket.emit('join room', currentRoom);
  loadChatHistory(currentRoom);
  saveRecentChat(friendPhone)
}

function closeChatWindow() {
  if (currentRoom) socket.emit('leave room', currentRoom);
  const chatWindowEl = document.getElementById('active-chat-window');
  if (chatWindowEl) chatWindowEl.style.display = 'none';
  currentRoom = null;
}

function saveRecentChat(friendPhone) {
  let chats = [];
  try { chats = JSON.parse(localStorage.getItem('recentChats')) || []; } catch(e) {}

  // Remove if already exists, then add to the top
  chats = chats.filter(p => p !== friendPhone);
  chats.unshift(friendPhone);
  localStorage.setItem('recentChats', JSON.stringify(chats));
  renderChatList();
}

function renderChatList() {
  let chats = [];
  try { chats = JSON.parse(localStorage.getItem('recentChats')) || []; } catch(e) {}
  const container = document.getElementById('chat-list-container');
  if (!container) return;
  container.innerHTML = '';

  if (chats.length === 0) {
    container.innerHTML = '<div style="text-align:center; color:#999; margin-top:4 গণহত্যার0px;">暂无聊天记录</div>';
    return;
  }

  chats.forEach(friend => {
    const row = document.createElement('div');
    row.className = 'contact-row'; // You can style this as a chat item row
    row.innerHTML = `
      <div class="wx-avatar">${friend.slice(-2)}</div>
      <div class="contact-info" style="margin-left: 12px; flex: 1;">
        <div class="contact-name" style="font-weight: 500;">${friend}</div>
        <div class="last-msg" style="font-size: 13px; color: #888;">点击查看聊天</div>
      </div>
    `;
    row.onclick = () => openChatWindow(friend);
    container.appendChild(row);
  });
}