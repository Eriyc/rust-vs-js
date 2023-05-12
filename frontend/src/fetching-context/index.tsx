import {
  Accessor,
  ParentProps,
  createContext,
  createEffect,
  createSignal,
  useContext,
} from "solid-js";

type Result = {
  status: "loading" | "success" | "error";
  data: any;
  error: any;
  language: string;
};

type Queries = {
  [key: string]: {
    [key: string]: Result;
  };
};

type AddQuery = (url: string, language: string) => void;
type UpdateQuery = (
  url: string,
  language: string,
  data: any,
  error: any
) => void;

const FetchingContext =
  createContext<[Accessor<Queries>, AddQuery, UpdateQuery]>();

export const FetchingProvider = (props: ParentProps) => {
  const [queries, setQueries] = createSignal<Queries>({});

  const addQuery = (url: string, language: string) => {
    setQueries((queries) => ({
      ...queries,
      [url]: {
        ...queries[url],
        [language]: {
          status: "loading",
          data: null,
          error: null,
          language,
        },
      },
    }));
  };

  const updateQuery = (
    url: string,
    language: string,
    data: any,
    error: any
  ) => {
    setQueries((queries) => ({
      ...queries,
      [url]: {
        ...queries[url],
        [language]: {
          language: language,
          status: error ? "error" : "success",
          data,
          error,
        },
      },
    }));
  };

  return (
    <FetchingContext.Provider value={[queries, addQuery, updateQuery]}>
      {props.children}
    </FetchingContext.Provider>
  );
};
export enum Backends {
  Node = "http://localhost:5000",
  Rust = "http://localhost:5001",
}

export const useFetch = <T,>(url: string, init?: RequestInit) => {
  const context = useContext(FetchingContext);
  if (!context)
    throw new Error("useFetch must be used within a FetchingProvider");

  const [queries, addQuery, updateQuery] = context;
  const backends = Object.keys(Backends) as Array<keyof typeof Backends>;

  backends.forEach((backend) => {
    addQuery(url, backend);
  });

  createEffect(() => console.log(queries()[url]));

  const execute = async () => {
    // fetch twice for both rust and node backend
    const promises = backends.map(async (backend) => {
      const result = await fetch(`${Backends[backend]}${url}`, init);
      const { data } = await result.json();

      updateQuery(url, backend, data, null);
    });

    // run both concurrently
    Promise.all(promises);
  };

  return { status, execute, result: () => queries()[url] };
};
