"use client";
import * as React from "react";
import { Admin, Resource, ListGuesser, EditGuesser } from "react-admin";
import raDataProvider from "@/lib/raDataProvider";
import {
  EventsList,
  EventsEdit,
  EventsCreate,
} from "./adminResources/Events";
import {
  SpeakersList,
  SpeakersEdit,
  SpeakersCreate,
} from "./adminResources/Speakers";
import { RoomsList, RoomsEdit, RoomsCreate } from "./adminResources/Rooms";
import {
  SessionsList,
  SessionsEdit,
  SessionsCreate,
} from "./adminResources/Sessions";
import {
  QuestionsList,
  QuestionsEdit,
  QuestionsCreate,
} from "./adminResources/Questions";

const AdminApp = () => (
  <div style={{ height: "100vh" }}>
    <Admin dataProvider={raDataProvider}>
      <Resource name="events" list={EventsList} edit={EventsEdit} create={EventsCreate} />
      <Resource name="speakers" list={SpeakersList} edit={SpeakersEdit} create={SpeakersCreate} />
      <Resource name="sessions" list={SessionsList} edit={SessionsEdit} create={SessionsCreate} />
      <Resource name="rooms" list={RoomsList} edit={RoomsEdit} create={RoomsCreate} />
      <Resource name="questions" list={QuestionsList} edit={QuestionsEdit} create={QuestionsCreate} />
    </Admin>
  </div>
);

export default AdminApp;
