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
  SearchInput,
  Filter,
} from "react-admin";
import ImageUploadInput from "./ImageUploadInput";

const SpeakersFilter = (props: any) => (
  <Filter {...props}>
    <SearchInput source="q" alwaysOn placeholder="Rechercher..." sx={{ minWidth: 250 }} />
  </Filter>
);

export const SpeakersList = (props: any) => (
  <List {...props} perPage={25} filters={<SpeakersFilter />}>
    <Datagrid rowClick="edit">
      <ImageField source="photo" sx={{ "& img": { width: 40, height: 40, objectFit: "cover" } }} />
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
  <Create {...props} redirect="list">
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
