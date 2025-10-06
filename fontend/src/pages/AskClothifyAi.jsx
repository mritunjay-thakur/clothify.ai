import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import {
  Send,
  Menu,
  X,
  Plus,
  User,
  Settings,
  HelpCircle,
  Mail,
  LogOut,
  MessageCircle,
  Trash2,
  Sparkles,
  ChevronDown,
  Clock,
  Copy,
  Edit,
} from "lucide-react";
import { clsx } from "clsx";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { useChat } from "../hooks/useChat";
import { useClothifyAI } from "../hooks/useClothifyAI";
import {
  getConversationById,
  createConversation,
  addMessageToConversation,
  deleteConversation,
} from "../lib/api";
import { debounce } from "lodash";

const formatMessageContent = (content) => {
  if (typeof content !== "string") return content;

  return content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/__(.*?)__/g, "<u>$1</u>")
    .replace(/~~(.*?)~~/g, "<del>$1</del>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
};

const ClothifyAI = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => window.innerWidth > 1024
  );
  const [messages, setMessages] = useState(() => {
    if (id) {
      const cached = localStorage.getItem(`conversation_${id}`);
      return cached ? JSON.parse(cached) : [];
    }
    return [];
  });
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(
    id || null
  );
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isTemporaryChat, setIsTemporaryChat] = useState(false);
  const [hoveredMessageIndex, setHoveredMessageIndex] = useState(null);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigationLock = useRef(false);
  const prevIdRef = useRef(id);

  const { authUser, logout } = useAuth();
  const { conversations, fetchConversations } = useChat();
  const { getSuggestion } = useClothifyAI();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
      setIsSidebarOpen(window.innerWidth > 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCopyMessage = useCallback((text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Copied to clipboard!"))
      .catch(() => toast.error("Failed to copy"));
  }, []);

  const handleEditMessage = useCallback((text) => {
    setInputValue(text);
    inputRef.current.focus();
    toast.success("Message ready to edit");
  }, []);

  const loadConversation = useCallback(
    async (conversationId) => {
      if (!conversationId || conversationId === currentConversationId) return;

      setIsSending(true);
      try {
        const conversation = await getConversationById(conversationId);
        setMessages(conversation.messages || []);
        setCurrentConversationId(conversationId);
        localStorage.setItem(
          `conversation_${conversationId}`,
          JSON.stringify(conversation.messages || [])
        );
        localStorage.setItem("currentConversationId", conversationId);
      } catch (err) {
        toast.error(err.message || "Failed to load conversation.");
        setMessages([]);
        setCurrentConversationId(null);
      } finally {
        setIsSending(false);
      }
    },
    [currentConversationId]
  );

  const handleConversationSelect = useCallback(
    async (conversationId) => {
      await loadConversation(conversationId);
      if (window.innerWidth <= 1024) setIsSidebarOpen(false);
    },
    [loadConversation]
  );

  const startNewChat = useCallback(() => {
    setIsTemporaryChat(false);
    setMessages([]);
    setCurrentConversationId(null);
    localStorage.removeItem("currentConversationId");
    navigationLock.current = true;
    navigate("/clothify", { replace: true });
    if (window.innerWidth <= 1024) setIsSidebarOpen(false);
  }, [navigate]);

  const startTemporaryChat = useCallback(() => {
    setIsTemporaryChat(true);
    setMessages([]);
    setCurrentConversationId(null);
    localStorage.removeItem("currentConversationId");
    navigationLock.current = true;
    navigate("/clothify", { replace: true });
    if (window.innerWidth <= 1024) setIsSidebarOpen(false);
  }, [navigate]);

  const handleSend = useCallback(
    async (e) => {
      e.preventDefault();
      if (!inputValue.trim() || isSending) return;

      setIsSending(true);
      const userMessageContent = inputValue.trim();
      setInputValue("");

      try {
        const userMessage = {
          content: userMessageContent,
          role: "user",
          timestamp: new Date().toISOString(),
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        scrollToBottom();

        let conversationId = currentConversationId;
        let aiResponse;

        if (isTemporaryChat) {
          aiResponse = await getSuggestion(newMessages);
        } else {
          if (!conversationId) {
            const newConversation = await createConversation({
              content: userMessageContent,
              role: "user",
            });
            conversationId = newConversation._id;
            setCurrentConversationId(conversationId);
            localStorage.setItem("currentConversationId", conversationId);
          }

          await addMessageToConversation(conversationId, {
            content: userMessageContent,
            role: "user",
          });

          aiResponse = await getSuggestion(newMessages);
          await addMessageToConversation(conversationId, {
            content: aiResponse.suggestion,
            role: "assistant",
            timestamp: new Date().toISOString(),
          });
        }

        const aiMessage = {
          content: aiResponse.suggestion,
          role: "assistant",
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, aiMessage]);
      } catch (err) {
        console.error("Error in handleSend:", err);
        setInputValue(userMessageContent);
        toast.error(err.message || "Failed to send message.");
      } finally {
        setIsSending(false);
        scrollToBottom();
      }
    },
    [
      inputValue,
      messages,
      currentConversationId,
      isTemporaryChat,
      getSuggestion,
      scrollToBottom,
    ]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend(e);
      }
    },
    [handleSend]
  );

  const toggleSidebar = useCallback(
    debounce(() => {
      setIsSidebarOpen((prev) => !prev);
      if (window.innerWidth <= 1024) {
        setShowUserMenu(false);
      }
    }, 200),
    []
  );

  const handleNavigation = useCallback(() => {
    navigate("/edit-profile");
    if (window.innerWidth <= 1024) setIsSidebarOpen(false);
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      localStorage.removeItem("currentConversationId");
      Object.keys(localStorage)
        .filter((key) => key.startsWith("conversation_"))
        .forEach((key) => localStorage.removeItem(key));
      navigate("/login");
      setShowLogoutConfirm(false);
    } catch (err) {
      toast.error("Logout failed. Please try again.");
    }
  }, [logout, navigate]);

  const handleDeleteConversation = useCallback(
    async (conversationId) => {
      try {
        await deleteConversation(conversationId);
        fetchConversations();
        if (currentConversationId === conversationId) {
          startNewChat();
        }
      } catch (err) {
        toast.error(err.message || "Failed to delete conversation.");
      }
    },
    [currentConversationId, fetchConversations, startNewChat]
  );

  const formatTime = useCallback((timestamp) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp));
  }, []);

  useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 96)}px`;
    }
  }, [inputValue]);

  useEffect(() => {
    if (prevIdRef.current !== id) {
      if (id) {
        loadConversation(id);
      } else if (!isTemporaryChat) {
        setMessages([]);
        setCurrentConversationId(null);
      }
      prevIdRef.current = id;
    }
  }, [id, isTemporaryChat, loadConversation]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    scrollToBottom();
    if (currentConversationId) {
      try {
        const data = JSON.stringify(messages);
        if (data.length > 4 * 1024 * 1024) {
          toast.error("Conversation too large to cache locally.");
          return;
        }
        localStorage.setItem(`conversation_${currentConversationId}`, data);
      } catch (err) {
        toast.error("Failed to cache conversation.");
      }
    }
  }, [messages, currentConversationId, scrollToBottom]);

  const groupedConversations = useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    return conversations.reduce((groups, conv) => {
      const date = new Date(conv.updatedAt);
      let group;

      if (date.toDateString() === today.toDateString()) {
        group = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        group = "Yesterday";
      } else if (date > sevenDaysAgo) {
        group = "Previous 7 days";
      } else {
        group = "Older";
      }

      if (!groups[group]) groups[group] = [];
      groups[group].push(conv);
      return groups;
    }, {});
  }, [conversations]);

  return (
    <div className="flex h-screen font-['Inter'] overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.4), rgba(0,0,0,0.0)), url('https://persistent.oaistatic.com/burrito-nux/1920.webp')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(50px)",
        }}
      />
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: window.innerWidth > 1024 ? 0 : -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={clsx(
              "bg-gray-50/80 backdrop-blur-xl border-r border-gray-200/50",
              "flex flex-col w-80 h-full",
              window.innerWidth <= 1024
                ? "fixed inset-y-0 left-0 z-50 shadow-2xl"
                : "relative"
            )}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-purple-600 bg-clip-text text-transparent">
                  Clothify
                </span>
              </div>
              {window.innerWidth <= 1024 && (
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="p-4 space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center space-x-2 bg-purple-500 text-white rounded-xl py-3 px-4 hover:shadow-lg transition-all duration-200"
                onClick={startNewChat}
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">New Chat</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center space-x-2 bg-white text-purple-500 border border-purple-500 rounded-xl py-3 px-4 hover:shadow-lg transition-all duration-200"
                onClick={startTemporaryChat}
              >
                <Clock className="w-5 h-5" />
                <span className="font-medium">Temporary Chat</span>
              </motion.button>
            </div>

            <div className="px-4 mb-6">
              <div className="space-y-1">
                {[
                  { icon: User, label: "Edit Profile", href: "/edit-profile" },
                  { icon: HelpCircle, label: "Support", href: "/support" },
                  {
                    icon: Mail,
                    label: "Developer",
                    href: "/developer",
                  },
                ].map((item) => (
                  <motion.button
                    key={item.label}
                    whileHover={{ x: 4 }}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-white/50 rounded-lg transition-all duration-150"
                    onClick={() => navigate(item.href)}
                  >
                    <item.icon className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">{item.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="px-4 mb-3">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Recent Chats
                </h3>
              </div>
              <div className="px-2 space-y-6 h-full pb-4">
                {Object.entries(groupedConversations).map(
                  ([group, conversations]) => (
                    <div key={group}>
                      <h4 className="px-2 mb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {group}
                      </h4>
                      <div className="space-y-1">
                        {conversations.map((conv) => (
                          <motion.div
                            key={conv._id}
                            whileHover={{ x: 4 }}
                            onClick={() => handleConversationSelect(conv._id)}
                            className="group flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/60 cursor-pointer"
                          >
                            <MessageCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-700 truncate flex-1">
                              {conv.title}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteConversation(conv._id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all"
                            >
                              <Trash2 className="w-3 h-3 text-red-400" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="border-t border-gray-200/50 p-2">
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-white/60 transition-all"
                >
                  <img
                    src={authUser.avatar}
                    alt="User avatar"
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                  />
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">
                      {authUser.name}
                    </p>
                    <p className="text-sm text-gray-500">{authUser.email}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </motion.button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-200/50 overflow-hidden"
                    >
                      <button
                        onClick={handleNavigation}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          Edit Profile
                        </span>
                      </button>
                      <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-red-600"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSidebarOpen && window.innerWidth <= 1024 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
            >
              <h3 className="font-bold text-lg text-gray-900 mb-2">Sign Out</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to sign out?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col relative">
        {(!isSidebarOpen || window.innerWidth <= 1024) && (
          <motion.header
            initial={{ y: -60 }}
            animate={{ y: 0 }}
            className="flex items-center justify-between p-4 border-b border-gray-200/50 bg-white/80 backdrop-blur-xl"
          >
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Clothify Ai
                </span>
              </div>
            </div>
            <img
              src={authUser.avatar}
              alt="User avatar"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
          </motion.header>
        )}

        <div className="flex-1 flex flex-col relative overflow-hidden">
          {!currentConversationId && !isTemporaryChat ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col items-center justify-center p-8 text-center"
            >
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="mb-8"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-3xl flex items-center justify-center shadow-2xl">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-2xl"
              >
                <h1 className="text-4xl font-bold text-purple-700 bg-clip-text mb-4">
                  Hey! I'm Taara ✨
                </h1>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Your desi AI bestie is here. Are you ready to spill some tea?
                  I'll vibe with you, and yes, I'll slay your style every damn
                  time. No stress, baby, I got you.
                  <br /> So let's talk!
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
                  {[
                    {
                      title: "Date Night Drip",
                      desc: "Look hot, feel fab. I'll style you right.",
                    },
                    {
                      title: "Festive Fits",
                      desc: "From ethnic to extra, I've got you!",
                    },
                    {
                      title: "Daily Slay",
                      desc: "No reason needed, just slay every day.",
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="p-4 bg-gray-50/80 rounded-xl border border-gray-200/50"
                    >
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
              {isTemporaryChat && (
                <div className="text-center py-2 bg-yellow-50 text-yellow-700 rounded-lg mb-4">
                  Temporary Chat - Messages won't be saved
                </div>
              )}

              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={clsx(
                      "flex",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                    onMouseEnter={() => setHoveredMessageIndex(index)}
                    onMouseLeave={() => setHoveredMessageIndex(null)}
                  >
                    <div
                      className={clsx(
                        "max-w-3xl flex items-start space-x-3",
                        message.role === "user"
                          ? "flex-row-reverse space-x-reverse"
                          : ""
                      )}
                    >
                      {!isSmallScreen && (
                        <div
                          className={clsx(
                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                            message.role === "user"
                              ? "bg-purple-500"
                              : "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400"
                          )}
                        >
                          {message.role === "user" ? (
                            <User className="w-4 h-4 text-white" />
                          ) : (
                            <Sparkles className="w-4 h-4 text-white" />
                          )}
                        </div>
                      )}

                      <div
                        className={clsx(
                          "px-4 py-3 rounded-2xl shadow-sm border relative",
                          message.role === "user"
                            ? "bg-purple-500 text-white border-transparent"
                            : "bg-white text-gray-900 border-gray-200/50"
                        )}
                      >
                        {message.role === "assistant" ? (
                          <p
                            className="text-base leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: formatMessageContent(message.content),
                            }}
                          />
                        ) : (
                          <p className="text-base leading-relaxed">
                            {message.content}
                          </p>
                        )}

                        <div className="flex justify-between items-center mt-1">
                          <p
                            className={clsx(
                              "text-xs opacity-70",
                              message.role === "user"
                                ? "text-blue-100"
                                : "text-gray-500"
                            )}
                          >
                            {formatTime(message.timestamp)}
                          </p>

                          {message.role === "user" &&
                            hoveredMessageIndex === index && (
                              <div className="flex space-x-2 ml-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyMessage(message.content);
                                  }}
                                  className="p-1 rounded-full hover:bg-white/50 transition-colors"
                                  title="Copy message"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditMessage(message.content);
                                  }}
                                  className="p-1 rounded-full hover:bg-white/50 transition-colors"
                                  title="Edit message"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isSending && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="max-w-3xl flex items-start space-x-3">
                    {!isSmallScreen && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="px-4 py-3 bg-white rounded-2xl shadow-sm border border-gray-200/50">
                      <div className="flex space-x-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: i * 0.2,
                            }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          <motion.div layout className={clsx("p-4 sticky bottom-0")}>
            <div className="max-w-4xl mx-auto">
              <div className="relative flex items-center gap-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      isSmallScreen
                        ? "Type message..."
                        : "Ask me anything about fashion or we can gossip too ;)"
                    }
                    disabled={isSending}
                    rows={1}
                    className="w-full resize-none rounded-xl border border-gray-300/50 bg-white px-4 py-3 pr-12 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 focus:outline-none transition-all duration-200 shadow-sm text-lg sm:text-md custom-scrollbar-thin"
                    style={{
                      minHeight: "50px",
                      maxHeight: "100px",
                      overflowY: "auto",
                    }}
                  />
                </div>

                <motion.button
                  type="button"
                  disabled={!inputValue.trim() || isSending}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  className={clsx(
                    "p-3 ml-1.5 w-14 rounded-xl transition-all duration-200 flex items-center justify-center",
                    inputValue.trim() && !isSending
                      ? "bg-purple-500 text-white hover:shadow-lg"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  )}
                  style={{ height: "48px", marginTop: "-6px" }}
                >
                  {isSending ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx global="true">{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 4px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #9ca3af;
        }
        .custom-scrollbar-thin::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        strong {
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default ClothifyAI;
