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

function getModhash(cookie: string) {
    return fetch(
        "https://reddit.com/api/me.json",
        {headers: {Cookie: cookie}}
    ).
    then((r) => r.json()).
    then((j: any) => j.data.modhash).
    catch(r => {
        console.error("couldn't me", r);
        throw r;
    });
}

function waitToPlace(savefile: string): Promise<null> {
    return fs.exists(savefile).
    then((exists) => {
        if(!exists) return;
        return fs.readFile(savefile).then((contents) => JSON.parse(contents.toString())).
        then((data) => console.log(data.wait_time));
    });
}

function saveWaitTime(savefile: string, data: string) {
    return fs.writeFile(savefile, data);
}

function place(x: number, y: number, color: number, user: User) {
    const form = new FormData();
    form.append("x", x);
    form.append("y", y);
    form.append("color", color);
    return getModhash(user.cookie).
    then((modhash: string) => fetch("https://www.reddit.com/api/place/draw.json", {
        method: "POST",
        headers: {
            "X-Modhash": modhash,
            "Cookie": user.cookie
        },
        body: form
    })).
    then((r) => r.json()).
    catch((err) => {
        console.error(err);
        throw err;
    });
}

function doPlace(x: number, y: number, color: number, user: User) {
    const savefile = `${user.username}.json`;
    return waitToPlace(savefile).
    then(() => place(x, y, color, user)).
    then((data: object) => {
        const s = JSON.stringify(data);
        console.log(s);
        return saveWaitTime(savefile, s);
    });
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
