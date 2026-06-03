"use client";
import React from "react";
import {
  List,
  Datagrid,
  TextField,
  ReferenceField,
  Edit,
  SimpleForm,
  TextInput,
  DateTimeInput,
  NumberInput,
  ReferenceInput,
  SelectInput,
  ReferenceArrayInput,
  AutocompleteArrayInput,
  Create,
  EditButton,
  DeleteButton,
} from "react-admin";

export const SessionsList = (props: any) => (
  <List {...props} perPage={25}>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="title" />
      <ReferenceField source="eventId" reference="events">
        <TextField source="title" />
      </ReferenceField>
      <ReferenceField source="roomId" reference="rooms">
        <TextField source="name" />
      </ReferenceField>
      <TextField source="_count.questions" label="Questions" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const SessionsEdit = (props: any) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="title" />
      <TextInput source="description" multiline />
      <DateTimeInput source="startTime" />
      <DateTimeInput source="endTime" />
      <NumberInput source="capacity" />
      <ReferenceInput source="eventId" reference="events">
        <SelectInput optionText="title" />
      </ReferenceInput>
      <ReferenceInput source="roomId" reference="rooms">
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ReferenceArrayInput source="speakerIds" reference="speakers">
        <AutocompleteArrayInput optionText="fullName" />
      </ReferenceArrayInput>
    </SimpleForm>
  </Edit>
);

export const SessionsCreate = (props: any) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="title" />
      <TextInput source="description" multiline />
      <DateTimeInput source="startTime" />
      <DateTimeInput source="endTime" />
      <NumberInput source="capacity" />
      <ReferenceInput source="eventId" reference="events">
        <SelectInput optionText="title" />
      </ReferenceInput>
      <ReferenceInput source="roomId" reference="rooms">
        <SelectInput optionText="name" />
      </ReferenceInput>
      <ReferenceArrayInput source="speakerIds" reference="speakers">
        <AutocompleteArrayInput optionText="fullName" />
      </ReferenceArrayInput>
    </SimpleForm>
  </Create>
);

export default SessionsList;
