import { DataProvider, fetchUtils } from "react-admin";

const apiUrl = "/api";

const parseTotal = (res: Response, json: any) => {
  const totalHeader = res.headers.get("X-Total-Count") || res.headers.get("Content-Range");
  if (totalHeader) {
    // Content-Range might be like 'items 0-9/34' or just '0-9/34'
    const matched = totalHeader.match(/\/(\d+)$/);
    if (matched) return parseInt(matched[1], 10);
    const asNumber = parseInt(totalHeader, 10);
    if (!isNaN(asNumber)) return asNumber;
  }
  if (Array.isArray(json)) return json.length;
  return 1;
};

const raDataProvider: DataProvider = {
  getList: async (resource, params) => {
    const { page, perPage } = params.pagination || { page: 1, perPage: 10 };
    const { field, order } = params.sort || { field: "id", order: "ASC" };
    const start = (page - 1) * perPage;
    const end = page * perPage;
    const query = `?_start=${start}&_end=${end}&_sort=${field}&_order=${order}`;
    const url = `${apiUrl}/${resource}${query}`;

    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (res.status === 404) return { data: [], total: 0 };
    if (!res.ok) throw new Error(res.statusText);
    const json = await res.json();
      const items = Array.isArray(json) ? json : json?.data ?? json?.items ?? [];
      const total = json?.meta?.total ?? parseTotal(res, items);
      const data = (items || []).map((it: any, idx: number) => {
        if (it && (it.id === undefined || it.id === null)) {
          if (it._id !== undefined) return { ...it, id: it._id };
          if (it.slug !== undefined) return { ...it, id: it.slug };
          return { ...it, id: `${resource}-${idx}` };
        }
        return it;
      });
      return { data, total };
  },

  getOne: async (resource, params) => {
    const url = `${apiUrl}/${resource}/${params.id}`;
    const res = await fetch(url);
    if (res.status === 404) return { data: [], total: 0 };
    if (!res.ok) throw new Error(res.statusText);
    const json = await res.json();
    // Normalize payload to a single object
    let item: any;
    if (Array.isArray(json)) item = json[0];
    else if (json?.data && Array.isArray(json.data)) item = json.data[0];
    else if (json?.data) item = json.data;
    else item = json;

    if (item && (item.id === undefined || item.id === null)) {
      if (item._id !== undefined) item.id = item._id;
      else if (item.slug !== undefined) item.id = item.slug;
      else item.id = `${resource}-${params.id}`;
    }
    return { data: item };
  },

  getMany: async (resource, params) => {
    const query = params.ids.map((id: any) => `id=${id}`).join("&");
    const url = `${apiUrl}/${resource}?${query}`;
    const res = await fetch(url);
    if (res.status === 404) return { data: [] };
    if (!res.ok) throw new Error(res.statusText);
    const json = await res.json();
    const items = Array.isArray(json) ? json : json?.data ?? json?.items ?? [];
    const data = (items || []).map((it: any, idx: number) => {
      if (it && (it.id === undefined || it.id === null)) {
        if (it._id !== undefined) return { ...it, id: it._id };
        if (it.slug !== undefined) return { ...it, id: it.slug };
        return { ...it, id: `${resource}-${idx}` };
      }
      return it;
    });
    return { data };
  },

  getManyReference: async (resource, params) => {
    const { page, perPage } = params.pagination || { page: 1, perPage: 10 };
    const { field, order } = params.sort || { field: "id", order: "ASC" };
    const start = (page - 1) * perPage;
    const end = page * perPage;
    const query = `?${params.target}=${params.id}&_start=${start}&_end=${end}&_sort=${field}&_order=${order}`;
    const url = `${apiUrl}/${resource}${query}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(res.statusText);
    const json = await res.json();
    const items = Array.isArray(json) ? json : json?.data ?? json?.items ?? [];
    const total = json?.meta?.total ?? parseTotal(res, items);
    const data = (items || []).map((it: any, idx: number) => {
      if (it && (it.id === undefined || it.id === null)) {
        if (it._id !== undefined) return { ...it, id: it._id };
        if (it.slug !== undefined) return { ...it, id: it.slug };
        return { ...it, id: `${resource}-${idx}` };
      }
      return it;
    });
    return { data, total };
  },

  create: async (resource, params) => {
    const url = `${apiUrl}/${resource}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params.data),
    });
    if (!res.ok) throw new Error(res.statusText);
    const json = await res.json();
    return { data: json };
  },

  update: async (resource, params) => {
    const url = `${apiUrl}/${resource}/${params.id}`;
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params.data),
    });
    if (!res.ok) throw new Error(res.statusText);
    const json = await res.json();
    return { data: json };
  },

  updateMany: async (resource, params) => {
    // Fallback: send multiple update requests
    const results = await Promise.all(
      params.ids.map((id: any) =>
        fetch(`${apiUrl}/${resource}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params.data),
        }).then((r) => r.json())
      )
    );
    return { data: results.map((r) => r.id) };
  },

  delete: async (resource, params) => {
    const url = `${apiUrl}/${resource}/${params.id}`;
    const res = await fetch(url, { method: "DELETE" });
    if (!res.ok) throw new Error(res.statusText);
    const json = await res.text();
    return { data: params.previousData ?? { id: params.id } };
  },

  deleteMany: async (resource, params) => {
    await Promise.all(params.ids.map((id: any) => fetch(`${apiUrl}/${resource}/${id}`, { method: "DELETE" })));
    return { data: params.ids };
  },
};

export default raDataProvider;
