"use client";
import * as React from "react";
import { Admin, Resource, ListGuesser, EditGuesser } from "react-admin";
import raDataProvider from "@/lib/raDataProvider";

const AdminApp = () => (
  <div style={{ height: "100vh" }}>
    <Admin dataProvider={raDataProvider}>
      <Resource name="events" list={ListGuesser} edit={EditGuesser} />
      <Resource name="speakers" list={ListGuesser} edit={EditGuesser} />
      <Resource name="sessions" list={ListGuesser} edit={EditGuesser} />
      <Resource name="rooms" list={ListGuesser} edit={EditGuesser} />
      <Resource name="questions" list={ListGuesser} edit={EditGuesser} />
    </Admin>
  </div>
);

export default AdminApp;
