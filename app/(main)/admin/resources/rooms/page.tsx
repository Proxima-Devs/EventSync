import {
  List, Datagrid, TextField, NumberField,
  Create, Edit, SimpleForm, TextInput,
} from 'react-admin';

const RoomForm = () => (
  <SimpleForm>
    <TextInput source="name" label="Nom" required />
  </SimpleForm>
);

export const RoomList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="name" label="Nom" />
      <NumberField source="_count.sessions" label="Sessions" />
    </Datagrid>
  </List>
);

export const RoomCreate = () => <Create><RoomForm /></Create>;
export const RoomEdit = () => <Edit><RoomForm /></Edit>;