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
  SearchInput,
  Filter,
} from "react-admin";

const SessionsFilter = (props: any) => (
  <Filter {...props}>
    <SearchInput 
      source="q" 
      alwaysOn 
      placeholder="Rechercher..." 
      sx={{
        '& .MuiInputBase-root': {
          height: 60,
        },
        minWidth: 300, 
      }}
    />
    <ReferenceInput source="eventId" reference="events" sx={{ minWidth: 200 }}>
      <SelectInput optionText="title" sx={{ minWidth: 200 }} />
    </ReferenceInput>
    <ReferenceInput source="roomId" reference="rooms" sx={{ minWidth: 200 }}>
      <SelectInput optionText="name" sx={{ minWidth: 200 }} />
    </ReferenceInput>
    <ReferenceInput source="speakerId" reference="speakers" sx={{ minWidth: 200 }}>
      <SelectInput optionText="fullName" sx={{ minWidth: 200 }} />
    </ReferenceInput>
  </Filter>
);

export const SessionsList = (props: any) => (
  <List {...props} perPage={25} filters={<SessionsFilter />}>
    <Datagrid rowClick="edit">
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
      <TextInput source="title" style={{ width: "100%" }} />
      <TextInput source="description" multiline style={{ width: "100%" }} />
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
  <Create {...props} redirect="list">
    <SimpleForm>
      <TextInput source="title" style={{ width: "100%" }} />
      <TextInput source="description" multiline style={{ width: "100%" }} />
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
