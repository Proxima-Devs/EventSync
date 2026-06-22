"use client";
import * as React from "react";
import { Admin, Resource } from "react-admin";
import raDataProvider from "@/lib/raDataProvider";
import Dashboard from "./adminResources/Dashboard";
import { EventsList, EventsEdit, EventsCreate } from "./adminResources/Events";
import { SpeakersList, SpeakersEdit, SpeakersCreate } from "./adminResources/Speakers";
import { RoomsList, RoomsEdit, RoomsCreate } from "./adminResources/Rooms";
import { SessionsList, SessionsEdit, SessionsCreate } from "./adminResources/Sessions";
import { QuestionsList, QuestionsEdit, QuestionsCreate } from "./adminResources/Questions";
import { createTheme } from "@mui/material";
import AdminLayout from "./AdminLayout";


const darkTheme = createTheme({ 
  palette: {
    mode: "dark" as const,
    primary: { main: "#00E5FF", contrastText: "#000" },
    secondary: { main: "#7b61ff" },
    background: { default: "#0e1114", paper: "#0d1117" },
    text: { primary: "#eee", secondary: "#4a5568" },
    divider: "#1e2530",
    error: { main: "#ff4d6d" },
    warning: { main: "#ffb347" },
    success: { main: "#00ffc8" },
  },
  typography: { fontFamily: '"Open Sans Local", ui-sans-serif, system-ui, sans-serif' },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiTableCell: { styleOverrides: { root: { borderBottomColor: "#1e2530" } } },
    MuiTableHead: { styleOverrides: { root: { "& .MuiTableCell-root": { color: "#3a4a5a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 11 } } } },
    MuiDrawer: { styleOverrides: { paper: { borderRight: "1px solid #1e2530" } } },
    MuiAppBar: { styleOverrides: { root: { borderBottom: "1px solid #1e2530" } } },
    MuiButton: { styleOverrides: { root: { textTransform: "none", fontWeight: 600, borderRadius: 10 } } },
    MuiInputBase: { styleOverrides: { root: { "&.MuiOutlinedInput-root": { "& fieldset": { borderColor: "#1e2530" }, "&:hover fieldset": { borderColor: "#00E5FF44" }, "&.Mui-focused fieldset": { borderColor: "#00E5FF" } } } } },
    MuiTableRow: { styleOverrides: { root: { "&:hover": { backgroundColor: "#0a0e14" } } } },
  },
});

const AdminApp = () => (
  <div style={{ height: "100vh", backgroundColor: "#0e1114" }}>
    <Admin layout={AdminLayout} dataProvider={raDataProvider} dashboard={Dashboard} darkTheme={darkTheme as any} defaultTheme="dark">
      <Resource name="events" list={EventsList} edit={EventsEdit} create={EventsCreate} />
      <Resource name="speakers" list={SpeakersList} edit={SpeakersEdit} create={SpeakersCreate} />
      <Resource name="sessions" list={SessionsList} edit={SessionsEdit} create={SessionsCreate} />
      <Resource name="rooms" list={RoomsList} edit={RoomsEdit} create={RoomsCreate} />
      <Resource name="questions" list={QuestionsList} edit={QuestionsEdit} create={QuestionsCreate} />
    </Admin>
  </div>
);
export default AdminApp;
