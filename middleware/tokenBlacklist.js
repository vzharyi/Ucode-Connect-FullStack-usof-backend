const blacklistedTokens = [];

const blacklistToken = (token) => {
    blacklistedTokens.push(token);
};

const isTokenBlacklisted = (token) => {
    return blacklistedTokens.includes(token);
};

export {isTokenBlacklisted, blacklistToken};