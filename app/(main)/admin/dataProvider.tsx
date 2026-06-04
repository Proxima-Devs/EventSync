import { DataProvider, fetchUtils } from 'react-admin';

const apiUrl = '/api';

const dataProvider: DataProvider = {
  getList: async (resource, params) => {
    const page = params.pagination?.page ?? 1;
    const perPage = params.pagination?.perPage ?? 20;
    const url = `${apiUrl}/${resource}?page=${page}&perPage=${perPage}`;
    const { json } = await fetchUtils.fetchJson(url);

    const data = Array.isArray(json) ? json : (json.data ?? []);
    const total = json.meta?.total ?? json.total ?? data.length;

    return { data, total };
  },

  getOne: async (resource, params) => {
    const { json } = await fetchUtils.fetchJson(`${apiUrl}/${resource}/${params.id}`);
    return { data: json };
  },

  create: async (resource, params) => {
    const { json } = await fetchUtils.fetchJson(`${apiUrl}/${resource}`, {
      method: 'POST',
      body: JSON.stringify(params.data),
    });
    return { data: json };
  },

  update: async (resource, params) => {
    const { json } = await fetchUtils.fetchJson(`${apiUrl}/${resource}/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    });
    return { data: json };
  },

  delete: async (resource, params) => {
    const { json } = await fetchUtils.fetchJson(`${apiUrl}/${resource}/${params.id}`, {
      method: 'DELETE',
    });
    return { data: json ?? { id: params.id } };
  },

  getMany: async (resource, params) => {
    const data = await Promise.all(
      params.ids.map(id =>
        fetchUtils.fetchJson(`${apiUrl}/${resource}/${id}`).then(r => r.json)
      )
    );
    return { data };
  },

  getManyReference: async (resource, params) => {
    const { json } = await fetchUtils.fetchJson(`${apiUrl}/${resource}`);
    const data = Array.isArray(json) ? json : (json.data ?? []);
    return { data, total: data.length };
  },

  updateMany: async () => ({ data: [] }),
  deleteMany: async () => ({ data: [] }),
};

export default dataProvider;