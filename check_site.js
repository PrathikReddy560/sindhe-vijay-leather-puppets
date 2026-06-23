import { JSDOM, VirtualConsole } from 'jsdom';

(async () => {
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("error", (...args) => console.error("PAGE ERROR:", ...args));
  virtualConsole.on("log", (...args) => console.log("PAGE LOG:", ...args));
  virtualConsole.on("jsdomError", (e) => console.error("JSDOM ERROR:", e.message, e.stack));
  
  console.log("Loading page...");
  try {
    const dom = await JSDOM.fromURL('https://sindhe-vijay-leather-puppets.vercel.app/', {
      runScripts: "dangerously",
      resources: "usable",
      virtualConsole
    });
    
    // Wait for async rendering
    await new Promise(r => setTimeout(r, 5000));
    console.log("Done waiting.");
  } catch (err) {
    console.error("Failed:", err);
  }
})();
