const Config = require("./config")();
const httpServer = requireHttpServer();
const bootstrapMental = require("./loco/bootstrap");

const server = httpServer({
  bodyLimit: 104857600,
});

server.register(require("@fastify/multipart", { attachFieldsToBody: true }));

bootstrapMental(server);

server.listen(
  { port: process.env.PORT || 3000, host: "0.0.0.0" },
  (err, address) => {
    if (err) {
      console.log(err);
      process.exit(1);
    }
  }
);
