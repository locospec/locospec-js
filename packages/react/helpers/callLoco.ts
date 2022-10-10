import { axiosObject } from "./axios";

function callLoco(
  routePrefix: string,
  resource: string,
  action: string,
  payload: any = {}
) {
  return new Promise((resolve, reject) => {
    let uri = `/${routePrefix}/resource/${resource}/${action}`;

    // console.log("payload", payload);

    payload["apiConfig"] = {};

    if (action === "_read" || action === "_create" || action === "_update") {
      payload["apiConfig"]["includeRelations"] = "*";
      payload["apiConfig"]["includeMutations"] = "*";
    }

    // console.log("uri", uri, payload);

    axiosObject
      .post(uri, payload)
      .then((response) => {
        resolve(response.data);
      })
      .catch((errors) => {
        if (errors.response.status === 422) {
          reject(errors.response.data.errors);
        }

        reject(errors);
      });
  });
}

async function getByUuid(routePrefix: string, resource: string, uuid: string) {
  const response: any = await callLoco(routePrefix, resource, `_read`, {
    filterBy: [
      {
        attribute: "uuid",
        op: "eq",
        value: uuid,
      },
    ],
  });

  return response?.data[0];
}

async function createFile(
  routePrefix: string,
  resource: string,
  file: any,
  params = {}
) {
  return new Promise((resolve, reject) => {
    const action = "_create";

    let uri = `/${routePrefix}/resource/${resource}/${action}`;

    let formData = new FormData();
    formData.append("file", file);

    axiosObject
      .post(uri, formData, {
        params: params,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((e) => {
        reject(e);
      });
  });
}

export { callLoco, getByUuid, createFile };
