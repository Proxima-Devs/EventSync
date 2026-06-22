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
  Create,
  EditButton,
  DeleteButton,
  BooleanField,
  BooleanInput,
  NumberField,
  ReferenceInput,
  SelectInput,
} from "react-admin";

export const QuestionsList = (props: any) => (
  <List {...props} perPage={25}>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="content" />
      <ReferenceField source="sessionId" reference="sessions">
        <TextField source="title" />
      </ReferenceField>
      <NumberField source="upvotes" />
      <BooleanField source="isHidden" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const QuestionsEdit = (props: any) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="content" multiline fullWidth />
      <TextInput source="authorName" fullWidth />
      <BooleanInput source="isHidden" />
    </SimpleForm>
  </Edit>
);

export const QuestionsCreate = (props: any) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="content" multiline fullWidth />
      <TextInput source="authorName" fullWidth />
      <ReferenceInput source="sessionId" reference="sessions">
        <SelectInput optionText="title" />
      </ReferenceInput>
    </SimpleForm>
  </Create>
);

export default QuestionsList;
