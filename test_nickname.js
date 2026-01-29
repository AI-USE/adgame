const { playerMetadata } = {
    playerMetadata: {
        "user1": { nickname: "Alice" },
        "user2": { nickname: "Bob" }
    }
};

function checkNickname(userId, nickname) {
    for (const [uid, pMeta] of Object.entries(playerMetadata)) {
        if (pMeta.nickname === nickname && uid !== userId) {
            return false; // Taken
        }
    }
    return true; // Available
}

console.log("user1 Alice:", checkNickname("user1", "Alice")); // true
console.log("user2 Alice:", checkNickname("user2", "Alice")); // false
console.log("user3 Alice:", checkNickname("user3", "Alice")); // false
console.log("user2 Bob:", checkNickname("user2", "Bob")); // true
console.log("user1 Bob:", checkNickname("user1", "Bob")); // false
console.log("user3 Charlie:", checkNickname("user3", "Charlie")); // true
