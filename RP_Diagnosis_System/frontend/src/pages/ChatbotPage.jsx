import { useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import MainLayout from "../components/MainLayout";
import PageHeader from "../components/PageHeader";
import { createChatSession, getChatMessages, sendChatMessage } from "../api";
import { useAuth } from "../auth/AuthContext";

const starterPrompts = [
  "What is Retinitis Pigmentosa?",
  "Can RP affect peripheral vision?",
  "What does Grad-CAM mean in this system?",
];

export default function ChatbotPage() {
  const { token } = useAuth();
  const [sessionId, setSessionId] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello. I am the ophthalmology support assistant. Ask about RP, retinal findings, or how to use the platform.",
    },
  ]);

  const endRef = useRef(null);

  // Initialize chat session on mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const session = await createChatSession(
          {
            title: "RP Diagnosis Chat",
            context_type: "medical",
          },
          token
        );
        setSessionId(session.id);

        // Load previous messages if any
        const previousMessages = await getChatMessages(session.id, token);
        if (previousMessages && previousMessages.length > 0) {
          setMessages(previousMessages);
        }
      } catch (err) {
        console.error("Failed to initialize chat session:", err);
      } finally {
        setInitializing(false);
      }
    };

    if (token && !sessionId) {
      initializeSession();
    }
  }, [token, sessionId]);

  const canSend = useMemo(() => input.trim().length > 0 && !loading && sessionId, [input, loading, sessionId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!canSend) return;

    const userMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await sendChatMessage(sessionId, { content: input.trim() }, token);
      setMessages((prev) => [
        ...prev,
        ...response.filter((msg) => msg.role === "assistant"),
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, I encountered an error: ${err.message}. Please try again.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout title="Chatbot">
      <PageHeader
        eyebrow="Assistant"
        title="Ophthalmology chatbot"
        subtitle="Retrieval-based support interface with cleaner layout, safer tone, and presentation-ready UX."
      />

      <Stack spacing={3}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
              {starterPrompts.map((prompt) => (
                <Button
                  key={prompt}
                  variant="outlined"
                  onClick={() => setInput(prompt)}
                  disabled={!sessionId || initializing}
                >
                  {prompt}
                </Button>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ minHeight: 520 }}>
          <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2, height: "100%", p: 3 }}>
            <Box sx={{ flexGrow: 1, maxHeight: 440, overflowY: "auto", pr: 1 }}>
              <Stack spacing={2}>
                {initializing && (
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: "rgba(21, 94, 239, 0.12)", color: "primary.main" }}>
                      <SmartToyOutlinedIcon />
                    </Avatar>
                    <Box sx={{ px: 2, py: 1.5, bgcolor: "#F2F4F7", borderRadius: 3 }}>
                      <Typography>Initializing chat session...</Typography>
                    </Box>
                  </Stack>
                )}

                {messages.map((msg, index) => (
                  <Stack
                    key={index}
                    direction="row"
                    spacing={1.5}
                    justifyContent={msg.role === "user" ? "flex-end" : "flex-start"}
                  >
                    {msg.role === "assistant" ? (
                      <Avatar sx={{ bgcolor: "rgba(21, 94, 239, 0.12)", color: "primary.main" }}>
                        <SmartToyOutlinedIcon />
                      </Avatar>
                    ) : null}

                    <Box
                      sx={{
                        maxWidth: 760,
                        bgcolor: msg.role === "user" ? "primary.main" : "#F2F4F7",
                        color: msg.role === "user" ? "white" : "text.primary",
                        px: 2,
                        py: 1.5,
                        borderRadius: 3,
                      }}
                    >
                      <Typography sx={{ lineHeight: 1.7 }}>{msg.content}</Typography>
                    </Box>

                    {msg.role === "user" ? <Avatar>U</Avatar> : null}
                  </Stack>
                ))}

                {loading ? (
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: "rgba(21, 94, 239, 0.12)", color: "primary.main" }}>
                      <SmartToyOutlinedIcon />
                    </Avatar>
                    <Box sx={{ px: 2, py: 1.5, bgcolor: "#F2F4F7", borderRadius: 3 }}>
                      <CircularProgress size={20} />
                    </Box>
                  </Stack>
                ) : null}

                <div ref={endRef} />
              </Stack>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <TextField
                placeholder="Ask an ophthalmology question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={!sessionId || initializing}
              />
              <Button
                variant="contained"
                endIcon={<SendRoundedIcon />}
                onClick={handleSend}
                disabled={!canSend}
              >
                Send
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </MainLayout>
  );
}