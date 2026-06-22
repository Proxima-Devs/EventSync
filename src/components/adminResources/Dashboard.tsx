"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import Grid from "@mui/material/Grid";
// ✅ Après — importe uniquement ce qui est utilisé
import EventIcon from "@mui/icons-material/Event";
import PeopleIcon from "@mui/icons-material/People";
import RoomIcon from "@mui/icons-material/MeetingRoom";
import QuestionIcon from "@mui/icons-material/QuestionAnswer";
import SessionIcon from "@mui/icons-material/Schedule";
import LiveIcon from "@mui/icons-material/LiveTv";
import UpcomingIcon from "@mui/icons-material/TrendingUp";

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
    session: {
      title: string;
      event: { title: string; slug: string };
    };
  }[];
  recentEvents: {
    id: string;
    title: string;
    startDate: string;
    location?: string;
    _count: { sessions: number };
  }[];
}

const statCards = [
  { key: "events", label: "Événements", icon: EventIcon, color: "#00E5FF" },
  { key: "sessions", label: "Sessions", icon: SessionIcon, color: "#7b61ff" },
  { key: "speakers", label: "Intervenants", icon: PeopleIcon, color: "#00ffc8" },
  { key: "rooms", label: "Salles", icon: RoomIcon, color: "#ff6b9d" },
  { key: "questions", label: "Questions", icon: QuestionIcon, color: "#ffb347" },
];

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => {
        if (!r.ok) throw new Error("Erreur API");
        return r.json();
      })
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 800, color: "#eee" }}>
          Tableau de bord
        </Typography>
        <Grid container spacing={2}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={i}>
              <Card sx={{ bgcolor: "#0d1117", border: "1px solid #1e2530", borderRadius: 3 }}>
                <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
                  <Box sx={{ height: 80 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (!stats?.totals) return null;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 800, color: "#eee" }}>
        Tableau de bord
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {statCards.map(({ key, label, icon: Icon, color }) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={key}>
            <Card
              sx={{
                bgcolor: "#0d1117",
                border: "1px solid #1e2530",
                borderRadius: 3,
                transition: "border-color 0.2s",
                "&:hover": { borderColor: color, boxShadow: `0 0 20px ${color}15` },
              }}
            >
              <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: `${color}12`, color }}>
                    <Icon sx={{ fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: "#eee", lineHeight: 1.2 }}>
                      {stats.totals[key as keyof typeof stats.totals]}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#3a4a5a", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 10 }}>
                      {label}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
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
        <Box sx={{ mt: 3 }}>
          <RecentEventsWidget events={stats.recentEvents} />
        </Box>
      )}
    </Box>
  );
}

function LiveWidget({ count }: { count: number }) {
  return (
    <Card sx={{ bgcolor: "#0d1117", border: "1px solid #1e2530", borderRadius: 3 }}>
      <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <LiveIcon sx={{ color: "#ff4d6d", fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ color: "#3a4a5a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 11 }}>
            Sessions en direct
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
          <Typography variant="h3" sx={{ fontWeight: 900, color: "#ff4d6d", lineHeight: 1 }}>
            {count}
          </Typography>
          <Typography variant="body2" sx={{ color: "#3a4a5a" }}>
            {count === 1 ? "session en cours" : "sessions en cours"}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

function UpcomingWidget({ count }: { count: number }) {
  return (
    <Card sx={{ bgcolor: "#0d1117", border: "1px solid #1e2530", borderRadius: 3 }}>
      <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <UpcomingIcon sx={{ color: "#00E5FF", fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ color: "#3a4a5a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 11 }}>
            À venir
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
          <Typography variant="h3" sx={{ fontWeight: 900, color: "#00E5FF", lineHeight: 1 }}>
            {count}
          </Typography>
          <Typography variant="body2" sx={{ color: "#3a4a5a" }}>
            {count === 1 ? "événement à venir" : "événements à venir"}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

function RecentQuestionsWidget({ questions }: { questions: Stats["recentQuestions"] }) {
  return (
    <Card sx={{ bgcolor: "#0d1117", border: "1px solid #1e2530", borderRadius: 3 }}>
      <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
        <Typography variant="subtitle2" sx={{ color: "#3a4a5a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 11, mb: 2 }}>
          Dernières questions
        </Typography>
        {questions.length === 0 ? (
          <Typography variant="body2" sx={{ color: "#3a4a5a", fontStyle: "italic" }}>
            Aucune question pour le moment
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {questions.map((q) => (
              <Box key={q.id} sx={{ pb: 1.5, borderBottom: "1px solid #1e2530", "&:last-child": { borderBottom: 0, pb: 0 } }}>
                <Typography variant="body2" sx={{ color: "#ccc", fontWeight: 600, lineHeight: 1.3 }}>
                  {q.content}
                </Typography>
                <Typography variant="caption" sx={{ color: "#3a4a5a", mt: 0.5, display: "block" }}>
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
  return (
    <Card sx={{ bgcolor: "#0d1117", border: "1px solid #1e2530", borderRadius: 3 }}>
      <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
        <Typography variant="subtitle2" sx={{ color: "#3a4a5a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 11, mb: 2 }}>
          Événements récents
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {events.map((e) => (
            <Box key={e.id} sx={{ display: "flex", alignItems: "center", gap: 2, pb: 1.5, borderBottom: "1px solid #1e2530", "&:last-child": { borderBottom: 0, pb: 0 } }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#00E5FF", flexShrink: 0 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ color: "#ccc", fontWeight: 600 }}>
                  {e.title}
                </Typography>
                <Typography variant="caption" sx={{ color: "#3a4a5a" }}>
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
