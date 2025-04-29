const channelEl = document.getElementById("channel");
const counterEl = document.getElementById("counter");
const scoreEl = document.getElementById("score");
const timeEL = document.getElementById("time");
const infoTextEl = document.getElementById("info-text");
const mainEl = document.getElementById("main");
const btnEl = document.getElementById("start-button");

let timer = null;
let animationTimer = null;
let started = false;
let timerValue = 60;

let users = [];
let movieList = [];
let movieTitleCache = {};

const channel = new URLSearchParams(document.location.search).get("channel");

document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
});

document.addEventListener('DOMContentLoaded', function() {
    particlesJS.load('particles-js', './particlesjs-config.json', function() {
        console.log('callback - particles.js config loaded');
    });
});

initChannel();


function initChannel() {
    if (channel) {
        channelEl.innerHTML = `
            Нажмите на кнопку, чтобы начать голование в чате twitch-канала
            «${channel}».<br>Или измените название канала в URL-адресе.
        `;

        btnEl.disabled = false;
        ComfyJS.Init(channel);
    } else {
        channelEl.innerHTML = `
            Не указан twitch канал! К текущей ссылке добавьте «?channel=название_канала»
        `;
    }
}

function start() {
    if (started) {
        stop();
        return;
    }

    if (channelEl) {
        channelEl.style.display = "none";
    }

    mainEl.style.visibility = "visible";
    btnEl.innerText = "СТОП";
    btnEl.style.backgroundColor = "rgb(129, 93, 93)";

    infoTextEl.innerHTML = `Голосование в чате «${channel}»!<br>
                            Напишите ID фильма с сайта «Кинопоиск»<br>`;

    started = true;
    timer = setInterval(onTimer, 1000);
    timerToTime();
}

function stop() {
    try { clearInterval(timer); } catch {}

    btnEl.innerText = "СТАРТ";
    btnEl.style.backgroundColor = "rgb(93, 129, 93)";
    infoTextEl.innerHTML = "Голосование окончено!";
    btnEl.disabled = true;

    timeEL.style.display = "none";

    if (users.length > 0) {
        if (movieList.length === 1) {
            showWinner(movieList[0]);
        } else {
            startAnimation();
        }
    } else {
        scoreEl.innerHTML = "Никто не проголосовал x_x";
    }

    started = false;
}

async function messageHandler(user, message) {
    if (!started) {
        return;
    }

    if (users.includes(user)) {
        return;
    }

    const cleanMessage = message.trim();

    if (/^[\d\s]+$/.test(cleanMessage)) {
        const movieId = cleanMessage;
        const movieTitle = await fetchMovieTitle(movieId);

        if (!movieTitle) {
            return;
        }

        movieList.push(movieId);
        showNewVote(user, movieTitle);
        users.push(user);
        counterEl.innerText = users.length;
    }
}

function showNewVote(user, movieTitle) {
    let el = document.createElement("div");
    el.className = "new-vote";
    el.innerText = `${user} предложил фильм: ${movieTitle}`;

    let y = Math.floor(Math.random() * (window.innerHeight / 3 * 2)) + 100;
    let x = Math.floor(Math.random() * (window.innerWidth / 3 * 2)) + 80;

    el.style.top = `${y}px`;
    el.style.left = `${x}px`;

    document.body.appendChild(el);

    setTimeout(() => {
        document.body.removeChild(el);
    }, 1500);
}

/**
 * Показывает быструю анимацию с названиями фильмов, поочередно отображая их.
**/
async function startAnimation() {
    let counter = 0;
    const uniqueMovieIds = [...new Set(movieList)];
    const titles = await Promise.all(uniqueMovieIds.map(fetchMovieTitle));

    // Создаем контейнер для анимации
    let animationContainer = document.createElement("div");
    animationContainer.style.position = "absolute";
    animationContainer.style.top = "50%";
    animationContainer.style.left = "50%";
    animationContainer.style.transform = "translate(-50%, -50%)";
    animationContainer.style.whiteSpace = "nowrap";
    animationContainer.style.fontSize = "60pt";
    animationContainer.style.fontWeight = "bold";
    animationContainer.style.display = "flex";
    animationContainer.style.justifyContent = "center";
    animationContainer.style.alignItems = "center";
    animationContainer.style.userSelect = "none";
    document.body.appendChild(animationContainer);

    // Начальное отображение первого фильма
    let el = document.createElement("span");
    el.className = "movie-item";
    el.innerText = truncateTitle(titles[0]);
    animationContainer.appendChild(el);

    let interval = setInterval(() => {
        el.innerText = truncateTitle(titles[counter % titles.length]);
        counter++;
    }, 100);

    // Ожидаем 5 секунд, чтобы завершить анимацию, и показываем победителя
    setTimeout(() => {
        clearInterval(interval);
        showWinner();
    }, 5000);

    // Убираем контейнер после окончания анимации
    setTimeout(() => {
        document.body.removeChild(animationContainer);
    }, 5000);
}

/**
 * Возвращает ID победившего фильма, учитывая количество голосов.
 * Чем больше голосов у фильма, тем выше шанс его выбора.
**/
function getWeightedWinner() {
    const counts = {};

    for (const movie of movieList) {
        counts[movie] = (counts[movie] || 0) + 1;
    }

    const weightedList = [];

    for (const [movie, count] of Object.entries(counts)) {
        for (let i = 0; i < count; i++) {
            weightedList.push(movie);
        }
    }

    const winner = weightedList[Math.floor(Math.random() * weightedList.length)];
    return winner;
}

/**
 * Показывает победителя голосования.
**/
async function showWinner() {
    let winnerId = getWeightedWinner();
    let winnerTitle = await fetchMovieTitle(winnerId);
    let winnerEl = document.getElementById('winner');
    winnerEl.innerHTML = `EZ для «<b>${truncateTitle(winnerTitle)}</b>»`;
    winnerEl.style.display = "block";

    const nyanCat = document.getElementById('nyan-cat').classList.add('animate');
    nyanCat.style.display = 'block';
    nyanCat.style.left = '0';

    let position = 0;
    const interval = setInterval(() => {
        position += 5;
        nyanCat.style.left = position + 'px';

        if (position > window.innerWidth) {
            clearInterval(interval);
            nyanCat.style.display = 'none';
        }
    }, 16);
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
    timeEL.innerText = text;
}

function truncateTitle(title, maxLength = 30) {
    return title.length > maxLength ? title.slice(0, maxLength - 3) + "..." : title;
}

/**
 * Функция для получения названия фильма по его ID
 * с помощью «Kinopoisk API Unofficial».
**/
async function fetchMovieTitle(id) {
    if (movieTitleCache[id]) {
        return movieTitleCache[id];
    }

    try {
        const res = await fetch(`https://kinopoiskapiunofficial.tech/api/v2.2/films/${id}`, {
            method: "GET",
            headers: {
                "X-API-KEY": "0b5e9b54-b226-4f62-a12b-d48a095e7f38",
                "Content-Type": "application/json",
            }
        });

        if (res.status === 404) {
            return null;
        }

        const data = await res.json();
        const title = data?.nameRu || `${id}`;
        movieTitleCache[id] = title;
        return title;
    } catch (e) {
        return `${id}`;
    }
}
