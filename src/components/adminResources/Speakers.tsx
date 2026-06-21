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
} from "react-admin";

export const SpeakersList = (props: any) => (
  <List {...props} perPage={25}>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="fullName" />
      <TextField source="slug" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const SpeakersEdit = (props: any) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="fullName" />
      <TextInput source="photo" />
      <TextInput source="bio" multiline />
    </SimpleForm>
  </Edit>
);

export const SpeakersCreate = (props: any) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="fullName" />
      <TextInput source="photo" />
      <TextInput source="bio" multiline />
    </SimpleForm>
  </Create>
);

export default SpeakersList;
