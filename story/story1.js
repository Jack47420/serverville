function story() {
    storyQueue = [
        {
            title: "Welcome to ServerVille!",
            content: `<i>"If you had bought Bitcoin worth 1$ in 2009 and held it until today, 
                you would have nearly 100.000.000 $ worth of Bitcoin now."</i>

                Well, "coulda, woulda, shoulda"!

                But you're in luck: Today is January 24, 2011.
                Bitcoin is only worth half a dollar, the blockchain is still short, 
                and you know how much its value will explode.

                Take this opportunity, build a crypto mining empire, 
                and become a multitrillionaire!

                May your GPUs stay cool and your bitcoins come quick!`,
            asciiArt: ascipicture2
        },
        {
            title: "System Administrator",
            content: `Hey, wait a minute... You want to get into Bitcoin? 
                Seriously though, I'm curious — why do you trust it? 
                Why would you invest in such a unsafe business? 
        
                But hey, I'm not complaining! 
                In fact, if you're really ready to jump in, I'm all in 
                to help you build your cryto mining serverfarm. 
                And I'm pretty sure we can have you mining blocks faster
                than you can say "Satoshi Nakamoto."
                
                So yeah, I may be scratching my head over why you trust Bitcoin so much, 
                but I can't deny it's got potential. 
                And if you're serious about this, then let's get started!`,
            asciiArt: ascipicture1
        }
    ];

    showNextStoryPopup();

    setTimeout(() => {
        if (purchasedRacks.reduce((a, b) => a + b, 0) === 0) {
            openStoryPopup(`System Administrator`, `What are you waiting for? Click on the empty slot and then on 
                the button "Buy Server Rack" to start building your mining rig.

                You can also press "1-9" to select a rack 
                and then <b>press "S"</b> to buy a server rack.`, ascipicture1); 
        } else if (quests[0].rewarded === false) {
            openStoryPopup(`System Administrator`, `Wow, you already bought your first server rack. And got it running!
                You did not even need my help for that! 
                Well... very good!
                
                Next there is the quest System:

                And it looks like you already finished it! 
                Click it to claim your reward! `, ascipicture1); 
        } else {
            openStoryPopup(`System Administrator`, `Hm, have you done this before?

                You have your first server rack running and already claimed your first quest.
                I am amazed!`, ascipicture1); 
        }
    }, 10000);
    setTimeout(() => {
        if (gpuCounts.reduce((a, b) => a + b, 0) === 0) {
            openStoryPopup(`System Administrator`, `You don't have any GPUs yet. 
                GPUs are way more powerful than server racks. 
                They will increase your mining speed a lot!
                
                Click on the serverrack and then on the button "Buy GPU"!`, ascipicture1); 
        } else if (quests[0].rewarded === false && quests[1].completed === true && quests[1].rewarded === false) {
            openStoryPopup(`System Administrator`, `Are you sure you don't want your quest rewards?
                What if i tell you that they will disolve after some time?
                
                Claim your rewards already!!!`, ascipicture1);
        } else if (quests[1].completed === false){
            openStoryPopup(`System Administrator`, `Ok, you already have a GPU installed.
                Good job!

                Buy 4 in total for your quest reward!

                And don't forget to claim your old quest rewards!
                Click it to claim your reward.`, ascipicture1);
        } else {
            openStoryPopup(`System Administrator`, `I think you don't even need my help...
                
                You already have a GPU installed.
                Good job!`, ascipicture1); 
        }
    }, 20000);
    setTimeout(() => {
        if (rackUpgrades.reduce((a, b) => a + b, 0) === 0) {
            openStoryPopup(`System Administrator`, `There is another thing you should know:
                You can upgrade your server racks to install more GPUs per rack.
                
                Click on the serverrack and then on the button "Upgrade" to upgrade it!`, ascipicture1); 
        } else if (quests[0].rewarded === false && quests[1].rewarded === false && quests[2].rewarded === false) {
            openStoryPopup(`System Administrator`, `You are doing this on purpose, right?
                I don't know why you would't take free money...
                
                But you probably know what you are doing.
                For now, i dont have anything else to tell you.
                
                Keep the servers running and have fun mining!`, ascipicture1);
        } else if (quests[0].rewarded === false || quests[1].rewarded === false || quests[2].rewarded === false) {
            openStoryPopup(`System Administrator`, `You already upgraded your server rack.
                Good job!

                But don't forget to claim your quest rewards!
                Click it to claim your reward.`, ascipicture1);
        } else {
            openStoryPopup(`System Administrator`, `You have a upgraded serverrack running with GPUs. 
                You came so far!
                
                For now, i dont have anything else to tell you.
                
                Keep the servers running and have fun mining!`, ascipicture1); 
        }
    }, 30000);
}

