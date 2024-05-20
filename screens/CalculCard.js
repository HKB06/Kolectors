export const calculateTotalValue = (cards) => {
    return cards.reduce((sum, card) => {
        if (card.details && card.details.tcgplayer && card.details.tcgplayer.prices) {
            const prices = card.details.tcgplayer.prices;
            let marketPrice = 0;

            if (prices.normal && prices.normal.market) {
                marketPrice = prices.normal.market;
            } else if (prices.holofoil && prices.holofoil.market) {
                marketPrice = prices.holofoil.market;
            } else if (prices.reverseHolofoil && prices.reverseHolofoil.market) {
                marketPrice = prices.reverseHolofoil.market;
            } else if (prices['1stEditionHolofoil'] && prices['1stEditionHolofoil'].market) {
                marketPrice = prices['1stEditionHolofoil'].market;
            }

            return sum + (marketPrice ? parseFloat(marketPrice) : 0);
        }
        return sum;
    }, 0);
};