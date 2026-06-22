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
  EditButton,
  DeleteButton,
  ImageField,
} from "react-admin";
import ImageUploadInput from "./ImageUploadInput";

export const SpeakersList = (props: any) => (
  <List {...props} perPage={25}>
    <Datagrid rowClick="edit">
      <ImageField source="photo" sx={{ "& img": { width: 40, height: 40, borderRadius: "50%", objectFit: "cover" } }} />
      <TextField source="fullName" />
      <TextField source="slug" />
      <TextField source="_count.sessions" label="Sessions" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const SpeakersEdit = (props: any) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="fullName" fullWidth />
      <TextInput source="bio" multiline fullWidth />
      <ImageUploadInput source="photo" label="Photo" />
      <TextInput source="links.twitter" label="Twitter" fullWidth />
      <TextInput source="links.linkedin" label="LinkedIn" fullWidth />
      <TextInput source="links.github" label="GitHub" fullWidth />
      <TextInput source="links.website" label="Site web" fullWidth />
    </SimpleForm>
  </Edit>
);

export const SpeakersCreate = (props: any) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="fullName" fullWidth />
      <TextInput source="bio" multiline fullWidth />
      <ImageUploadInput source="photo" label="Photo" />
      <TextInput source="links.twitter" label="Twitter" fullWidth />
      <TextInput source="links.linkedin" label="LinkedIn" fullWidth />
      <TextInput source="links.github" label="GitHub" fullWidth />
      <TextInput source="links.website" label="Site web" fullWidth />
    </SimpleForm>
  </Create>
);

export default SpeakersList;
