const channelEl = document.getElementById("channel");
const counterEl = document.getElementById("counter");
const scoreEl = document.getElementById("score");
const timeEL = document.getElementById("time");
const infoTextEl = document.getElementById("info-text");
const mainEl = document.getElementById("main");
const btnEl = document.getElementById("start-button");

let timer = null;
let started = false;
let timerValue = 60;
let users = [];
let movieList = [];
let animationTimer = null;

const params = (new URL(document.location)).searchParams;
const channel = params.get("channel") || null;

document.addEventListener('DOMContentLoaded', function() {
    particlesJS.load('particles-js', './particlesjs-config.json', function() {
        console.log('callback - particles.js config loaded');
    });
});

if (channel) {
    channelEl.innerHTML = `Нажмите на кнопку, чтобы начать голование в чате канала «${channel}».<br>
                           Или измените название канала в URL-адресе.`;
    btnEl.disabled = false;
    ComfyJS.Init(channel);
} else {
    channelEl.innerHTML = 'Не указан twitch канал!!! К текущей ссылке добавьте ?channel=НАЗВАНИЕ_КАНАЛА';
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
                            Напишите «Фильм: [название фильма]» для голосования.<br>`;
    started = true;

    timer = setInterval(onTimer, 1000);
    timerToTime();
}

function messageHandler(user, message) {
    if (!started) {
        return;
    }

    // if (users.includes(user)) {
    //     return;
    // }

    if (message.toLowerCase().startsWith("фильм: ")) {
        let movieTitle = message.substring(7).trim();

        if (!movieList.includes(movieTitle)) {
            movieList.push(movieTitle);
            showNewVote(user, movieTitle);
            users.push(user);
            counterEl.innerText = users.length;
        }
    }
}

function stop() {
    try { clearInterval(timer); } catch {}

    btnEl.innerText = "СТАРТ";
    btnEl.style.backgroundColor = "rgb(93, 129, 93)";
    infoTextEl.innerHTML = "Голосование окончено!";
    btnEl.disabled = true;

    timeEL.style.display = "none";

    if (users.length > 0) {
        if (users.length === 1) {
            showWinnerWithFireworks(movieList[0]);
        } else {
            startAnimation();
        }
    } else {
        scoreEl.innerHTML = "Никто не проголосовал x_x";
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
    timeEL.innerText = text;
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
    }, 1800);
}

function startAnimation() {
    let counter = 0;
    let totalMovies = movieList.length;

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
    el.innerText = movieList[0];
    animationContainer.appendChild(el);

    // Начинаем анимацию фильмов
    let interval = startMovieAnimation(el, totalMovies, counter);

    // Ожидаем 5 секунд, чтобы завершить анимацию, и показываем победителя
    setTimeout(() => {
        clearInterval(interval); // Останавливаем анимацию
        showWinnerWithFireworks();
    }, 5000); // Время на анимацию (5 секунд)

    // Убираем контейнер после окончания анимации
    setTimeout(() => {
        document.body.removeChild(animationContainer);
    }, 5000);
}

// Функция для анимации смены фильмов
function startMovieAnimation(el, totalMovies, counter) {
    return setInterval(() => {
        el.innerText = movieList[counter % totalMovies];
        counter += 1;
    }, 100);
}

function showWinnerWithFireworks() {
    let winner = movieList[Math.floor(Math.random() * movieList.length)];
    let winnerEl = document.getElementById('winner');
    winnerEl.innerHTML = `Победил фильм: <b>${winner}</b>`;
    winnerEl.style.display = "block";

    // Показать Nyan Cat
    const nyanCat = document.getElementById('nyan-cat').classList.add('animate');;
    nyanCat.style.display = 'block';
    nyanCat.style.left = '0';

    // Анимация полета справа
    let position = 0;
    const interval = setInterval(() => {
        position += 5; // скорость движения
        nyanCat.style.left = position + 'px';

        // Когда Nyan Cat улетит за экран
        if (position > window.innerWidth) {
            clearInterval(interval);
            nyanCat.style.display = 'none';
        }
    }, 16); // примерно 60 fps
}
