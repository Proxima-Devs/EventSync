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

export const RoomsList = (props: any) => (
  <List {...props} perPage={25}>
    <Datagrid rowClick="edit">
      <TextField source="name" />
      <TextField source="slug" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const RoomsEdit = (props: any) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="slug" />
    </SimpleForm>
  </Edit>
);

export const RoomsCreate = (props: any) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="slug" />
    </SimpleForm>
  </Create>
);

export default RoomsList;
