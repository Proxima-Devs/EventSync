"use client";

import { Admin, Resource } from 'react-admin';
import dataProvider from '../dataProvider';
import { darkCyanTheme } from '../adminTheme';
import { EventList, EventCreate, EventEdit } from '../resources/events';
import { RoomList, RoomCreate, RoomEdit } from '../resources/rooms';
import { SpeakerList, SpeakerCreate, SpeakerEdit } from '../resources/speakers';
import DashboardPage from '../dashboard/page';

export default function ReactAdminPage() {
  return (
    <Admin
      dataProvider={dataProvider}
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