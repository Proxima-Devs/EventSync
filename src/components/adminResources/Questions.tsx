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
import EditNoteIcon from "@mui/icons-material/EditNote";

const BG = "#080C14";
const SURFACE = "#0F1622";
const BORDER = "#1A2436";
const TEXT_DIM = "#3A5070";
const TEXT_MAIN = "#E8EDF5";
const TEXT_BODY = "#BDD0E8";
const CYAN = "#00E5FF";
const VIOLET = "#7B61FF";
const PINK = "#FF6B9D";
const GREEN = "#00FFC8";

function HiddenBadge() {
  const record = useRecordContext();
  if (!record) return null;
  const hidden = record.isHidden;
  return (
    <Chip
      label={hidden ? "Hidden" : "Visible"}
      size="small"
      sx={{
        bgcolor: hidden ? `${PINK}14` : `${GREEN}14`,
        color: hidden ? PINK : GREEN,
        border: `1px solid ${hidden ? PINK : GREEN}30`,
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
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: VIOLET }}>
      <ArrowUpwardIcon sx={{ fontSize: 14 }} />
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: VIOLET, fontVariantNumeric: "tabular-nums" }}>
        {record.upvotes ?? 0}
      </Typography>
    </Box>
  );
}

function RepliesField() {
  const record = useRecordContext();

  return (
    <Box sx={{ mt: 2, width: "100%", bgcolor: BG, borderRadius: "10px", border: `1px solid ${BORDER}`, overflow: "hidden" }}>
      <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
        <Typography sx={{ fontSize: 10, color: TEXT_DIM, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>
          Réponses{record?.replies?.length ? ` (${record.replies.length})` : ""}
        </Typography>
      </Box>

      {!record?.replies?.length ? (
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography sx={{ fontSize: 13, color: TEXT_DIM, fontStyle: "italic" }}>
            Aucune réponse
          </Typography>
        </Box>
      ) : (
        <Box sx={{ px: 2 }}>
          {record.replies.map((reply: any, idx: number) => (
            <Box
              key={reply.id}
              sx={{
                py: 1.5,
                borderBottom: idx < record.replies.length - 1 ? `1px solid ${BORDER}` : "none",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                <Typography sx={{ fontSize: 12, color: TEXT_MAIN, fontWeight: 700 }}>
                  {reply.authorName ?? "Anonyme"}
                </Typography>
                <Typography sx={{ fontSize: 11, color: TEXT_DIM }}>
                  ·{" "}
                  {new Date(reply.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: 13, color: TEXT_BODY, lineHeight: 1.4 }}>
                {reply.content}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

const inputSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: BG,
    borderRadius: "10px",
    color: TEXT_BODY,
    fontSize: 13,
    "& fieldset": { borderColor: BORDER },
    "&:hover fieldset": { borderColor: `${CYAN}40` },
    "&.Mui-focused fieldset": { borderColor: `${CYAN}60`, borderWidth: 1 },
  },
  "& .MuiInputLabel-root": { color: TEXT_DIM, fontSize: 13 },
  "& .MuiInputLabel-root.Mui-focused": { color: CYAN },
};

const switchSx = {
  "& .MuiSwitch-switchBase.Mui-checked": { color: CYAN },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: `${CYAN}60` },
  "& .MuiSwitch-track": { bgcolor: BORDER },
  "& .MuiFormControlLabel-label": { color: TEXT_BODY, fontSize: 13 },
};

function FormHeader({ label }: { label: string }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        px: 2.5,
        py: 2,
        borderBottom: `1px solid ${BORDER}`,
        bgcolor: SURFACE,
      }}
    >
      <EditNoteIcon sx={{ color: CYAN, fontSize: 20 }} />
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: TEXT_MAIN }}>
        {label}
      </Typography>
    </Box>
  );
}

const formSx = {
  bgcolor: SURFACE,
  borderRadius: "14px",
  border: `1px solid ${BORDER}`,
  overflow: "hidden",
  "& .RaSimpleForm-form": {
    bgcolor: SURFACE,
    p: 2.5,
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  "& .RaToolbar-root": {
    bgcolor: SURFACE,
    borderTop: `1px solid ${BORDER}`,
    px: 2.5,
    py: 1.75,
    mt: 0,
  },
  "& .MuiButton-containedPrimary": {
    bgcolor: `${CYAN}14`,
    color: CYAN,
    border: `1px solid ${CYAN}30`,
    borderRadius: "10px",
    fontWeight: 700,
    fontSize: 13,
    boxShadow: "none",
    "&:hover": { bgcolor: `${CYAN}22`, boxShadow: "none" },
  },
  "& .MuiButton-text": {
    color: TEXT_DIM,
    fontWeight: 600,
    fontSize: 13,
  },
};

const datagridSx = {
  bgcolor: SURFACE,
  borderRadius: "14px",
  border: `1px solid ${BORDER}`,
  overflow: "hidden",
  "& .RaDatagrid-tableWrapper": { borderRadius: "14px" },
  "& .MuiTableHead-root": {
    bgcolor: SURFACE,
    "& .MuiTableCell-head": {
      bgcolor: SURFACE,
      color: TEXT_DIM,
      fontSize: 10,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.12em",
      borderBottom: `1px solid ${BORDER}`,
      py: 1.25,
    },
  },
  "& .MuiTableBody-root": {
    "& .MuiTableRow-root": {
      bgcolor: SURFACE,
      transition: "background 0.15s",
      "&:hover": { bgcolor: "#ffffff06" },
      "& .MuiTableCell-body": {
        color: TEXT_BODY,
        fontSize: 13,
        fontWeight: 500,
        borderBottom: `1px solid ${BORDER}`,
        py: 1.75,
      },
      "&:last-child .MuiTableCell-body": { borderBottom: "none" },
    },
  },
};

export const QuestionsList = (props: any) => (
  <List
    {...props}
    perPage={25}
    sx={{
      "& .RaList-main": { bgcolor: "transparent" },
      "& .MuiPaper-root": { bgcolor: "transparent", boxShadow: "none" },
      "& .RaList-actions .MuiButton-containedPrimary": {
        bgcolor: `${CYAN}14`,
        color: CYAN,
        border: `1px solid ${CYAN}30`,
        borderRadius: "10px",
        fontWeight: 700,
        boxShadow: "none",
        "&:hover": { bgcolor: `${CYAN}22`, boxShadow: "none" },
      },
    }}
  >
    <Datagrid rowClick="edit" sx={datagridSx}>
      <TextField source="content" label="Contenu" />
      <ReferenceField source="sessionId" reference="sessions" label="Session">
        <TextField source="title" />
      </ReferenceField>
      <UpvotesField />
      <HiddenBadge />
      <EditButton
        sx={{
          color: CYAN,
          border: `1px solid ${CYAN}20`,
          borderRadius: "8px",
          fontSize: 11,
          fontWeight: 600,
          "&:hover": { bgcolor: `${CYAN}10` },
        }}
      />
      <DeleteButton
        sx={{
          color: PINK,
          border: `1px solid ${PINK}20`,
          borderRadius: "8px",
          fontSize: 11,
          fontWeight: 600,
          "&:hover": { bgcolor: `${PINK}10` },
        }}
      />
    </Datagrid>
  </List>
);

export const QuestionsEdit = (props: any) => (
  <Edit {...props} sx={{ "& .MuiPaper-root": { bgcolor: "transparent", boxShadow: "none" } }}>
    <Box sx={{ bgcolor: SURFACE, borderRadius: "14px", border: `1px solid ${BORDER}`, overflow: "hidden" }}>
      <FormHeader label="Modifier la question" />
      <SimpleForm sx={formSx}>
        <TextInput source="content" label="Contenu" multiline fullWidth sx={inputSx} />
        <TextInput source="authorName" label="Auteur" fullWidth sx={inputSx} />
        <BooleanInput source="isHidden" label="Masquer la question" sx={switchSx} />
        <RepliesField />
      </SimpleForm>
    </Box>
  </Edit>
);

export const QuestionsCreate = (props: any) => (
  <Create {...props} sx={{ "& .MuiPaper-root": { bgcolor: "transparent", boxShadow: "none" } }}>
    <Box sx={{ bgcolor: SURFACE, borderRadius: "14px", border: `1px solid ${BORDER}`, overflow: "hidden" }}>
      <FormHeader label="Nouvelle question" />
      <SimpleForm sx={formSx}>
        <TextInput source="content" label="Contenu" multiline fullWidth sx={inputSx} />
        <TextInput source="authorName" label="Auteur" fullWidth sx={inputSx} />
        <ReferenceInput source="sessionId" reference="sessions" label="Session">
          <SelectInput
            optionText="title"
            sx={{
              ...inputSx,
              "& .MuiSelect-select": { color: TEXT_BODY, fontSize: 13 },
              "& .MuiSvgIcon-root": { color: TEXT_DIM },
            }}
          />
        </ReferenceInput>
      </SimpleForm>
    </Box>
  </Create>
);

export default QuestionsList;