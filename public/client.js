(() => {
  const messagesEl = document.getElementById("messages");
  const authorEl = document.getElementById("author");
  const messageEl = document.getElementById("message");
  const sendBtn = document.getElementById("send");
  const feedbackEl = document.getElementById("feedback");
  const statusPill = document.getElementById("status-pill");
  const onlineCounterEl = document.getElementById("online-counter");
  const charCounterEl = document.getElementById("char-counter");

  const socket = io();

  // восстановим имя из localStorage
  const savedName = localStorage.getItem("mkchat:name");
  if (savedName && authorEl instanceof HTMLInputElement) {
    authorEl.value = savedName;
  }

  const setStatus = (text, online) => {
    if (!statusPill) return;
    statusPill.textContent = text;
    statusPill.classList.toggle("status-pill--online", !!online);
    statusPill.classList.toggle("status-pill--offline", !online);
  };

  const setOnlineCount = (count) => {
    if (!onlineCounterEl) return;
    const num = typeof count === "number" ? count : 0;
    const label = num === 1 ? "player" : "players";
    onlineCounterEl.textContent = `${num} ${label} online`;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const createMessageElement = (message) => {
  const article = document.createElement("article");
  article.className = "message";

  const header = document.createElement("header");
  header.className = "message__header";

  // --- Аватар с первой буквой ника ---
  const avatar = document.createElement("div");
  avatar.className = "message__avatar";

  const authorName = (message.author || "Anonymous").trim() || "Anonymous";
  const initial = authorName.charAt(0).toUpperCase();
  avatar.textContent = initial;

  // --- Имя + звёздочка ---
  const authorWrap = document.createElement("div");
  authorWrap.className = "message__author";

  const star = document.createElement("span");
  star.className = "message__badge";
  star.textContent = "★";

  const name = document.createElement("span");
  name.className = "message__name";
  name.textContent = authorName;

  authorWrap.appendChild(star);
  authorWrap.appendChild(name);

  // --- Время ---
  const timeEl = document.createElement("time");
  timeEl.className = "message__time";
  timeEl.textContent = formatTime(message.timestamp);

  // Порядок элементов в шапке сообщения:
  header.appendChild(avatar);
  header.appendChild(authorWrap);
  header.appendChild(timeEl);

  const body = document.createElement("p");
  body.className = "message__text";
  body.textContent = message.text;

  article.appendChild(header);
  article.appendChild(body);

  return article;
};


  const scrollToBottom = () => {
    if (!messagesEl) return;
    messagesEl.scrollTop = messagesEl.scrollHeight;
  };

  const renderMessages = (messages) => {
    if (!messagesEl) return;
    messagesEl.innerHTML = "";
    if (!Array.isArray(messages)) return;

    messages.forEach((m) => {
      messagesEl.appendChild(createMessageElement(m));
    });

    scrollToBottom();
  };

  const appendMessage = (message) => {
    if (!messagesEl || !message) return;
    messagesEl.appendChild(createMessageElement(message));
    scrollToBottom();
  };

  const showFeedback = (text, isError = false) => {
    if (!feedbackEl) return;
    feedbackEl.textContent = text || "";
    feedbackEl.classList.toggle("feedback--error", !!isError);

    if (!text) return;

    const thisMessage = text;
    setTimeout(() => {
      if (feedbackEl.textContent === thisMessage) {
        feedbackEl.textContent = "";
        feedbackEl.classList.remove("feedback--error");
      }
    }, 2000);
  };

  const updateCharCounter = () => {
    if (!(messageEl instanceof HTMLTextAreaElement) || !charCounterEl) return;
    const max = messageEl.maxLength > 0 ? messageEl.maxLength : 500;
    const length = messageEl.value.length;

    charCounterEl.textContent = `${length} / ${max}`;
    charCounterEl.classList.toggle("char-counter--warning", max - length <= 50);
  };

  const sendMessage = () => {
    if (!(messageEl instanceof HTMLTextAreaElement)) return;

    const rawText = messageEl.value;
    const text = rawText.trim();
    if (!text) {
      showFeedback("Введите сообщение", true);
      return;
    }

    let author = "Anonymous";
    if (authorEl instanceof HTMLInputElement) {
      author = authorEl.value.trim() || "Anonymous";
      try {
        localStorage.setItem("mkchat:name", author);
      } catch {
        // ignore
      }
    }

    if (sendBtn) {
      sendBtn.disabled = true;
    }
    showFeedback("Sending...");

    socket.emit("chat:send", { author, text }, (err) => {
      if (sendBtn) {
        sendBtn.disabled = false;
      }

      if (err) {
        showFeedback(err, true);
        return;
      }

      messageEl.value = "";
      messageEl.focus();
      updateCharCounter();
      showFeedback("Sent!");
    });
  };

  const init = () => {
    updateCharCounter();

    if (sendBtn) {
      sendBtn.addEventListener("click", sendMessage);
    }

    if (messageEl instanceof HTMLTextAreaElement) {
      messageEl.addEventListener("input", updateCharCounter);
      messageEl.addEventListener("keydown", (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
          event.preventDefault();
          sendMessage();
        }
      });
    }

    if (authorEl instanceof HTMLInputElement) {
      authorEl.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          if (messageEl) {
            messageEl.focus();
          }
        }
      });
    }
  };

  // Socket.io события
  socket.on("connect", () => setStatus("Online", true));
  socket.on("disconnect", () => setStatus("Offline", false));

  socket.on("chat:init", (messages) => {
    renderMessages(messages);
  });

  socket.on("chat:new", (message) => {
    appendMessage(message);
  });

  socket.on("chat:online", (count) => {
    setOnlineCount(count);
  });

  socket.on("chat:error", (msg) => {
    showFeedback(msg, true);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
