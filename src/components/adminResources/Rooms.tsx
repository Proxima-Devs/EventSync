"use client";
import React from "react";
import {
  List,
  Datagrid,
  TextField,
  Edit,
  SimpleForm,
  TextInput,
  Create,
  Show,
  EditButton,
  DeleteButton,
  useRecordContext,
  useNavigate,
} from "react-admin";
import { Box, Typography, Card, CardContent } from "@mui/material";

const BG = "#080C14";
const SURFACE = "#0F1622";
const BORDER = "#1A2436";
const TEXT_DIM = "#3A5070";
const TEXT_MAIN = "#E8EDF5";
const TEXT_BODY = "#BDD0E8";

function RoomDetail() {
  const record = useRecordContext();
  const navigate = useNavigate();
  const sessions = record?.sessions ?? [];

  return (
    <Box>
      <Typography sx={{ fontSize: 30, fontWeight: 800, color: TEXT_MAIN, letterSpacing: "-0.3px", mb: 0.5 }}>
        {record?.name}
      </Typography>

      {sessions.length === 0 ? (
        <Box>
          <Typography sx={{ fontSize: 11, color: TEXT_DIM, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", mb: 1 }}>
            Sessions
          </Typography>
          <Typography sx={{ fontSize: 13, color: TEXT_DIM, fontStyle: "italic" }}>
            Aucune session dans cette salle
          </Typography>
        </Box>
      ) : (
        <Box>
          <Typography sx={{ fontSize: 11, color: TEXT_DIM, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", mb: 1.5 }}>
            Sessions ({sessions.length})
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            {sessions.map((session: any) => (
              <Card
                key={session.id}
                onClick={() => navigate(`/admin/sessions/${session.id}`)}
                sx={{
                  bgcolor: SURFACE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: "10px",
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                  "&:hover": { borderColor: `${TEXT_DIM}80` },
                }}
              >
                <CardContent sx={{ p: "12px 16px", "&:last-child": { pb: "12px" } }}>
                  <Typography sx={{ fontSize: 20, color: TEXT_MAIN, fontWeight: 600, mb: 0.5 }}>
                    {session.title}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                    <Typography sx={{ fontSize: 14, color: TEXT_DIM }}>
                      {new Date(session.startTime).toLocaleDateString("fr-FR", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                      {" — "}
                      {new Date(session.endTime).toLocaleDateString("fr-FR", {
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </Typography>
                    {session.event && (
                      <Typography sx={{ fontSize: 14, color: TEXT_DIM }}>
                        {session.event.title}
                      </Typography>
                    )}
                    {session.speakers?.length > 0 && (
                      <Typography sx={{ fontSize: 14, color: TEXT_DIM }}>
                        {session.speakers.map((s: any) => s.speaker.fullName).join(", ")}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

export const RoomsList = (props: any) => (
  <List {...props} perPage={25}>
    <Datagrid rowClick="show">
      <TextField source="name" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const RoomsShow = (props: any) => (
  <Show {...props}>
    <Box sx={{ p: 0 }}>
      <RoomDetail />
    </Box>
  </Show>
);

export const RoomsEdit = (props: any) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="name" />
    </SimpleForm>
  </Edit>
);

export const RoomsCreate = (props: any) => (
  <Create {...props} redirect="list">
    <SimpleForm>
      <TextInput source="name" />
    </SimpleForm>
  </Create>
);

export default RoomsList;
