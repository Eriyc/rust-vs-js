import fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";

dotenv.config();

const setupServer = async () => {
  const app = fastify({ logger: true });
  await app.register(cors);

  const timer = app
    .addHook("onRequest", async (request, reply) => {
      // @ts-expect-error
      request.start = performance.now();
    })
    .addHook("onSend", async (request, reply, payload) => {
      // @ts-expect-error
      const time = performance.now() - request.start;
      reply.header("X-Response-Time", `${time}ms`);
    });

  app.route({
    method: "GET",
    url: "/fibonacci",
    handler: async (request, reply) => {
      // first 500 fibonacci numbers
      const fib = [0, 1];
      for (let i = 2; i < 500; i++) {
        fib[i] = fib[i - 2] + fib[i - 1];
      }

      return { fib };
    },
  });

  return app;
};

const start = async () => {
  const app = await setupServer();

  try {
    await app.listen({
      port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
    });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
