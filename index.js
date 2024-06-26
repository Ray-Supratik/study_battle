import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database
const supabase = createClient(
  "https://cqgxebrrruqnqqiozkdh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxZ3hlYnJycnVxbnFxaW96a2RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg1MDg3MTksImV4cCI6MjAzNDA4NDcxOX0.eV_VC1PFko-uM6jcjWrxMUaMIyCw4IOWDsAcXW8QkDM"
);
//time fields
const hoursSpan = document.getElementById("hoursSpan");
const minutesSpan = document.getElementById("minutesSpan");
const secondsSpan = document.getElementById("secondsSpan");
const totalTimeContainer = document.querySelector(".total-time-container");

//user Data
let user = {};
let listData;
//total fields
const total_hrs = document.querySelector(".total-hours");
const total_mins = document.querySelector(".total-mins");
const total_secs = document.querySelector(".total-secs");
//button fields
const startBttn = document.getElementById("start");
const pauseBttn = document.getElementById("pause");
const resetBttn = document.getElementById("reset");

//form bttns
const login = document.getElementById("loginBttn");
const signUp = document.getElementById("signUpBttn");
const modal = document.querySelector(".modal");
const main = document.querySelector("main");
const noticeText = document.querySelector(".notice");
//other variables
let time = 0;
let totalTime = 0;
let timer;
let isRunning = false;
let update;
let online = [];
let total = false;
const playerList = document.querySelector(".list");
const totalFilter = document.querySelector(".totalTime");
const todayFilter = document.querySelector(".today");
checkDeviceAndRedirect();

//updates the timer in the UI based on time every second
function updateTimer() {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;
  hoursSpan.textContent = hours.toString().padStart(2, "0");
  minutesSpan.textContent = minutes.toString().padStart(2, "0");
  secondsSpan.textContent = seconds.toString().padStart(2, "0");
}

//removes the signin modal and displays the UI
function displayUI() {
  modal.style.display = "none";
  main.classList.remove("hide");
}

//sorts data based on the time in descending order
function sortData(data) {
  if (total) {
    return data.sort((a, b) => b.totaltime - a.totaltime);
  } else {
    return data.sort((a, b) => b.time - a.time);
  }
}

//calculates hr,minutes and second from seconds and return it into a time object
function calculateTime(time) {
  const timeObj = {};
  timeObj.hours = Math.floor(time / 3600)
    .toString()
    .padStart(2, "0");
  timeObj.minutes = Math.floor((time % 3600) / 60)
    .toString()
    .padStart(2, "0");
  timeObj.seconds = (time % 60).toString().padStart(2, "0");

  return timeObj;
}

//inserts the data into the ranklist
function insertData(data) {
  playerList.textContent = "";

  data.forEach((e, i) => {
    const time = calculateTime(total ? e.totaltime : e.time);
    const html = `<div class="player">
                    <span class="rank">${i + 1}</span>
                    <span class="username"><span class="status" id=${
                      `id` + e.id
                    }></span>&nbsp;&nbsp;&nbsp;${e.username}</span>
                    <span class="time-container">
                    <span >${time.hours}</span>:<span ">${
      time.minutes
    }</span>:<span>${time.seconds}</span>
                </span>
                </div>`;
    playerList.insertAdjacentHTML("beforeend", html);
  });
}

//fetches entire table from supabase
async function fetchEntireData() {
  const { data } = await supabase.from("codding battle").select();
  listData = data;
}

//uploads the user time to the supabase
async function uploadTime() {
  const { error } = await supabase
    .from("codding battle")
    .update({ time: time, totaltime: totalTime })
    .eq("id", user.id);
  if (error) {
    console.log(error);
  }
}

//event listeners
startBttn.addEventListener("click", () => {
  if (!isRunning) {
    isRunning = true;
    timer = setInterval(() => {
      time++;
      totalTime++;
      updateTimer();
      ShowTotalHrs();
    }, 1000);

    update = setInterval(async () => {
      await uploadTime();
      await fetchEntireData();
      insertData(sortData(listData));
      giveStatus();
    }, 10000);
  }
});

