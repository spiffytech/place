import * as FormData from "form-data";
import {fs} from "mz";
import fetch from "node-fetch";
import {client as WSClient} from "websocket";

interface Message {
    type: "place";
    payload: {
        x: number;
        y: number;
        color: number;
        author: string;
    }
}

const client = new WSClient();
client.on("connect", (connection) => {
    connection.on("message", (message) => {
        const data: Message = JSON.parse(message.utf8Data);
        if (data.type !== "place")
        console.log(message);
    })
});

async function getModhash(cookie: string) {
    const response = await fetch(
        "https://reddit.com/api/me.json",
        {headers: {Cookie: cookie}}
    );
    const json = await response.json();
    return json.data.modhash;
}

async function waitToPlace(savefile: string): Promise<void> {
    const exists = await fs.exists(savefile);

    if(!exists) return;
    const contents = await fs.readFile(savefile)
    const data = JSON.parse(contents.toString());
    const waitTime = data.wait_seconds * 1000;
    console.log(`waiting ${waitTime}`);
    return new Promise((resolve) => setTimeout(resolve, waitTime)).then(() => undefined);;
}

function saveWaitTime(savefile: string, data: string) {
    return fs.writeFile(savefile, data);
}

async function place(x: number, y: number, color: number, user: User) {
    const form = new FormData();
    form.append("x", x);
    form.append("y", y);
    form.append("color", color);

    const modhash = await getModhash(user.cookie);
    const response = await fetch("https://www.reddit.com/api/place/draw.json", {
        method: "POST",
        headers: {
            "X-Modhash": modhash,
            "Cookie": user.cookie
        },
        body: form
    });

    return await response.json();
}

async function doPlace(x: number, y: number, color: number, user: User) {
    const savefile = `${user.username}.json`;
    await waitToPlace(savefile);
    const data: object = await place(x, y, color, user);

    const s = JSON.stringify(data);
    console.log(s);
    return saveWaitTime(savefile, s);
}

interface User {
    username: string;
    cookie: string;
}

const users: {[key: string]: User} = {

}

Promise.all([
]).then(() => console.log("done"));

//client.connect("wss://");
