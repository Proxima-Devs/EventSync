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
} from "react-admin";

export const EventsList = (props: any) => (
  <List {...props} perPage={25}>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="title" />
      <TextField source="slug" />
      <DateField source="startDate" showTime />
      <DateField source="endDate" showTime />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const EventsEdit = (props: any) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="title" />
      <TextInput source="description" multiline />
      <TextInput source="location" />
      <DateTimeInput source="startDate" />
      <DateTimeInput source="endDate" />
      <TextInput source="coverImage" />
    </SimpleForm>
  </Edit>
);

export const EventsCreate = (props: any) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="title" />
      <TextInput source="description" multiline />
      <TextInput source="location" />
      <DateTimeInput source="startDate" />
      <DateTimeInput source="endDate" />
      <TextInput source="coverImage" />
    </SimpleForm>
  </Create>
);

export default EventsList;
