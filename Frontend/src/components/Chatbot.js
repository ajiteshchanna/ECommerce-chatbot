import { state } from '../services/state.js';

/**
 * Spidey AI Assistant Chatbot — UI-010, UI-011, UI-012, UI-013, UI-014
 *
 * PRESERVED ELEMENT IDs (Home.js event listeners depend on these):
 *   - #chatToggle   → toggle button
 *   - #chatSend     → send button
 *   - #chatInput    → text input
 *
 * PRESERVED CLASS+DATA (Home.js click handlers depend on these):
 *   - .product-recommendation[data-id] → product nav on click
 *
 * PRESERVED message types: user / text / products
 */
export function renderChatbot() {
  const { chatOpen, chatLoading, chatMessages, chatInput } = state;

  // Format current time
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  return `
  <div class="chatbot-container">

    <!-- Spidey Toggle Button (UI-010) -->
    <button id="chatToggle" class="chatbot-toggle" aria-label="${chatOpen ? 'Close Spidey AI' : 'Open Spidey AI'}" aria-expanded="${chatOpen}" title="Chat with Spidey AI">
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <!-- Spider face mask -->
        <circle cx="40" cy="40" r="36" fill="url(#btnSpiderGrad)"/>
        <!-- Web lines on face -->
        <line x1="40" y1="4"  x2="40" y2="76" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
        <line x1="4"  y1="40" x2="76" y2="40" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
        <line x1="15" y1="15" x2="65" y2="65" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
        <line x1="65" y1="15" x2="15" y2="65" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
        <!-- Concentric web arcs -->
        <circle cx="40" cy="40" r="12" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
        <circle cx="40" cy="40" r="22" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
        <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
        <!-- Spider Eyes -->
        <ellipse cx="28" cy="34" rx="11" ry="8" fill="white" transform="rotate(-20 28 34)"/>
        <ellipse cx="52" cy="34" rx="11" ry="8" fill="white" transform="rotate(20 52 34)"/>
        <!-- Eye inner -->
        <ellipse cx="28" cy="34" rx="6" ry="5" fill="rgba(10,10,15,0.7)" transform="rotate(-20 28 34)"/>
        <ellipse cx="52" cy="34" rx="6" ry="5" fill="rgba(10,10,15,0.7)" transform="rotate(20 52 34)"/>
        <defs>
          <radialGradient id="btnSpiderGrad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#FF4444"/>
            <stop offset="100%" stop-color="#7B0000"/>
          </radialGradient>
        </defs>
      </svg>
    </button>

    ${chatOpen ? `
    <!-- Chat Window (UI-011) -->
    <div class="chatbot-window" role="dialog" aria-label="Spidey AI Assistant" aria-modal="true">

      <!-- Chat Header -->
      <div class="chatbot-header">
        <div class="chat-traffic-lights" aria-hidden="true">
          <div class="traffic-light traffic-light-red"   title="Close"></div>
          <div class="traffic-light traffic-light-yellow" title="Minimize"></div>
          <div class="traffic-light traffic-light-green"  title="Maximize"></div>
        </div>

        <!-- Spidey mini icon -->
        <svg class="chat-header-icon" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="40" cy="40" r="36" fill="url(#hdrSpiderGrad)"/>
          <ellipse cx="28" cy="34" rx="11" ry="8" fill="white" transform="rotate(-20 28 34)"/>
          <ellipse cx="52" cy="34" rx="11" ry="8" fill="white" transform="rotate(20 52 34)"/>
          <defs>
            <radialGradient id="hdrSpiderGrad" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stop-color="#FF5555"/>
              <stop offset="100%" stop-color="#7B0000"/>
            </radialGradient>
          </defs>
        </svg>

        <div class="chat-header-info">
          <div class="chat-header-title">SPIDEY AI ASSISTANT 🕷️</div>
          <div class="chat-header-subtitle">Your personal fashion web-slinger</div>
        </div>

        <button class="chat-close-btn" id="chatCloseBtn" onclick="document.getElementById('chatToggle').click()" aria-label="Close chat">✕</button>
      </div>

      <!-- Messages Area (UI-012) -->
      <div class="chatbot-messages" id="chatMessages" role="log" aria-live="polite" aria-label="Chat messages">

        <!-- Welcome message if no messages -->
        ${chatMessages.length === 0 ? `
        <div class="message message-bot">
          <div class="message-avatar message-avatar-bot" aria-hidden="true">
            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
              <circle cx="40" cy="40" r="36" fill="url(#avatarGrad0)"/>
              <ellipse cx="28" cy="34" rx="11" ry="8" fill="white" transform="rotate(-20 28 34)"/>
              <ellipse cx="52" cy="34" rx="11" ry="8" fill="white" transform="rotate(20 52 34)"/>
              <defs>
                <radialGradient id="avatarGrad0" cx="40%" cy="35%" r="65%">
                  <stop offset="0%" stop-color="#FF4444"/><stop offset="100%" stop-color="#7B0000"/>
                </radialGradient>
              </defs>
            </svg>
          </div>
          <div class="message-meta">
            <div class="message-bubble message-bubble-bot">
              Hey there, web-slinger! 🕷️<br/>
              I'm your AI shopping assistant.<br/>
              How can I help you today?
            </div>
            <div class="message-time">${timeStr}</div>
          </div>
        </div>
        ` : ''}

        <!-- Typing Indicator -->
        ${chatLoading ? `
        <div class="message message-bot chatbot-typing" aria-live="polite" aria-label="Spidey is typing">
          <div class="message-avatar message-avatar-bot" aria-hidden="true">
            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
              <circle cx="40" cy="40" r="36" fill="url(#avatarGradLoad)"/>
              <ellipse cx="28" cy="34" rx="11" ry="8" fill="white" transform="rotate(-20 28 34)"/>
              <ellipse cx="52" cy="34" rx="11" ry="8" fill="white" transform="rotate(20 52 34)"/>
              <defs>
                <radialGradient id="avatarGradLoad" cx="40%" cy="35%" r="65%">
                  <stop offset="0%" stop-color="#FF4444"/><stop offset="100%" stop-color="#7B0000"/>
                </radialGradient>
              </defs>
            </svg>
          </div>
          <div class="typing-dots" role="status" aria-label="Loading response">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
        ` : ''}

        <!-- Message History -->
        ${chatMessages.map((msg, i) => {
          if (msg.sender === 'user') {
            return `
            <div class="message message-user" aria-label="You said: ${msg.text}">
              <div class="message-meta" style="align-items: flex-end;">
                <div class="message-bubble message-bubble-user">${msg.text}</div>
                <div class="message-time">${timeStr} ✓✓</div>
              </div>
              <div class="message-avatar message-avatar-user" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
            </div>
            `;
          } else if (msg.type === 'text') {
            return `
            <div class="message message-bot">
              <div class="message-avatar message-avatar-bot" aria-hidden="true">
                <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
                  <circle cx="40" cy="40" r="36" fill="url(#avatarGrad${i})"/>
                  <ellipse cx="28" cy="34" rx="11" ry="8" fill="white" transform="rotate(-20 28 34)"/>
                  <ellipse cx="52" cy="34" rx="11" ry="8" fill="white" transform="rotate(20 52 34)"/>
                  <defs>
                    <radialGradient id="avatarGrad${i}" cx="40%" cy="35%" r="65%">
                      <stop offset="0%" stop-color="#FF4444"/><stop offset="100%" stop-color="#7B0000"/>
                    </radialGradient>
                  </defs>
                </svg>
              </div>
              <div class="message-meta">
                <div class="message-bubble message-bubble-bot">${msg.message}</div>
                <div class="message-time">${timeStr}</div>
              </div>
            </div>
            `;
          } else if (msg.type === 'products') {
            return `
            <div class="message message-bot" style="flex-direction: column; gap: 8px;">
              <div style="display: flex; gap: 12px; align-items: flex-start;">
                <div class="message-avatar message-avatar-bot" aria-hidden="true">
                  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
                    <circle cx="40" cy="40" r="36" fill="url(#avatarGradProd${i})"/>
                    <ellipse cx="28" cy="34" rx="11" ry="8" fill="white" transform="rotate(-20 28 34)"/>
                    <ellipse cx="52" cy="34" rx="11" ry="8" fill="white" transform="rotate(20 52 34)"/>
                    <defs>
                      <radialGradient id="avatarGradProd${i}" cx="40%" cy="35%" r="65%">
                        <stop offset="0%" stop-color="#FF4444"/><stop offset="100%" stop-color="#7B0000"/>
                      </radialGradient>
                    </defs>
                  </svg>
                </div>
                ${msg.message ? `<div class="message-bubble message-bubble-bot">${msg.message} ✨</div>` : ''}
              </div>
              ${msg.data && msg.data.length === 0
                ? `<div class="message-bubble message-bubble-bot" style="margin-left: 44px;">No products found for that search 😢 Try something else!</div>`
                : ''}
              ${msg.data && msg.data.length > 0
                ? `<div class="message-products" style="margin-left: 44px;" role="list" aria-label="Product recommendations">
                    ${msg.data.map(p => `
                    <div class="product-recommendation" data-id="${p.id}" role="listitem" tabindex="0" aria-label="${p.name}, price ₹${p.price}">
                      <img src="${p.image_url}" alt="${p.name}" loading="lazy" />
                      <div class="product-rec-info">
                        <p>${p.name}</p>
                        <p class="price">₹${p.price}</p>
                      </div>
                    </div>
                    `).join('')}
                  </div>`
                : ''}
            </div>
            `;
          }
          return '';
        }).join('')}
      </div>

      <!-- Chat Input Bar (UI-014) -->
      <div class="chatbot-input" role="form" aria-label="Send a message">
        <input
          type="text"
          id="chatInput"
          value="${chatInput}"
          placeholder="Ask Spidey anything..."
          aria-label="Type your message"
          autocomplete="off"
          maxlength="500"
        />
        <button id="chatSend" aria-label="Send message" title="Send">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>

    </div>
    ` : ''}

  </div>

`;
}
