// Define isEdge function directly since we're in MAIN world
window.isGfg = function () {
	return true;
};

// Make it non-configurable and non-writable
try {
	Object.defineProperty(window, "isGfg", {
		value: window.isGfg,
		configurable: false,
		writable: false,
		enumerable: true,
	});
} catch (e) {
	console.log("Failed to make isGfg non-writable:", e);
}
