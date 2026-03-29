(function () {
  'use strict';

  // ── Config ──────────────────────────────────────────────────────────
  var API_URL =
    'https://crowagent-platform-production.up.railway.app/api/v1/chat/public';
  var AUTO_OPEN_DELAY = 30000; // 30 seconds
  var LS_KEY = 'ca_chatbot_opened';

  var SUGGESTED_QUESTIONS = [
    'What is MEES 2028?',
    'How does CrowMark work?',
    'Is CSRD mandatory for me?',
  ];

  // ── State ───────────────────────────────────────────────────────────
  var messages = [];
  var isOpen = false;
  var userInteracted = false; // true once user manually opens or closes
  var autoOpenTimer = null;
  var lastUserMessage = '';

  // ── Styles ──────────────────────────────────────────────────────────
  function injectStyles() {
    var style = document.createElement('style');
    style.textContent =
      ':root{' +
        '--ca-teal:#0CC9A8;' +
        '--ca-panel-bg:#040E1A;' +
        '--ca-font:var(--font-body,"Inter",Arial,sans-serif);' +
      '}' +

      /* Reset inside widget */
      '#ca-chatbot *{box-sizing:border-box;margin:0;padding:0;font-family:var(--ca-font);}' +

      /* Toggle button */
      '#ca-chatbot-btn{' +
        'position:fixed;bottom:24px;right:24px;z-index:9999;' +
        'width:56px;height:56px;border-radius:50%;border:none;' +
        'background:var(--ca-teal);color:#040E1A;cursor:pointer;' +
        'display:flex;align-items:center;justify-content:center;' +
        'box-shadow:0 4px 16px rgba(0,0,0,.3);transition:transform .2s ease,opacity .2s ease;' +
      '}' +
      '#ca-chatbot-btn:hover{transform:scale(1.08);}' +
      '#ca-chatbot-btn:focus-visible{outline:2px solid #fff;outline-offset:2px;}' +
      '#ca-chatbot-btn svg{width:28px;height:28px;fill:currentColor;}' +

      /* Panel */
      '#ca-chatbot-panel{' +
        'position:fixed;bottom:92px;right:24px;z-index:9999;' +
        'width:380px;max-width:calc(100vw - 32px);height:520px;max-height:calc(100vh - 120px);' +
        'background:var(--ca-panel-bg);border-radius:16px;' +
        'display:flex;flex-direction:column;overflow:hidden;' +
        'box-shadow:0 8px 32px rgba(0,0,0,.45);' +
        'opacity:0;transform:translateY(16px) scale(.96);pointer-events:none;' +
        'transition:opacity .25s ease,transform .25s ease;' +
      '}' +
      '#ca-chatbot-panel.ca-open{' +
        'opacity:1;transform:translateY(0) scale(1);pointer-events:auto;' +
      '}' +

      /* Header */
      '.ca-header{' +
        'display:flex;align-items:center;justify-content:space-between;' +
        'padding:16px 18px;border-bottom:1px solid rgba(255,255,255,.08);' +
      '}' +
      '.ca-header-title{color:#fff;font-size:15px;font-weight:600;}' +
      '.ca-header-close{' +
        'background:none;border:none;color:rgba(255,255,255,.6);cursor:pointer;' +
        'width:28px;height:28px;display:flex;align-items:center;justify-content:center;' +
        'border-radius:6px;transition:background .15s ease,color .15s ease;' +
      '}' +
      '.ca-header-close:hover{background:rgba(255,255,255,.08);color:#fff;}' +
      '.ca-header-close:focus-visible{outline:2px solid var(--ca-teal);outline-offset:-2px;}' +

      /* Messages area */
      '.ca-messages{flex:1;overflow-y:auto;padding:16px 18px;display:flex;flex-direction:column;gap:10px;}' +
      '.ca-messages::-webkit-scrollbar{width:5px;}' +
      '.ca-messages::-webkit-scrollbar-track{background:transparent;}' +
      '.ca-messages::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:4px;}' +

      /* Message bubbles */
      '.ca-msg{' +
        'max-width:85%;padding:10px 14px;border-radius:12px;font-size:14px;line-height:1.5;' +
        'word-wrap:break-word;white-space:pre-wrap;' +
      '}' +
      '.ca-msg-user{align-self:flex-end;background:var(--ca-teal);color:#040E1A;border-bottom-right-radius:4px;}' +
      '.ca-msg-assistant{align-self:flex-start;background:rgba(255,255,255,.08);color:rgba(255,255,255,.9);border-bottom-left-radius:4px;}' +

      /* Loading dots */
      '.ca-msg-loading{align-self:flex-start;background:rgba(255,255,255,.08);color:rgba(255,255,255,.5);border-bottom-left-radius:4px;}' +
      '.ca-msg-loading .ca-dots{display:inline-flex;gap:3px;}' +
      '.ca-msg-loading .ca-dots span{' +
        'width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.5);' +
        'animation:ca-bounce .6s infinite alternate;' +
      '}' +
      '.ca-msg-loading .ca-dots span:nth-child(2){animation-delay:.15s;}' +
      '.ca-msg-loading .ca-dots span:nth-child(3){animation-delay:.3s;}' +
      '@keyframes ca-bounce{0%{opacity:.3;transform:translateY(0)}100%{opacity:1;transform:translateY(-4px)}}' +

      /* Error + retry */
      '.ca-msg-error{align-self:flex-start;background:rgba(255,80,80,.12);color:rgba(255,255,255,.85);border-bottom-left-radius:4px;}' +
      '.ca-retry-btn{' +
        'margin-top:8px;padding:5px 12px;border:1px solid rgba(255,255,255,.2);' +
        'border-radius:8px;background:transparent;color:var(--ca-teal);' +
        'cursor:pointer;font-size:13px;font-weight:500;transition:background .15s ease;' +
      '}' +
      '.ca-retry-btn:hover{background:rgba(12,201,168,.1);}' +
      '.ca-retry-btn:focus-visible{outline:2px solid var(--ca-teal);outline-offset:2px;}' +

      /* Suggested question chips */
      '.ca-chips{display:flex;flex-direction:column;gap:8px;padding:4px 0;}' +
      '.ca-chip{' +
        'background:rgba(12,201,168,.1);border:1px solid rgba(12,201,168,.3);' +
        'color:var(--ca-teal);padding:8px 14px;border-radius:10px;' +
        'font-size:13px;cursor:pointer;text-align:left;' +
        'transition:background .15s ease,border-color .15s ease;' +
      '}' +
      '.ca-chip:hover{background:rgba(12,201,168,.18);border-color:var(--ca-teal);}' +
      '.ca-chip:focus-visible{outline:2px solid var(--ca-teal);outline-offset:2px;}' +

      /* Input area */
      '.ca-input-area{' +
        'display:flex;align-items:center;gap:8px;' +
        'padding:12px 14px;border-top:1px solid rgba(255,255,255,.08);' +
      '}' +
      '.ca-input-area input{' +
        'flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);' +
        'color:#fff;padding:10px 14px;border-radius:10px;font-size:14px;outline:none;' +
        'transition:border-color .15s ease;' +
      '}' +
      '.ca-input-area input::placeholder{color:rgba(255,255,255,.35);}' +
      '.ca-input-area input:focus{border-color:var(--ca-teal);}' +
      '.ca-input-send{' +
        'width:38px;height:38px;border-radius:10px;border:none;' +
        'background:var(--ca-teal);color:#040E1A;cursor:pointer;' +
        'display:flex;align-items:center;justify-content:center;' +
        'transition:opacity .15s ease;flex-shrink:0;' +
      '}' +
      '.ca-input-send:disabled{opacity:.4;cursor:default;}' +
      '.ca-input-send:focus-visible{outline:2px solid #fff;outline-offset:2px;}' +
      '.ca-input-send svg{width:18px;height:18px;fill:currentColor;}' +

      /* Welcome message */
      '.ca-welcome{color:rgba(255,255,255,.7);font-size:14px;line-height:1.6;margin-bottom:6px;}';

    document.head.appendChild(style);
  }

  // ── DOM construction ────────────────────────────────────────────────
  function buildWidget() {
    var container = document.createElement('div');
    container.id = 'ca-chatbot';

    // Toggle button
    var btn = document.createElement('button');
    btn.id = 'ca-chatbot-btn';
    btn.setAttribute('aria-label', 'Open chat');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/>' +
      '</svg>';

    // Panel
    var panel = document.createElement('div');
    panel.id = 'ca-chatbot-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'CrowAgent chat assistant');

    // Header
    var header = document.createElement('div');
    header.className = 'ca-header';

    var title = document.createElement('span');
    title.className = 'ca-header-title';
    title.textContent = 'CrowAgent Assistant';

    var closeBtn = document.createElement('button');
    closeBtn.className = 'ca-header-close';
    closeBtn.setAttribute('aria-label', 'Close chat');
    closeBtn.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
      '</svg>';

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Messages
    var messagesEl = document.createElement('div');
    messagesEl.className = 'ca-messages';
    messagesEl.setAttribute('role', 'log');
    messagesEl.setAttribute('aria-live', 'polite');

    // Input area
    var inputArea = document.createElement('div');
    inputArea.className = 'ca-input-area';

    var input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Ask a question...';
    input.setAttribute('aria-label', 'Type your message');

    var sendBtn = document.createElement('button');
    sendBtn.className = 'ca-input-send';
    sendBtn.setAttribute('aria-label', 'Send message');
    sendBtn.disabled = true;
    sendBtn.innerHTML =
      '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>' +
      '</svg>';

    inputArea.appendChild(input);
    inputArea.appendChild(sendBtn);

    panel.appendChild(header);
    panel.appendChild(messagesEl);
    panel.appendChild(inputArea);

    container.appendChild(btn);
    container.appendChild(panel);
    document.body.appendChild(container);

    return { container: container, btn: btn, panel: panel, closeBtn: closeBtn, messagesEl: messagesEl, input: input, sendBtn: sendBtn };
  }

  // ── Rendering ───────────────────────────────────────────────────────
  function renderMessages(els) {
    var messagesEl = els.messagesEl;
    messagesEl.innerHTML = '';

    // Show welcome + chips when no messages
    if (messages.length === 0) {
      var welcome = document.createElement('div');
      welcome.className = 'ca-welcome';
      welcome.textContent = 'Hi! I\'m the CrowAgent assistant. How can I help you today?';
      messagesEl.appendChild(welcome);

      var chips = document.createElement('div');
      chips.className = 'ca-chips';
      chips.setAttribute('role', 'list');
      chips.setAttribute('aria-label', 'Suggested questions');

      SUGGESTED_QUESTIONS.forEach(function (q) {
        var chip = document.createElement('button');
        chip.className = 'ca-chip';
        chip.setAttribute('role', 'listitem');
        chip.textContent = q;
        chip.addEventListener('click', function () {
          sendMessage(q, els);
        });
        chips.appendChild(chip);
      });

      messagesEl.appendChild(chips);
      return;
    }

    messages.forEach(function (msg) {
      if (msg.type === 'loading') {
        var loadEl = document.createElement('div');
        loadEl.className = 'ca-msg ca-msg-loading';
        loadEl.innerHTML = '<div class="ca-dots"><span></span><span></span><span></span></div>';
        messagesEl.appendChild(loadEl);
      } else if (msg.type === 'error') {
        var errEl = document.createElement('div');
        errEl.className = 'ca-msg ca-msg-error';

        var errText = document.createElement('div');
        errText.textContent = 'Sorry, I\'m having trouble connecting. Try again?';

        var retryBtn = document.createElement('button');
        retryBtn.className = 'ca-retry-btn';
        retryBtn.textContent = 'Try again';
        retryBtn.setAttribute('aria-label', 'Retry sending message');
        retryBtn.addEventListener('click', function () {
          if (lastUserMessage) {
            // Remove error message
            messages = messages.filter(function (m) { return m.type !== 'error'; });
            sendMessage(lastUserMessage, els);
          }
        });

        errEl.appendChild(errText);
        errEl.appendChild(retryBtn);
        messagesEl.appendChild(errEl);
      } else {
        var bubble = document.createElement('div');
        bubble.className = 'ca-msg ca-msg-' + msg.role;
        bubble.textContent = msg.content;
        messagesEl.appendChild(bubble);
      }
    });

    // Scroll to bottom
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // ── Open / Close ────────────────────────────────────────────────────
  function openPanel(els) {
    isOpen = true;
    els.panel.classList.add('ca-open');
    els.btn.setAttribute('aria-expanded', 'true');
    els.input.focus();
  }

  function closePanel(els) {
    isOpen = false;
    els.panel.classList.remove('ca-open');
    els.btn.setAttribute('aria-expanded', 'false');
    els.btn.focus();
  }

  // ── API call ────────────────────────────────────────────────────────
  function sendMessage(text, els) {
    if (!text || !text.trim()) return;

    var trimmed = text.trim();
    lastUserMessage = trimmed;

    messages.push({ role: 'user', content: trimmed });
    messages.push({ type: 'loading' });
    renderMessages(els);

    els.input.value = '';
    els.sendBtn.disabled = true;

    var apiMessages = messages
      .filter(function (m) { return m.role === 'user' || m.role === 'assistant'; })
      .map(function (m) { return { role: m.role, content: m.content }; });

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: apiMessages[apiMessages.length - 1].content,
        context: 'marketing_website',
      }),
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        // Remove loading indicator
        messages = messages.filter(function (m) { return m.type !== 'loading'; });

        var reply =
          (data && data.reply) ||
          (data && data.message) ||
          (data && data.content) ||
          (data && data.response) ||
          (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) ||
          'I received your message but got an unexpected response format.';

        messages.push({ role: 'assistant', content: reply });
        renderMessages(els);
      })
      .catch(function () {
        // Remove loading indicator, add error
        messages = messages.filter(function (m) { return m.type !== 'loading'; });
        messages.push({ type: 'error' });
        renderMessages(els);
      });
  }

  // ── Auto-open logic ─────────────────────────────────────────────────
  function scheduleAutoOpen(els) {
    if (localStorage.getItem(LS_KEY) === 'true') return;

    autoOpenTimer = setTimeout(function () {
      if (!userInteracted && !isOpen) {
        openPanel(els);
        localStorage.setItem(LS_KEY, 'true');
      }
    }, AUTO_OPEN_DELAY);
  }

  // ── Init ────────────────────────────────────────────────────────────
  function init() {
    injectStyles();
    var els = buildWidget();

    renderMessages(els);

    // Toggle button
    els.btn.addEventListener('click', function () {
      userInteracted = true;
      if (autoOpenTimer) {
        clearTimeout(autoOpenTimer);
        autoOpenTimer = null;
      }
      if (isOpen) {
        closePanel(els);
      } else {
        openPanel(els);
        localStorage.setItem(LS_KEY, 'true');
      }
    });

    // Close button
    els.closeBtn.addEventListener('click', function () {
      userInteracted = true;
      if (autoOpenTimer) {
        clearTimeout(autoOpenTimer);
        autoOpenTimer = null;
      }
      closePanel(els);
    });

    // Input handling
    els.input.addEventListener('input', function () {
      els.sendBtn.disabled = !els.input.value.trim();
    });

    els.input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey && els.input.value.trim()) {
        e.preventDefault();
        sendMessage(els.input.value, els);
      }
    });

    els.sendBtn.addEventListener('click', function () {
      if (els.input.value.trim()) {
        sendMessage(els.input.value, els);
      }
    });

    // Keyboard: Escape closes panel
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) {
        userInteracted = true;
        closePanel(els);
      }
    });

    // Auto-open for first visit
    scheduleAutoOpen(els);
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
