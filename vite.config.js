import { defineConfig } from "vite";
import * as path from "path";

const root = path.resolve(__dirname, "src");
const outDir = path.resolve(__dirname, "dist");

const middleware = () => {
    return {
        name: "middleware",
        apply: "serve",
        configureServer(viteDevServer) {
            return () => {
                viteDevServer.middlewares.use(async (req, res, next) => {
                    if (req.originalUrl !== "/" && !req.originalUrl.includes(".")) {
                        req.url = req.originalUrl + "/index.html";
                        console.log(req.originalUrl);
                    }

                    next();
                });
            };
        },
    };
};

export default defineConfig({
    plugins: [middleware()],
    root,
    publicDir: "../public",
    server: {
        open: "./index.html",
        cors: true,
    },
    build: {
        outDir,
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, "src/index.html"),
                join: path.resolve(__dirname, "src/join/index.html"),
                newProject: path.resolve(__dirname, "src/new-project/index.html"),
                project: path.resolve(__dirname, "src/project/index.html"),
            },
        },
    },
});
