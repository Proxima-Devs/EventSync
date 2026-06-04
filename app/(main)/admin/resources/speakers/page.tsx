import {
  List, Datagrid, TextField, ImageField,
  Create, Edit, SimpleForm, TextInput,NumberField
} from 'react-admin';

const SpeakerForm = () => (
  <SimpleForm>
    <TextInput source="fullName" label="Nom complet" required />
    <TextInput source="photo" label="Photo (URL)" />
    <TextInput source="bio" label="Bio" multiline />
    <TextInput source="links.twitter" label="Twitter" />
    <TextInput source="links.linkedin" label="LinkedIn" />
    <TextInput source="links.website" label="Site web" />
    <TextInput source="links.github" label="GitHub" />
  </SimpleForm>
);

export const SpeakerList = () => (
  <List>
    <Datagrid rowClick="edit">
      <ImageField source="photo" label="Photo" />
      <TextField source="fullName" label="Nom" />
      <TextField source="bio" label="Bio" />
      <NumberField source="_count.sessions" label="Sessions" />
    </Datagrid>
  </List>
);

export const SpeakerCreate = () => <Create><SpeakerForm /></Create>;
export const SpeakerEdit = () => <Edit><SpeakerForm /></Edit>;