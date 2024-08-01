const channelEl = document.getElementById("channel");
const counterEl = document.getElementById("counter");
const scoreEl = document.getElementById("score");
const infoTextEl = document.getElementById("info-text");
const mainEl = document.getElementById("main");
const btnEl = document.getElementById("start-button");

let timer = null;
let started = false;
let timerValue = 60;
let users = [];
let yesCount = 0;
let noCount = 0;

const params = (new URL(document.location)).searchParams;
const channel = params.get("channel") || null;

if (channel) {
    channelEl.parentNode.removeChild(channelEl);
    btnEl.disabled = false;
    ComfyJS.Init(channel);
}

function start() {

    if (started) {
        stop();
        return;
    }
    mainEl.style.visibility = "visible";
    btnEl.innerText = "СТОП";
    btnEl.style.backgroundColor = "rgb(129, 93, 93)";

    infoTextEl.innerHTML = `Голосование в чате ${channel}!<br>Напишите 'да' или 'нет'<br>`;
    started = true;

    timer = setInterval(onTimer, 1000);
    timerToTime();
}

function messageHandler(user, message) {
    if (!started) {
        return;
    }

    if (users.includes(user)) {
        return;
    }

    let answer = message.trim();

    if (answer.toLowerCase() === "да") {
        yesCount++;
    } else if (answer.toLowerCase() === "нет") {
        noCount++;
    } else {
        return;
    }

    users.push(user);
    counterEl.innerText = users.length;
    showNewVote(user, answer);
}

function stop() {
    try { clearInterval(timer); } catch {}

    btnEl.innerText = "СТАРТ";
    btnEl.style.backgroundColor = "rgb(93, 129, 93)";
    infoTextEl.innerHTML = "Голосование окончено!";
    btnEl.disabled = true;

    if (users.length > 0) {
        let totalVotes = yesCount + noCount;
        let yesPercent = (yesCount / totalVotes * 100).toFixed(2);
        let noPercent = (noCount / totalVotes * 100).toFixed(2);

        let text;
        if (yesPercent > noPercent) {
            text = `<span style="color: green;">Да - ${yesPercent}%</span>`;
        } else if (noPercent > yesPercent) {
            text = `<span style="color: red;">Нет - ${noPercent}%</span>`;
        } else {
            text = `Ничья!<br>Да - 50%, Нет - 50%`;
        }
        scoreEl.innerHTML = text;
    } else {
        scoreEl.innerText = "Никто не проголосовал :(";
    }
    started = false;
}

function onTimer() {
    timerValue -= 1;

    if (timerValue > 0) {
        timerToTime();
    } else {
        stop();
    }
}

function timerToTime() {
    let minutes = Math.floor(timerValue / 60);
    let seconds = timerValue % 60;

    minutes = minutes.toString().padStart(2, "0");
    seconds = seconds.toString().padStart(2, "0");

    let text = `${minutes}:${seconds}`;
    scoreEl.innerText = text;
}

function showNewVote(user, answer) {
    let el = document.createElement("div");
    el.className = "new-vote";
    el.innerText = `${user} - ${answer}`;

    let y = Math.floor(Math.random() * (window.innerHeight / 3 * 2)) + 100;
    let x = Math.floor(Math.random() * (window.innerWidth / 3 * 2)) + 80;

    el.style.top = `${y}px`;
    el.style.left = `${x}px`;
    el.style.color = answer.toLowerCase() === "да" ? "green" : "red";

    document.body.appendChild(el);

    setTimeout(() => {
        document.body.removeChild(el);
    }, 1000);
}