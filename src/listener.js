import * as config from "../config.js";
import { serversByGuild } from "./servers.js";
import express from "express";
import bodyParser from "body-parser";

const handlers = {
	ahelp: ahelp,
};

const app = express();
app.use(bodyParser.json());

export async function listener(eris) {
	app.get("/data", (req, res) => {
		const data = req.body;
		const url = req.originalUrl;

		//If the requests sends an invalid comms key, reject it
		if (req.query.pwd !== config.key) {
			res.status(403).send("Forbidden");
			return;
		}

		console.log(`Received the following data: ${url}`);

		const handler = handlers[req.query.type];
		handler(req.query.msg, eris, req.query.chan);

		res.status(200).send("Data received successfully");
	});

	///Listen for incoming data from the server
	const server = app.listen(config.listen_port, config.listen_host, () => {
		const host = server.address().address;
		const port = server.address().port;
		console.log(`Server is listening on http://${host}:${port}`);
	});
}

function ahelp(msg, eris, chan) {
	serversByGuild[config.guild_id].ahelp(msg, eris, chan);
}
