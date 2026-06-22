"use client";
import React from "react";
import {
  List,
  Datagrid,
  TextField,
  DateField,
  Edit,
  SimpleForm,
  TextInput,
  DateTimeInput,
  Create,
  EditButton,
  DeleteButton,
  NumberField,
  ImageField,
} from "react-admin";
import ImageUploadInput from "./ImageUploadInput";

export const EventsList = (props: any) => (
  <List {...props} perPage={25}>
    <Datagrid rowClick="edit">
      <ImageField source="coverImage" sx={{ "& img": { width: 60, height: 40, borderRadius: 1, objectFit: "cover" } }} />
      <TextField source="title" />
      <TextField source="slug" />
      <DateField source="startDate" showTime locales="fr-FR" />
      <DateField source="endDate" showTime locales="fr-FR" />
      <NumberField source="_count.sessions" label="Sessions" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const EventsEdit = (props: any) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="title" fullWidth />
      <TextInput source="description" multiline fullWidth />
      <TextInput source="location" fullWidth />
      <DateTimeInput source="startDate" />
      <DateTimeInput source="endDate" />
      <ImageUploadInput source="coverImage" label="Image de couverture" />
    </SimpleForm>
  </Edit>
);

export const EventsCreate = (props: any) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="title" fullWidth />
      <TextInput source="description" multiline fullWidth />
      <TextInput source="location" fullWidth />
      <DateTimeInput source="startDate" />
      <DateTimeInput source="endDate" />
      <ImageUploadInput source="coverImage" label="Image de couverture" />
    </SimpleForm>
  </Create>
);

export default EventsList;
