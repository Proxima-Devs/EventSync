"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import EventIcon from "@mui/icons-material/Event";
import PeopleIcon from "@mui/icons-material/People";
import RoomIcon from "@mui/icons-material/MeetingRoom";
import QuestionIcon from "@mui/icons-material/QuestionAnswer";
import SessionIcon from "@mui/icons-material/Schedule";
import LiveIcon from "@mui/icons-material/LiveTv";
import UpcomingIcon from "@mui/icons-material/TrendingUp";
import { useNavigate, useCreatePath } from "react-admin";

interface Stats {
  totals: {
    events: number;
    sessions: number;
    speakers: number;
    rooms: number;
    questions: number;
  };
  live: { activeSessions: number };
  upcoming: { events: number };
  recentQuestions: {
    id: string;
    content: string;
    upvotes: number;
    session: { title: string; event: { title: string; slug: string } };
  }[];
  recentEvents: {
    id: string;
    title: string;
    startDate: string;
    location?: string;
    _count: { sessions: number };
  }[];
}

const BG = "#080C14";
const SURFACE = "#0F1622";
const BORDER = "#1A2436";
const TEXT_DIM = "#3A5070";
const TEXT_MAIN = "#E8EDF5";
const TEXT_BODY = "#BDD0E8";

const statCards = [
  { key: "events",   label: "Événements",  icon: EventIcon,    color: "#00E5FF" },
  { key: "sessions", label: "Sessions",     icon: SessionIcon,  color: "#7B61FF" },
  { key: "speakers", label: "Intervenants", icon: PeopleIcon,   color: "#00FFC8" },
  { key: "rooms",    label: "Salles",       icon: RoomIcon,     color: "#FF6B9D" },
  { key: "questions",label: "Questions",    icon: QuestionIcon, color: "#FFB347" },
];

