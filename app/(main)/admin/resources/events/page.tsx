import {
  List, Datagrid, TextField, DateField,
  Create, Edit, SimpleForm, TextInput, DateTimeInput,
  EditButton, ShowButton,
} from 'react-admin';

const EventForm = () => (
  <SimpleForm>
    <TextInput source="title" label="Titre" required />
    <TextInput source="description" label="Description" multiline />
    <DateTimeInput source="startDate" label="Début" required />
    <DateTimeInput source="endDate" label="Fin" required />
    <TextInput source="location" label="Lieu" />
    <TextInput source="coverImage" label="Image de couverture" />
  </SimpleForm>
);

export const EventList = () => (
  <List>
    <Datagrid rowClick={false}>
      <TextField source="title" label="Titre" />
      <TextField source="location" label="Lieu" />
      <DateField source="startDate" label="Début" showTime />
      <DateField source="endDate" label="Fin" showTime />
      <EditButton />
      <ShowButton
        label="Gérer sessions"
        icon={<span>⚙️</span>}
        component="a"
        href={(record: { slug: string }) => `/admin/events/${record.slug}`}
      />
    </Datagrid>
  </List>
);

export const EventCreate = () => <Create><EventForm /></Create>;
export const EventEdit = () => <Edit><EventForm /></Edit>;