import { Router } from "express";
import auth from "./auth";
import email from "./email";
import oAuth from "./oAuth";
import post from "./post";
import upload from "./upload";
import visitor from "./visitor";

const routes = Router();

routes.use("/auth", auth);
routes.use("/email", email);
routes.use("/oauth", oAuth);
routes.use("/posts", post);
routes.use("/upload", upload);
routes.use("/visitors", visitor);

export default routes;
