"use client";

import { Admin, Resource, AuthProvider } from 'react-admin';
import dataProvider from '../dataProvider';
import { darkCyanTheme } from '../adminTheme';
import { EventList, EventCreate, EventEdit } from '../resources/events/page';
import { RoomList, RoomCreate, RoomEdit } from '../resources/rooms/page';
import { SpeakerList, SpeakerCreate, SpeakerEdit } from '../resources/speakers/page';
import DashboardPage from '../dashboard/page';


const authProvider: AuthProvider = {
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  checkAuth: () => Promise.resolve(),     
  checkError: () => Promise.resolve(),
  getPermissions: () => Promise.resolve(),
};

export default function ReactAdminPage() {
  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      theme={darkCyanTheme}
      dashboard={DashboardPage}
      basename="/admin/react"
    >
      <Resource
        name="events"
        list={EventList}
        create={EventCreate}
        edit={EventEdit}
      />
      <Resource
        name="rooms"
        list={RoomList}
        create={RoomCreate}
        edit={RoomEdit}
      />
      <Resource
        name="speakers"
        list={SpeakerList}
        create={SpeakerCreate}
        edit={SpeakerEdit}
      />
    </Admin>
  );
}