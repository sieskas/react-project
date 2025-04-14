import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FaCommentDots, FaTimes, FaExpandAlt, FaCompressAlt } from "react-icons/fa";

export default function ChatWindow() {
    const { api, user } = useAuth(); // Ajout de l'utilisateur depuis le contexte d'authentification
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [open, setOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const scrollRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);

    // Nom fixe pour le bot
    const botName = "AssistBot";

    // Fonction pour formater la date
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    const fetchMessages = async () => {
        try {
            const res = await api.get("/api/v1/chat/messages");
            setMessages(res.data);
        } catch (err) {
            console.error("Erreur de récupération :", err);
        }
    };

    const sendMessage = async () => {
        if (!input.trim()) return;

        const messageToSend = input;
        const timestamp = new Date().toISOString();
        setInput("");
        setIsLoading(true);

        // 1. Ajoute le message utilisateur immédiatement
        const newUserMessage = {
            sender: "USER",
            content: messageToSend,
            timestamp,
        };

        setMessages((prev) => [...prev, newUserMessage]);

        // 2. Ajoute un message temporaire "bot typing..."
        const typingPlaceholder = {
            sender: "BOT",
            content: "AssistBot est en train d'écrire...",
            timestamp: new Date().toISOString(),
            isTyping: true,
        };

        setMessages((prev) => [...prev, typingPlaceholder]);

        try {
            // Appelle ton API pour envoyer le message
            await api.post("/api/v1/chat/message", { content: messageToSend });

            // Recharge les messages (avec la vraie réponse du bot)
            const res = await api.get("/api/v1/chat/messages");

            setMessages(res.data); // Remplace tous les messages pour rester synchro avec le backend
        } catch (err) {
            console.error("Erreur d'envoi :", err);
            // Si tu veux afficher une erreur à la place du message typing
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.isTyping
                        ? { ...msg, content: "Erreur : le bot n’a pas pu répondre." }
                        : msg
                )
            );
        } finally {
            setIsLoading(false);
        }
    };


    // Fonction pour ouvrir le chat toujours en mode réduit
    const openChat = () => {
        setOpen(true);
        setIsExpanded(false); // S'assure que la fenêtre n'est pas en mode agrandi quand elle s'ouvre
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <>
            {/* Floating button */}
            {!open && (
                <div className="fixed bottom-6 right-6 z-50">
                    <button
                        onClick={openChat}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg focus:outline-none"
                        aria-label="Ouvrir le chat"
                    >
                        <FaCommentDots className="text-xl" />
                    </button>
                </div>
            )}

            {/* Chat window */}
            {open && (
                <div
                    className={`z-50 fixed ${
                        isExpanded
                            ? "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[70vh]"
                            : "bottom-6 right-6 w-[420px] h-[550px]"
                    } bg-white border border-gray-300 rounded-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 animate-fade-in-up`}
                >
                    {/* Header */}
                    <div className="bg-blue-600 text-white flex justify-between items-center px-4 py-2">
                        <span className="font-semibold">Assistant virtuel</span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setIsExpanded(!isExpanded)} title={isExpanded ? "Réduire" : "Agrandir"}>
                                {isExpanded ? <FaCompressAlt /> : <FaExpandAlt />}
                            </button>
                            <button onClick={() => setOpen(false)} title="Fermer">
                                <FaTimes />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 bg-gray-50 overflow-x-hidden">
                        {Array.isArray(messages) &&
                            messages.map((msg, i) => (
                                <div key={i} className={`mb-4 flex ${msg.sender === "USER" ? "justify-end" : "justify-start"}`}>
                                    <div className="flex flex-col max-w-[70%]">
                                        {/* Nom de l'expéditeur */}
                                        <span className={`text-xs ${msg.sender === "USER" ? "text-right mr-1" : "ml-1"} mb-1 text-gray-600`}>
                                            {msg.sender === "USER" ? (user?.name || "Vous") : botName}
                                        </span>

                                        {/* Contenu du message */}
                                        <div
                                            className={`px-3 py-2 rounded-lg text-sm ${
                                                msg.sender === "USER"
                                                    ? "bg-blue-500 text-white rounded-br-none"
                                                    : msg.isTyping
                                                        ? "bg-gray-300 italic text-gray-600 animate-pulse"
                                                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                                            } break-words whitespace-normal overflow-wrap-anywhere`}
                                        >
                                            {msg.content}
                                        </div>


                                        {/* Horodatage */}
                                        <span className={`text-xs ${msg.sender === "USER" ? "text-right mr-1" : "ml-1"} mt-1 text-gray-500`}>
                                            {msg.timestamp ? formatDateTime(msg.timestamp) : formatDateTime(new Date())}
                                        </span>
                                    </div>
                                </div>
                            ))}
                    </div>

                    {/* Input */}
                    <div className="border-t border-gray-200 p-3 flex gap-2 bg-white">
                        <input
                            className="flex-1 px-3 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Votre message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && !isLoading && sendMessage()}
                            disabled={isLoading} // Optionnel mais utile
                        />

                        <button
                            onClick={sendMessage}
                            disabled={isLoading}
                            className={`px-4 py-2 rounded-full transition ${
                                isLoading
                                    ? "bg-gray-300 cursor-not-allowed text-gray-500"
                                    : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                        >
                            {isLoading ? (
                                <svg
                                    className="animate-spin h-5 w-5 text-white mx-auto"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v8H4z"
                                    ></path>
                                </svg>
                            ) : (
                                "Envoyer"
                            )}
                        </button>
                    </div>

                </div>
            )}
        </>
    );
}