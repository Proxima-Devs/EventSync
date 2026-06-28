"use client";
import {
  List,
  Datagrid,
  TextField,
  ReferenceField,
  Edit,
  SimpleForm,
  TextInput,
  Create,
  EditButton,
  DeleteButton,
  BooleanInput,
  ReferenceInput,
  SelectInput,
  useRecordContext,
} from "react-admin";
import { Box, Typography, Chip } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

function HiddenBadge() {
  const record = useRecordContext();
  if (!record) return null;
  const hidden = record.isHidden;
  return (
    <Chip
      label={hidden ? "Hidden" : "Visible"}
      size="small"
      sx={{
        bgcolor: hidden ? "#FF6B9D14" : "#00FFC814",
        color: hidden ? "#FF6B9D" : "#00FFC8",
        border: `1px solid ${hidden ? "#FF6B9D" : "#00FFC8"}30`,
        fontWeight: 700,
        fontSize: 11,
        height: 24,
        borderRadius: "6px",
        "& .MuiChip-label": { px: 1.25 },
      }}
    />
  );
}

function UpvotesField() {
  const record = useRecordContext();
  if (!record) return null;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#7B61FF" }}>
      <ArrowUpwardIcon sx={{ fontSize: 14 }} />
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#7B61FF", fontVariantNumeric: "tabular-nums" }}>
        {record.upvotes ?? 0}
      </Typography>
    </Box>
  );
}

function RepliesField() {
  const record = useRecordContext();
  return (
    <Box sx={{ mt: 2, width: "100%" }}>
      {!record?.replies?.length ? (
        <Typography sx={{ fontSize: 13, color: "#3A5070", fontStyle: "italic" }}>
          Aucune réponse
        </Typography>
      ) : (
        <Box>
          <Typography sx={{ fontSize: 11, color: "#3A5070", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", mb: 1.5 }}>
            Réponses ({record.replies.length})
          </Typography>
          {record.replies.map((reply: any, idx: number) => (
            <Box
              key={reply.id}
              sx={{
                py: 1.25,
                borderBottom: idx < record.replies.length - 1 ? "1px solid #1A2436" : "none",
              }}
            >
              <Typography sx={{ fontSize: 12, color: "#E8EDF5", fontWeight: 700 }}>
                {reply.authorName ?? "Anonyme"}
                {" · "}
                <Typography component="span" sx={{ fontSize: 11, color: "#3A5070" }}>
                  {new Date(reply.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                  })}
                </Typography>
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#BDD0E8", lineHeight: 1.4, mt: 0.25 }}>
                {reply.content}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

export const QuestionsList = (props: any) => (
  <List {...props} perPage={25}>
    <Datagrid rowClick="edit">
      <TextField source="content" label="Contenu" />
      <ReferenceField source="sessionId" reference="sessions" label="Session">
        <TextField source="title" />
      </ReferenceField>
      <UpvotesField />
      <HiddenBadge />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const QuestionsEdit = (props: any) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="content" label="Contenu" multiline fullWidth />
      <TextInput source="authorName" label="Auteur" fullWidth />
      <BooleanInput source="isHidden" label="Masquer la question" />
      <RepliesField />
    </SimpleForm>
  </Edit>
);

export const QuestionsCreate = (props: any) => (
  <Create {...props} redirect="list">
    <SimpleForm>
      <TextInput source="content" label="Contenu" multiline fullWidth />
      <TextInput source="authorName" label="Auteur" fullWidth />
      <ReferenceInput source="sessionId" reference="sessions" label="Session">
        <SelectInput optionText="title" />
      </ReferenceInput>
    </SimpleForm>
  </Create>
);

export default QuestionsList;
