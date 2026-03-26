// CrowAgent Marketing Chatbot — Product Q&A only
// Loads on all marketing pages
(function() {
  'use strict';

  var API_URL = 'https://crowagent-platform-production.up.railway.app/api/v1/ai/chat';

  var SYSTEM_CONTEXT = 'You are a helpful product assistant for CrowAgent, a UK sustainability compliance platform. ' +
    'You only answer questions about CrowAgent\'s products, features, and pricing. ' +
    'Do not answer general questions outside this scope.\n\n' +
    'Key facts:\n' +
    '- CrowAgent Core: MEES compliance intelligence for UK commercial landlords. Plans: Starter \u00a3149/mo (5 properties), Pro \u00a3299/mo (25 properties), Portfolio \u00a3599/mo (100 properties).\n' +
    '- CrowMark: PPN 002 social value platform for UK public sector suppliers. Plans: Solo \u00a349/mo, Team \u00a3149/mo, Agency \u00a3399/mo.\n' +
    '- CSRD tool: Free lead generation tool.\n' +
    '- MEES 2028: All UK commercial properties must achieve EPC Band C or above by April 2028.\n' +
    '- Try at: app.crowagent.ai | Marketing: crowagent.ai | Email: hello@crowagent.ai\n\n' +
    'If asked anything outside CrowAgent\'s products, politely redirect: "I can only help with questions about CrowAgent\'s products. For other questions, please email hello@crowagent.ai."';

  function createWidget() {
    var widget = document.createElement('div');
    widget.id = 'ca-chatbot';
    widget.innerHTML =
      '<div id="ca-chat-button" aria-label="Ask about CrowAgent" title="Ask us anything about CrowAgent">' +
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
          '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' +
        '</svg>' +
      '</div>' +
      '<div id="ca-chat-panel" hidden>' +
        '<div id="ca-chat-header">' +
          '<span>Ask CrowAgent</span>' +
          '<button id="ca-chat-close" aria-label="Close chat">\u2715</button>' +
        '</div>' +
        '<div id="ca-chat-messages" role="log" aria-live="polite"></div>' +
        '<div id="ca-chat-input-area">' +
          '<input id="ca-chat-input" type="text" placeholder="Ask about our products..." aria-label="Chat message" maxlength="500" />' +
          '<button id="ca-chat-send" aria-label="Send message">\u2192</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(widget);
  }

  function createStyles() {
    var style = document.createElement('style');
    style.textContent =
      '#ca-chatbot { position: fixed; bottom: 24px; right: 24px; z-index: 9999; font-family: "DM Sans", Arial, sans-serif; }' +
      '#ca-chat-button { width: 52px; height: 52px; border-radius: 50%; background: #0CC9A8; color: #0A1628; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(12,201,168,0.4); transition: transform 0.2s, opacity 0.2s; }' +
      '#ca-chat-button:hover { transform: scale(1.05); opacity: 0.95; }' +
      '#ca-chat-panel { position: absolute; bottom: 64px; right: 0; width: 320px; height: 420px; background: #0A1628; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; display: flex; flex-direction: column; box-shadow: 0 8px 32px rgba(0,0,0,0.4); overflow: hidden; }' +
      '#ca-chat-panel[hidden] { display: none !important; }' +
      '#ca-chat-header { padding: 14px 16px; background: #0d1f35; display: flex; justify-content: space-between; align-items: center; color: #E8ECF0; font-weight: 600; font-size: 14px; border-bottom: 1px solid rgba(255,255,255,0.08); }' +
      '#ca-chat-close { background: none; border: none; color: #8A9BB0; cursor: pointer; font-size: 16px; padding: 2px 6px; }' +
      '#ca-chat-close:hover { color: #E8ECF0; }' +
      '#ca-chat-messages { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 8px; }' +
      '.ca-msg { padding: 10px 12px; border-radius: 10px; font-size: 13px; line-height: 1.5; max-width: 90%; word-wrap: break-word; }' +
      '.ca-msg-user { background: #0CC9A8; color: #0A1628; align-self: flex-end; border-bottom-right-radius: 3px; }' +
      '.ca-msg-bot { background: #1a2d4a; color: #E8ECF0; align-self: flex-start; border-bottom-left-radius: 3px; }' +
      '.ca-msg-loading { opacity: 0.6; }' +
      '#ca-chat-input-area { padding: 10px 12px; display: flex; gap: 8px; align-items: center; border-top: 1px solid rgba(255,255,255,0.08); }' +
      '#ca-chat-input { flex: 1; background: #1a2d4a; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 8px 12px; color: #E8ECF0; font-size: 13px; outline: none; }' +
      '#ca-chat-input:focus { border-color: #0CC9A8; }' +
      '#ca-chat-send { background: #0CC9A8; color: #0A1628; border: none; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; flex-shrink: 0; transition: opacity 0.2s; }' +
      '#ca-chat-send:hover { opacity: 0.9; }' +
      '#ca-chat-send:disabled { opacity: 0.4; cursor: not-allowed; }' +
      '@media (max-width: 400px) { #ca-chat-panel { width: calc(100vw - 32px); right: -8px; } }';
    document.head.appendChild(style);
  }

  var messages = [];
  var isLoading = false;

  function addMessage(role, content) {
    messages.push({ role: role, content: content });
    var messagesEl = document.getElementById('ca-chat-messages');
    var msgEl = document.createElement('div');
    msgEl.className = 'ca-msg ' + (role === 'user' ? 'ca-msg-user' : 'ca-msg-bot');
    msgEl.textContent = content;
    messagesEl.appendChild(msgEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return msgEl;
  }

  function sendMessage() {
    var input = document.getElementById('ca-chat-input');
    var sendBtn = document.getElementById('ca-chat-send');
    var text = input.value.trim();
    if (!text || isLoading) return;

    input.value = '';
    isLoading = true;
    sendBtn.disabled = true;

    addMessage('user', text);

    var loadingEl = addMessage('bot', '...');
    loadingEl.classList.add('ca-msg-loading');

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: text }],
        context: 'marketing_website'
      })
    })
    .then(function(response) {
      if (!response.ok) throw new Error('Service unavailable');
      return response.json();
    })
    .then(function(data) {
      loadingEl.textContent = data.response || data.message || "I couldn't generate a response. Please email hello@crowagent.ai";
      loadingEl.classList.remove('ca-msg-loading');
    })
    .catch(function() {
      loadingEl.textContent = "Sorry, I'm having trouble right now. Please email hello@crowagent.ai for help.";
      loadingEl.classList.remove('ca-msg-loading');
    })
    .finally(function() {
      isLoading = false;
      sendBtn.disabled = false;
      input.focus();
    });
  }

  function init() {
    createStyles();
    createWidget();

    var button = document.getElementById('ca-chat-button');
    var panel = document.getElementById('ca-chat-panel');
    var closeBtn = document.getElementById('ca-chat-close');
    var sendBtn = document.getElementById('ca-chat-send');
    var input = document.getElementById('ca-chat-input');

    button.addEventListener('click', function() {
      var isHidden = panel.hasAttribute('hidden');
      if (isHidden) {
        panel.removeAttribute('hidden');
        if (messages.length === 0) {
          addMessage('bot', "Hi! I can answer questions about CrowAgent's products and pricing. What would you like to know?");
        }
        input.focus();
      } else {
        panel.setAttribute('hidden', '');
      }
    });

    closeBtn.addEventListener('click', function() {
      panel.setAttribute('hidden', '');
    });

    sendBtn.addEventListener('click', sendMessage);

    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
