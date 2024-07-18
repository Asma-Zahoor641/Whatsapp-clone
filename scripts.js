
document.addEventListener('DOMContentLoaded', () => {
    const contactsContainer = document.getElementById('contacts');
    const chatHeader = document.getElementById('chat-header');
    const chatMessages = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const searchInput = document.getElementById('search-input');
    const settingsButton = document.getElementById('settings-button');
    const settingsMenu = document.getElementById('settings-menu');
    const emojiButton = document.querySelector('.fa-smile');
    const attachmentButton = document.querySelector('.fa-paperclip');
    const microphoneButton = document.querySelector('.fa-microphone');
    const imageButton = document.querySelector('.fa-image');
    const cameraButton = document.querySelector('.fa-camera');
    const contextMenu = document.getElementById('context-menu');

    let currentContactId = null;
    let currentImage = null;
    let currentAudio = null;
    let selectedMessageElement = null;

    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            populateContacts(data.contacts);
            if (data.contacts.length > 0) {
                loadChat(data.contacts[0].id);
            }
        });

    function populateContacts(contacts) {
        contacts.forEach(contact => {
            const contactElement = document.createElement('div');
            contactElement.classList.add('contact');
            contactElement.innerHTML = `
                <img src="${contact.avatar}" alt="Avatar" class="avatar">
                <div class="contact-info">
                    <h3>${contact.name}</h3>
                    <p>Last seen at ${contact.lastSeen}</p>
                </div>
            `;
            contactElement.addEventListener('click', () => loadChat(contact.id));
            contactsContainer.appendChild(contactElement);
        });
    }

    function loadChat(contactId) {
        currentContactId = contactId;
        fetch('data.json')
            .then(response => response.json())
            .then(data => {
                const contact = data.contacts.find(c => c.id === contactId);
                chatHeader.innerHTML = `
                    <img src="${contact.avatar}" alt="Avatar" class="avatar">
                    <div class="contact-info">
                        <h3>${contact.name}</h3>
                        <p>Last seen at ${contact.lastSeen}</p>
                    </div>
                `;
                const messages = data.messages.filter(m => m.contactId === contactId || m.contactId === currentContactId);
                chatMessages.innerHTML = '';
                messages.forEach(message => {
                    const isSent = message.contactId !== contactId;
                    appendMessage(message.text, false, false, isSent, message.timestamp);
                });
                chatMessages.scrollTop = chatMessages.scrollHeight;
            });
    }

    function sendMessage() {
        const message = messageInput.value.trim();
        const timestamp = new Date().toLocaleTimeString();
        if (message) {
            appendMessage(message, false, false, true, timestamp);
            messageInput.value = '';
        }
        if (currentImage) {
            appendMessage(currentImage, true, false, true, timestamp);
            currentImage = null;
        }
        if (currentAudio) {
            appendMessage(currentAudio, false, true, true, timestamp);
            currentAudio = null;
        }
    }

    function appendMessage(content, isImage = false, isAudio = false, isSent = false, timestamp = '') {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        if (isSent) {
            messageElement.classList.add('sent');
        } else {
            messageElement.classList.add('received');
        }

        let innerContent;
        if (isImage) {
            innerContent = `<img src="${content}" alt="Image" class="message-image">`;
        } else if (isAudio) {
            innerContent = `<audio controls><source src="${content}" type="audio/webm"></audio>`;
        } else {
            innerContent = content;
        }

        messageElement.innerHTML = `
            <div class="message-content">${innerContent}</div>
            <div class="message-timestamp">${timestamp}</div>
        `;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Add event listener for context menu
        messageElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            selectedMessageElement = messageElement;
            contextMenu.style.top = `${e.clientY}px`;
            contextMenu.style.left = `${e.clientX}px`;
            contextMenu.classList.add('visible');
        });
    }

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    searchInput.addEventListener('input', () => {
        const value = searchInput.value.toLowerCase();
        const contacts = contactsContainer.children;
        for (let i = 0; i < contacts.length; i++) {
            const contact = contacts[i];
            const name = contact.querySelector('h3').textContent.toLowerCase();
            if (name.includes(value)) {
                contact.style.display = 'flex';
            } else {
                contact.style.display = 'none';
            }
        }
    });

    settingsButton.addEventListener('click', () => {
        settingsMenu.classList.toggle('settings-menu--visible');
    });

    settingsMenu.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            const action = e.target.textContent.toLowerCase();
            switch (action) {
                case 'theme':
                    document.body.classList.toggle('dark-theme');
                    break;
                case 'privacy and security':
                    console.log('Privacy and security');
                    break;
                case 'language':
                    console.log('Language');
                    break;
                case 'help':
                    console.log('Help');
                    break;
              
                case 'delete account':
                    console.log('Delete account');
                    break;
                
                case 'settings':
                    console.log('Settings');
                    break;

                default:
                    break;


            }
            settingsMenu.classList.remove('settings-menu--visible');
        }
    });

    emojiButton.addEventListener('click', () => {
        const emojiPicker = document.createElement('div');
        emojiPicker.classList.add('emoji-picker');
        const emojis = ['😀', '😂', '😍', '😢', '😎', '😡', '👍', '👎'];
        emojis.forEach(emoji => {
            const emojiElement = document.createElement('span');
            emojiElement.textContent = emoji;
            emojiElement.addEventListener('click', () => {
                messageInput.value += emoji;
                emojiPicker.remove();
            });
            emojiPicker.appendChild(emojiElement);
        });
        document.body.appendChild(emojiPicker);
        emojiPicker.style.position = 'absolute';
        emojiPicker.style.bottom = '100px';
        emojiPicker.style.left = '420px';
        emojiPicker.style.backgroundColor = '#fff';
        emojiPicker.style.padding = '10px';
        emojiPicker.style.border = '1px solid #ccc';
        emojiPicker.style.borderRadius = '5px';
        emojiPicker.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    });

    attachmentButton.addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.addEventListener('change', () => {
            const file = fileInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    currentImage = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
        fileInput.click();
    });

    microphoneButton.addEventListener('click', () => {
        const constraints = { audio: true };
        navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();
            const audioChunks = [];
            mediaRecorder.addEventListener('dataavailable', (event) => {
                audioChunks.push(event.data);
            });
            mediaRecorder.addEventListener('stop', () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                currentAudio = audioUrl;
            });
            setTimeout(() => {
                mediaRecorder.stop();
            }, 5000); // Record for 5 seconds
        });
    });

    imageButton.addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.addEventListener('change', () => {
            const file = fileInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    currentImage = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
        fileInput.click();
    });

    cameraButton.addEventListener('click', () => {
        const video = document.createElement('video');
        const startButton = document.createElement('button');
        startButton.textContent = 'Capture';
        const stopButton = document.createElement('button');
        stopButton.textContent = 'Stop';
        document.body.append(video, startButton, stopButton);
        const constraints = { video: true };
        navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
            video.srcObject = stream;
            video.play();
            startButton.addEventListener('click', () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const context = canvas.getContext('2d');
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageUrl = canvas.toDataURL();
                currentImage = imageUrl;
                stream.getTracks().forEach(track => track.stop());
                video.remove();
                startButton.remove();
                stopButton.remove();
            });
            stopButton.addEventListener('click', () => {
                stream.getTracks().forEach(track => track.stop());
                video.remove();
                startButton.remove();
                stopButton.remove();
            });
        });
    });

    // Handle context menu actions
    document.getElementById('delete-message').addEventListener('click', () => {
        if (selectedMessageElement) {
            selectedMessageElement.remove();
            contextMenu.classList.remove('visible');
        }
    });

    document.getElementById('update-message').addEventListener('click', () => {
        if (selectedMessageElement) {
            const newText = prompt('Update message:', selectedMessageElement.querySelector('.message-content').textContent);
            if (newText) {
                selectedMessageElement.querySelector('.message-content').textContent = newText;
            }
            contextMenu.classList.remove('visible');
        }
    });

    document.getElementById('forward-message').addEventListener('click', () => {
        if (selectedMessageElement) {
            const messageContent = selectedMessageElement.querySelector('.message-content').innerHTML;
            messageInput.value = messageContent;
            contextMenu.classList.remove('visible');
        }
    });

    // Hide context menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!contextMenu.contains(e.target)) {
            contextMenu.classList.remove('visible');
        }
    });
});



function appendMessage(content, isImage, isAudio, isSent, timestamp) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', isSent ? 'sent' : 'received');
    messageElement.innerHTML = `
        <div class="message-content">${content}</div>
        <div class="message-timestamp">${timestamp}</div>
    `;
    messageElement.addEventListener('contextmenu', handleContextMenu);
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function handleContextMenu(e) {
    e.preventDefault();
    selectedMessageElement = messageElement;
    showContextMenu(e.pageX, e.pageY);
}

    backButton.addEventListener('click', () => {
        sidebar.style.display = 'flex';
        chat.style.display = 'FLEX';
    });

    function showContextMenu(x, y) {
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        contextMenu.classList.add('visible');
    }

    document.addEventListener('click', () => {
        contextMenu.classList.remove('visible');
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            sidebar.style.display = 'flex';
            chat.style.display = 'flex';
        } else {
            sidebar.style.display = 'flex';
            chat.style.display = 'FLEX';
        }
    });

    