pauseBttn.addEventListener("click", () => {
  if (isRunning) {
    isRunning = false;
    clearInterval(timer);
    clearInterval(update);
    uploadTime();
  }
});

// resetBttn.addEventListener("click", () => {
//   time = 0;
//   updateTimer();
// });

signUp.addEventListener("click", async () => {
  noticeText.textContent = "*registering, please wait.......*";
  const userName = document.getElementById("userName").value.toLowerCase();
  const pin = Number(document.getElementById("pin").value);
  if (userName !== "" && pin !== 0 && /^\d{4}$/.test(`${pin}`) === true) {
    const data = await fetchEntireData();
    const found = data.find((e) => e.username === userName && e.pin === pin);
    if (found) {
      noticeText.textContent = `*User already  registered!*`;
    } else {
      const { error } = await supabase.from("codding battle").insert({
        username: userName,
        pin: pin,
        status: false,
        time: 0,
        totaltime: 0,
      });
      if (error) {
        alert(`There is some error!😵❌`);
        console.error(error);
        noticeText.textContent = "*registration couldn't complete properly*";
      } else {
        noticeText.textContent = "*registration completed!*";
      }
    }
  } else {
    noticeText.textContent =
      "*please check if the fields are not empty and pin must be 4 digit*";
  }
});
login.addEventListener("click", async () => {
  noticeText.textContent = "*Logging in, please wait.......*";
  const userName = document.getElementById("userName").value.toLowerCase();
  const pin = Number(document.getElementById("pin").value);
  if (userName !== "" && pin !== 0 && /^\d{4}$/.test(`${pin}`) === true) {
    await fetchEntireData();
    insertData(sortData(listData));
    const found = listData.findIndex(
      (e) => e.username === userName && e.pin === pin
    );
    if (found !== -1) {
      displayUI();
      user = listData[found];
      time = user.time;
      totalTime = user.totaltime;
      ShowTotalHrs();
      updateTimer();
      trackUserStatus();
    } else {
      noticeText.textContent = "*invalid details*";
    }
  } else {
    noticeText.textContent =
      "*please check if the fields are not empty and pin must be 4 digit*";
  }
});

//status changes
function trackUserStatus() {
  const channel = supabase.channel("room1");
  //join
  channel.on("presence", { event: "join" }, ({ newPresences }) => {
    const id = newPresences[0].user_id;
    online.push(id);
    const item = document.getElementById(`id${id}`);
    item.classList.add("online");
  });
  //leave
  channel
    .on("presence", { event: "leave" }, ({ leftPresences }) => {
      const id = leftPresences[0].user_id;
      online = online.filter((e) => e !== id);
      const item = document.getElementById(`id${id}`);
      item.classList.remove("online");
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          user_id: user.id,
        });
      }
    });
}

function giveStatus() {
  for (let id of online) {
    const item = document.getElementById(`id${id}`);
    item.classList.add("online");
  }
}

//check mobile device

// Function to redirect or block based on device type
function checkDeviceAndRedirect() {
  const isMobileDevice =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  if (isMobileDevice) {
    // Redirect mobile users to a different page or show an error message
    window.location.href = "mobile_error.html";
  }
}

// Call the function when the page loads
function ShowTotalHrs() {
  const totalTimeObj = calculateTime(totalTime);
  total_hrs.textContent = totalTimeObj.hours;
  total_mins.textContent = totalTimeObj.minutes;
  total_secs.textContent = totalTimeObj.seconds;
}

//filter
totalFilter.addEventListener("click", () => {
  if (total === false) {
    total = true;
    insertData(sortData(listData));
    giveStatus();
    totalFilter.classList.add("active");
    todayFilter.classList.remove("active");
  }
});

todayFilter.addEventListener("click", () => {
  if (total === true) {
    total = false;
    insertData(sortData(listData));
    giveStatus();
    totalFilter.classList.remove("active");
    todayFilter.classList.add("active");
  }
});
