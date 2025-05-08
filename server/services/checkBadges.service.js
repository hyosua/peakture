export const checkBadges = async (user) => {
    const unlockedBadges = [];

    if(user.votedForWinnerCount >= 3 && !user.badges.includes("Stratège")) {
        unlockedBadges.push("Stratège");
    }
}
