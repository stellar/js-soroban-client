import axios from "./axios";
import { hasOwnProperty } from "./utils";

export type Id = string | number;

export interface Request<T> {
  jsonrpc: "2.0";
  id: Id;
  method: string;
  params: T;
}

export interface Notification<T> {
  jsonrpc: "2.0";
  method: string;
  params?: T;
}

export type Response<T, E = any> = {
  jsonrpc: "2.0";
  id: Id;
} & ({ error: Error<E> } | { result: T });

export interface Error<E = any> {
  code: number;
  message?: string;
  data?: E;
}

export async function post<T>(
  url: string,
  method: string,
  ...params: any
): Promise<T> {
  let jsonParams = params;
  if (
    params.length === 1 &&
    typeof params[0] === "object" && params[0] !== null
  ) {
    // if only one param and it's a js object, then pass the object.
    // otherwise rpc server throws unmarshal error on jsonrpc params.
    jsonParams = params[0];
  }
  const response = await axios.post<Response<T>>(url, {
    jsonrpc: "2.0",
    // TODO: Generate a unique request id
    id: 1,
    method,
    params: jsonParams,
  });
  if (hasOwnProperty(response.data, "error")) {
    throw response.data.error;
  } else {
    return response.data?.result;
  }
}