const cardSx = {
  bgcolor: SURFACE,
  border: `1px solid ${BORDER}`,
  borderRadius: "14px",
  overflow: "hidden",
  position: "relative",
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const createPath = useCreatePath();

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "short", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <Box sx={{ p: 3.5, bgcolor: BG, minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: TEXT_MAIN, letterSpacing: "-0.5px" }}>
          Tableau de bord
        </Typography>
        <Typography sx={{ fontSize: 11, color: TEXT_DIM, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", mt: 0.5 }}>
          {today}
        </Typography>
      </Box>

      {/* Stat cards */}
      {loading ? (
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, lg: 2.4 }} key={i}>
              <Card sx={{ ...cardSx, height: 110 }} />
            </Grid>
          ))}
        </Grid>
      ) : stats?.totals && (
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          {statCards.map(({ key, label, icon: Icon, color }) => (
            <Grid size={{ xs: 12, sm: 6, lg: 2.4 }} key={key}>
              <Card
                onClick={() => navigate(createPath({ type: "list", resource: key }))}
                sx={{
                  ...cardSx,
                  cursor: "pointer",
                  transition: "border-color 0.25s, transform 0.2s",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0, left: 0, right: 0,
                    height: "2px",
                    background: `linear-gradient(90deg, ${color}, transparent)`,
                    opacity: 0.6,
                    transition: "opacity 0.25s",
                  },
                  "&:hover": {
                    borderColor: `${color}40`,
                    transform: "translateY(-2px)",
                    "&::before": { opacity: 1 },
                  },
                }}
              >
                <CardContent sx={{ p: "18px 16px 16px", "&:last-child": { pb: "16px" } }}>
                  <Box sx={{
                    width: 36, height: 36, borderRadius: "10px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    bgcolor: `${color}14`, color, mb: 1.75,
                  }}>
                    <Icon sx={{ fontSize: 18 }} />
                  </Box>
                  <Typography sx={{ fontSize: 32, fontWeight: 900, color: TEXT_MAIN, lineHeight: 1, letterSpacing: "-1px", fontVariantNumeric: "tabular-nums", mb: 0.5 }}>
                    {stats.totals[key as keyof typeof stats.totals]}
                  </Typography>
                  <Typography sx={{ fontSize: 10, color: TEXT_DIM, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                    {label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Widgets */}
      {stats && (
        <>
          <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <LiveWidget count={stats.live.activeSessions} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <UpcomingWidget count={stats.upcoming.events} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <RecentQuestionsWidget questions={stats.recentQuestions} />
            </Grid>
          </Grid>

          {stats.recentEvents.length > 0 && (
            <RecentEventsWidget events={stats.recentEvents} />
          )}
        </>
      )}
    </Box>
  );
}

function LiveWidget({ count }: { count: number }) {
  const navigate = useNavigate();
  const createPath = useCreatePath();
  return (
    <Card
      onClick={() => navigate(createPath({ type: "list", resource: "sessions" }))}
      sx={{ ...cardSx, cursor: "pointer" }}
    >
      <CardContent sx={{ p: "20px", "&:last-child": { pb: "20px" } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <Box sx={{
            width: 7, height: 7, borderRadius: "50%", bgcolor: "#FF4D6D", flexShrink: 0,
            "@keyframes blink": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.3 } },
            animation: "blink 1.2s infinite",
          }} />
          <Typography sx={{ fontSize: 10, color: TEXT_DIM, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Sessions en direct
          </Typography>
        </Box>
        <Typography sx={{ fontSize: 48, fontWeight: 900, color: "#FF4D6D", lineHeight: 1, letterSpacing: "-2px", fontVariantNumeric: "tabular-nums" }}>
          {count}
        </Typography>
        <Typography sx={{ fontSize: 12, color: TEXT_DIM, mt: 0.5 }}>
          {count === 1 ? "session en cours" : "sessions en cours"}
        </Typography>
      </CardContent>
    </Card>
  );
}

function UpcomingWidget({ count }: { count: number }) {
  const navigate = useNavigate();
  const createPath = useCreatePath();
  return (
    <Card
      onClick={() => navigate(createPath({ type: "list", resource: "events" }))}
      sx={{ ...cardSx, cursor: "pointer" }}
    >
      <CardContent sx={{ p: "20px", "&:last-child": { pb: "20px" } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <UpcomingIcon sx={{ color: "#00E5FF", fontSize: 14 }} />
          <Typography sx={{ fontSize: 10, color: TEXT_DIM, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            À venir
          </Typography>
        </Box>
        <Typography sx={{ fontSize: 48, fontWeight: 900, color: "#00E5FF", lineHeight: 1, letterSpacing: "-2px", fontVariantNumeric: "tabular-nums" }}>
          {count}
        </Typography>
        <Typography sx={{ fontSize: 12, color: TEXT_DIM, mt: 0.5 }}>
          {count === 1 ? "événement à venir" : "événements à venir"}
        </Typography>
      </CardContent>
    </Card>
  );
}

function RecentQuestionsWidget({ questions }: { questions: Stats["recentQuestions"] }) {
  const navigate = useNavigate();
  const createPath = useCreatePath();
  return (
    <Card sx={cardSx}>
      <CardContent sx={{ p: "20px", "&:last-child": { pb: "20px" } }}>
        <Typography sx={{ fontSize: 10, color: TEXT_DIM, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", mb: 2 }}>
          Dernières questions
        </Typography>
        {questions.length === 0 ? (
          <Typography sx={{ fontSize: 13, color: TEXT_DIM, fontStyle: "italic" }}>
            Aucune question pour le moment
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {questions.map((q, idx) => (
              <Box key={q.id} sx={{
                py: 1.25,
                cursor: "pointer",
                borderBottom: idx < questions.length - 1 ? `1px solid ${BORDER}` : "none",
                "&:hover": { bgcolor: `${BORDER}40` },
              }}
                onClick={() => navigate(createPath({ type: "edit", resource: "questions", id: q.id }))}
              >
                <Typography sx={{ fontSize: 13, color: TEXT_BODY, fontWeight: 500, lineHeight: 1.4 }}>
                  {q.content}
                </Typography>
                <Typography sx={{ fontSize: 11, color: TEXT_DIM, mt: 0.4 }}>
                  {q.session.event.title} — {q.session.title}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function RecentEventsWidget({ events }: { events: Stats["recentEvents"] }) {
  const navigate = useNavigate();
  const createPath = useCreatePath();
  return (
    <Card sx={cardSx}>
      <CardContent sx={{ p: "20px", "&:last-child": { pb: "20px" } }}>
        <Typography sx={{ fontSize: 10, color: TEXT_DIM, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", mb: 2 }}>
          Événements récents
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {events.map((e, idx) => (
            <Box key={e.id} sx={{
              display: "flex", alignItems: "center", gap: 1.75,
              py: 1.5,
              cursor: "pointer",
              borderBottom: idx < events.length - 1 ? `1px solid ${BORDER}` : "none",
              "&:hover": { bgcolor: `${BORDER}40` },
            }}
              onClick={() => navigate(createPath({ type: "edit", resource: "events", id: e.id }))}
            >
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#00E5FF", flexShrink: 0 }} />
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 13, color: TEXT_BODY, fontWeight: 600 }}>
                  {e.title}
                </Typography>
                <Typography sx={{ fontSize: 11, color: TEXT_DIM, mt: 0.3 }}>
                  {e._count.sessions} sessions{e.location ? ` — ${e.location}` : ""}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}