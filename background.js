let GFG_API_ENDPOINT =
	"https://geeks-for-geeks-api.vercel.app/professionalprovishal";

function dayofyear() {
	let today = new Date();
	let dayOfYear = Math.floor(
		(today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
	);
	return dayOfYear;
}

async function getGFGData() {
	let retriesLeft = 3;
	let delay = 1000;

	// let problemSolved = data.info.totalProblemsSolved;
	while (retriesLeft > 0) {
		try {
			const response = await fetch(GFG_API_ENDPOINT);
			if (response.ok) {
				const data = await response.json();
				console.log("GFG API response:", data);
				console.log("problemSolved", data.info.totalProblemsSolved);
				return data.info.totalProblemsSolved;
			} else if (response.status === 429) {
				// Rate limited, wait and retry
				await new Promise((res) => setTimeout(res, delay));
				delay *= 2;
				retriesLeft--;
			} else {
				throw new Error(`API error: ${response.status}`);
			}
		} catch (error) {
			console.error(`GFG API error: ${error}. Retrying...`);
			await new Promise((res) => setTimeout(res, delay));
			delay *= 2;
			retriesLeft--;
		}
	}
	console.error("Failed to call GFG API after 3 retries.");
	return null;
}

// Minimal working fetch and log example
let problemSolved = getGFGData() - 10;

let count = dayofyear() + problemSolved;
console.log("count", count);

chrome.storage.local.set({
	problemSolved: problemSolved,
});

// Call the function once for testing
// getGFGData();

function redirectToGFG() {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		const gfgUrl = "https://www.geeksforgeeks.org/problem-of-the-day/";
		const currentTab = tabs[0];
		try {
			const url = new URL(currentTab.url);
			if (url.hostname.includes("geeksforgeeks.org")) {
				// Already on GFG, do not redirect
				return;
			}
		} catch (e) {
			// If URL parsing fails, fallback to redirect
		}
		chrome.tabs.update(currentTab.id, { url: gfgUrl });
	});
}

async function checkAndRedirectIfNotSolved() {
	// Check if emergency button cooldown is active
	const emergency = await chrome.storage.local.get("storedTime");
	if (emergency.storedTime) {
		const now = new Date();
		const storedTime = new Date(emergency.storedTime);
		if (storedTime > now) {
			// Emergency cooldown active, do not redirect
			return;
		} else {
			// Cooldown expired, remove storedTime
			chrome.storage.local.remove("storedTime");
		}
	}
	// Get today's date string
	const today = new Date().toDateString();
	// Get last stored date and problem count
	const stored = await chrome.storage.local.get([
		"lastSolvedDate",
		"lastProblemSolved",
	]);
	// Get current problem solved count from API
	const currentSolved = await getGFGData();
	if (currentSolved === null) {
		// API failed, do nothing
		return;
	}
	// If not solved today or count hasn't increased, redirect
	if (
		stored.lastSolvedDate !== today ||
		stored.lastProblemSolved === undefined ||
		currentSolved <= stored.lastProblemSolved
	) {
		redirectToGFG();
	} else {
		// Update storage for next check
		chrome.storage.local.set({
			lastSolvedDate: today,
			lastProblemSolved: currentSolved,
		});
	}
}

// Listen for tab updates and check if redirect is needed
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (tab.url !== undefined && changeInfo.status === "complete") {
		checkAndRedirectIfNotSolved();
	}
});
