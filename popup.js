const button = document.getElementById("myButton");
const timer = document.getElementById("countdown");
const disableMessage = document.getElementById("disable-message");
const emergencyMessage = document.getElementById("emergency-message");
const modeRadioButtons = document.querySelectorAll('input[name="mode"]');
const dailyRadioButton = document.getElementById("daily");
const toggleSwitch = document.getElementById("togBtn");

function updateTimer() {
	chrome.storage.local.get("storedTime", function (items) {
		if (items.storedTime) {
			let lastStoredDate = new Date(items.storedTime);
			let currentTime = new Date();
			let diffTime = lastStoredDate - currentTime;
			if (diffTime <= 0) {
				timer.style.display = "none";
				chrome.storage.local.remove("storedTime");
			} else {
				let hours = Math.floor(diffTime / (60 * 60 * 1000));
				let minutes = Math.floor(
					(diffTime % (60 * 60 * 1000)) / (60 * 1000)
				);
				let seconds = Math.floor((diffTime % (60 * 1000)) / 1000);
				if (hours.toString().length === 1) hours = "0" + hours;
				if (minutes.toString().length === 1) minutes = "0" + minutes;
				if (seconds.toString().length === 1) seconds = "0" + seconds;
				timer.innerHTML = ` <b> GFG Forcing will again start in ${hours}:${minutes}:${seconds}</b>`;
				timer.style.display = "block";
			}
		}
	});
}

setInterval(updateTimer, 1000);

chrome.storage.local.get("storedDate", function (items) {
	const lastStoredDate = items.storedDate;
	const todayDate = new Date().toDateString();
	if (lastStoredDate !== undefined && lastStoredDate === todayDate) {
		button.disabled = true;
		disableMessage.style.display = "block";
		emergencyMessage.style.display = "none";
	} else if (
		lastStoredDate !== undefined &&
		new Date(lastStoredDate) < new Date(todayDate)
	) {
		button.disabled = false;
	}
});

button.onclick = () => {
	button.disabled = true;
	disableMessage.style.display = "block";
	emergencyMessage.style.display = "none";
	const currentDate = new Date();
	chrome.storage.local.set({ storedDate: currentDate.toDateString() });
	const updatedTime = new Date(currentDate.getTime() + 3 * 60 * 60 * 1000);
	chrome.storage.local.set({ storedTime: updatedTime.toString() });
};

modeRadioButtons.forEach((radioButton) => {
	radioButton.onclick = () => {
		chrome.storage.local.set({ mode: radioButton.value });
	};
});

chrome.storage.local.get("mode", function (items) {
	if (items.mode === "daily") {
		dailyRadioButton.checked = true;
	}
});
