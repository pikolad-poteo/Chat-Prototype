(() => {
    const messagesEl = document.getElementById("messages");
    const authorEl = document.getElementById("author");
    const messageEl = document.getElementById("message");
    const sendBtn = document.getElementById("send");
    const feedbackEl = document.getElementById("feedback");
    const statusPill = document.getElementById("status-pill");

    const socket = io();

    const savedName = localStorage.getItem("mkchat:name");
    if (savedName && authorEl instanceof HTMLInputElement) {
        authorEl.value = savedName;
    }

    const setStatus = (text, online) => {
        if (!statusPill) return;
        statusPill.textContent = text;
        statusPill.classList.toggle("status-pill-online", online);
        statusPill.classList.toggle("status-pill--offline", !online);
    };

    const formatTime = (timestamp) => {
        try {
            return new Intl.DateTimeFormat(undefined, {
                hour: "2-digit",
                minute: "2-digit",
            }).format(new Date(timestamp));
        } catch {
            return "";
        }
    };

    const createMessageElement = (message) => {
        const container = document.createElement("article");
        container.className = "message";

        const meta = document.createElement("div");
        meta.className = "message__meta";

        const author = document.createElement("span");
        author.className = "message__author";
        author.textContent = message.author;

        const time = document.createElement("time");
        time.className = "message__time";
        time.textContent = formatTime(message.timestamp);

        meta.append(author, time);

        const text = document.createElement("p");
        text.className = "message__text";
        text.textContent = message.text;

        container.append(meta, text);
        return container;
    };

    const renderMessages = (messages) => {
        if (!messagesEl) return;
        messagesEl.innerHTML = "";
        messages.forEach((m) => {
            messagesEl.appendChild(createMessageElement(m));
        });
        messagesEl.scrollTop = messagesEl.scrollHeight;
    };

    const appendMessages = (messages) => {
        if (!messagesEl) return;
        const items = Array.isArray(messages) ? messages : [messages];
        items.forEach((m) => {
            messagesEl.appendChild(createMessageElement(m));
        });
        messagesEl.scrollTop = messagesEl.scrollHeight;
    };

    const showFeedback = (text, isError = false) => {
        if (!feedbackEl) return;
        feedbackEl.textContent = text;
        feedbackEl.classList.toggle("feedback--error", isError);
    };

    const loadHistory = async () => {
        try {
            const response = await fetch("/api/messages");
            if (!response.ok) {
                throw new Error("Failed to load history");
            }

            const data = await response.json();
            renderMessages(data.messages || []);
            showFeedback("Loaded history");
        } catch (error) {
            console.error(error);
            showFeedback("Could not load history", true);
        }
    };

    const sendMessage = () => {
        if (!authorEl || !messageEl || !(authorEl instanceof HTMLInputElement) || !(messageEl instanceof HTMLTextAreaElement || messageEl instanceof HTMLInputElement)) {
            return;
        }

        const author = authorEl.value.trim() || "Anonymous";
        const text = messageEl.value.trim();

        if (!text) {
            showFeedback("Type something before sending", true);
            return;
        }

        localStorage.setItem("mkchat:name", author);

        if (sendBtn) sendBtn.disabled = true;
        showFeedback("Sending...");

        socket.emit("chat:send", { author, text }, (err) => {
            if (sendBtn) sendBtn.disabled = false;
            if (err) {
                showFeedback(err, true);
                return;
            }

            messageEl.value = "";
            messageEl.focus();
            showFeedback("Sent!");
        });
    };

    const init = () => {
        loadHistory();

        if (sendBtn) {
            sendBtn.addEventListener("click", sendMessage);
        }

        if (messageEl) {
            messageEl.addEventListener("keydown", (event) => {
                if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                    event.preventDefault();
                    sendMessage();
                }
            });
        }
    };

    socket.on("connect", () => setStatus("Online", true));
    socket.on("disconnect", () => setStatus("Offline", false));

    socket.on("chat:init", (messages) => renderMessages(messages));
    socket.on("chat:new", (messages) => appendMessages(messages));

    socket.on("chat:error", (msg) => showFeedback(msg, true));

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
