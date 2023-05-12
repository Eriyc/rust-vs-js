import { createEffect } from "solid-js";
import { Backends, useFetch } from "../fetching-context";

const TestComponent = ({ backend }: { backend: "Rust" | "Node" }) => {
  const { execute, status, result } = useFetch(`/fibonacci`, { method: "GET" });

  const handleClick = execute;

  const data = () => result()[backend];

  createEffect(() => {
    console.log(backend, result());
  });

  return (
    <section>
      {status}
      <button onClick={handleClick}>Calculate fibonacci</button>
    </section>
  );
};

export default TestComponent;
