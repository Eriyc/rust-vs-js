import type { Component } from "solid-js";

import styles from "./App.module.css";
import clsx from "clsx";
import { Backends, FetchingProvider } from "./fetching-context";
import TestComponent from "./components/test";

const App: Component = () => {
  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <h1>Backend comparison</h1>
      </header>
      <FetchingProvider>
        <main class={clsx(styles.main)}>
          <section class={clsx(styles.section, styles.node)}>
            <h2>Node.js</h2>
            <TestComponent backend={Backends.Node} />
          </section>
          <section class={clsx(styles.section, styles.rust)}>
            <h2>Rust</h2>
            <TestComponent backend={Backends.Rust} />
          </section>
        </main>
      </FetchingProvider>
    </div>
  );
};

export default App;
