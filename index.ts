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
    const waitTime = data.nextPlace - new Date().getTime();

    console.log(`waiting ${waitTime / 1000}`);

    const i = setInterval(() => {
        const waitTime = data.nextPlace - new Date().getTime();
        console.log(`waiting ${waitTime / 1000}`);
    }, 10000);

    await new Promise((resolve) => setTimeout(resolve, waitTime)).then(() => undefined);;

    clearInterval(i);
}

function saveWaitTime(savefile: string, wait_seconds: number) {
    const nextPlace = new Date(new Date().getTime() + wait_seconds * 1000).getTime();
    const fileContents = JSON.stringify({nextPlace});
    return fs.writeFile(savefile, fileContents);
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
    return saveWaitTime(savefile, (data as any).wait_seconds);
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
