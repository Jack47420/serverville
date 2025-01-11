function quests() {
    questQueue = [
        { id: 1, name: "Server Startup", description: "Buy your first server rack", goal: 1, progress: 0, completed: false, rewarded: false, type: "serverRacks", difficulty: 1 },
        { id: 2, name: "GPU Startup", description: "Buy 4 GPUs", goal: 4, progress: 0, completed: false, rewarded: false, type: "gpus", difficulty: 1 },
        { id: 3, name: "Upgrade Startup", description: "Upgrade a server rack", goal: 1, progress: 0, completed: false, rewarded: false, type: "upgrade", difficulty: 1 },
        { id: 4, name: "Server Enthusiast", description: "Own 16 server racks", goal: 16, progress: 0, completed: false, rewarded: false, type: "serverRacks", difficulty: 2 },
        { id: 5, name: "GPU Enthusiast", description: "Install 32 GPUs", goal: 32, progress: 0, completed: false, rewarded: false, type: "gpus", difficulty: 2 },
        { id: 6, name: "Upgrade Enthusiast", description: "Upgrade 4 server racks", goal: 4, progress: 0, completed: false, rewarded: false, type: "upgrade", difficulty: 2 },
        { id: 7, name: "Server Expert", description: "Own 25 server racks", goal: 25, progress: 0, completed: false, rewarded: false, type: "serverRacks", difficulty: 3 },
        { id: 8, name: "GPU Expert", description: "Install 100 GPUs", goal: 100, progress: 0, completed: false, rewarded: false, type: "gpus", difficulty: 3 },
        { id: 9, name: "Upgrade Expert", description: "Upgrade 10 server racks", goal: 10, progress: 0, completed: false, rewarded: false, type: "upgrade", difficulty: 3 },
        { id: 10, name: "Rich", description: "Earn $1,000,000", goal: 1000000, progress: 0, completed: false, rewarded: false, type: "money", difficulty: 4 }
    ];
}