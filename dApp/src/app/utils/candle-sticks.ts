export interface Trade {
    tokenTraded: number;
    //amountPaidForTokens
    amountPaid: number;
    timestamp: number;
}

export interface Candlestick {
    open: number;
    close: number;
    high: number;
    low: number;
    volume: number;
    startTime: string;
    endTime: string;
    time: number;
}


export function convertToCandlestick(trades: Trade[], intervalInMilliseconds: number): Candlestick[] {

    if(trades.length<1) return []
    // Sort trades by timestamp
    trades.sort((a, b) => a.timestamp - b.timestamp);

    // console.log('sorted trades', trades)
    
    let candlesticks: Candlestick[] = [];
    let currentIntervalStart = trades[0].timestamp - (trades[0].timestamp % intervalInMilliseconds);
    let openPrice: number | undefined;
    let closePrice: number | undefined;
    let highPrice: number | undefined;
    let lowPrice: number | undefined;
    let volume: number | undefined;

    const pushCandlestick = () => {
        if (openPrice !== undefined && closePrice !== undefined && highPrice !== undefined && lowPrice !== undefined && volume !== undefined) {
            candlesticks.push({
                open: openPrice,
                close: closePrice,
                high: highPrice,
                low: lowPrice,
                volume: volume,
                startTime: new Date(currentIntervalStart).toISOString(),
                endTime: new Date(currentIntervalStart + intervalInMilliseconds).toISOString(),
                time: Math.floor(new Date(currentIntervalStart).getTime()/1000)
            });
        }
    };
    
    for (let trade of trades) {
        let price = trade.tokenTraded== 0 ? 0: trade.amountPaid / trade.tokenTraded;
        
        
        // Check if trade is within the current interval
        if (trade.timestamp < currentIntervalStart + intervalInMilliseconds) {
            if (openPrice === undefined) openPrice = price;
            closePrice = price;
            highPrice = highPrice !== undefined ? Math.max(highPrice, price) : price;
            lowPrice = lowPrice !== undefined ? Math.min(lowPrice, price) : price;
            volume = (volume || 0) + trade.tokenTraded;
        } else {
            // Push the completed candlestick data for the current interval
            pushCandlestick();

            // Move to the next interval until the trade falls into a valid interval
            do {
                currentIntervalStart += intervalInMilliseconds;
            } while (trade.timestamp >= currentIntervalStart + intervalInMilliseconds);
            
            // Reset for the next interval
            openPrice = price;
            closePrice = price;
            highPrice = price;
            lowPrice = price;
            volume = trade.tokenTraded;
        }
    }
    
     // Push the last candlestick if it exists
     pushCandlestick();
    
    return candlesticks;
}

