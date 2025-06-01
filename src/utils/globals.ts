// Define a type for our global variables
export interface GlobalVars {
  startTime?: number;
  lastTime?: number;
  logTimeDelta: (label: string) => void;
  // add other global variables as needed
}

// Create the global object
export const globals: GlobalVars = {
  startTime: undefined,
  lastTime: undefined,
  logTimeDelta: (label: string) => {
    const now = Date.now();
    if (globals.lastTime) {
      console.log(`[${label}] ⏱️ Delta: ${now - globals.lastTime}ms`);
    }
    globals.lastTime = now;
  }
};
