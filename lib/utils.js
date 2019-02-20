const {
  TIIM_SYMBOL,
  TIIM_NAME,
  GAS_LIMIT,
  MILLION,
  UNIT,
  COMMUNITY_RESERVED,
  CROWD_FUNDING,
  TRANSFER_GAS,
  TOTAL_SUPPLY
} = require("../lib/constants");

const duration = {
    seconds: function (val) { return val; },
    minutes: function (val) { return val * this.seconds(60); },
    hours: function (val) { return val * this.minutes(60); },
    days: function (val) { return val * this.hours(24); },
    weeks: function (val) { return val * this.days(7); },
    years: function (val) { return val * this.days(365); },
};

latestTime = () => {
    return web3.eth.getBlock('latest').timestamp;
}

increaseTime = (duration) => {
    const id = Date.now();

    return new Promise((resolve, reject) => {
      web3.currentProvider.sendAsync({
        jsonrpc: '2.0',
        method: 'evm_increaseTime',
        params: [duration],
        id: id,
      }, err1 => {
        if (err1) return reject(err1);

        web3.currentProvider.sendAsync({
          jsonrpc: '2.0',
          method: 'evm_mine',
          id: id + 1,
        }, (err2, res) => {
          return err2 ? reject(err2) : resolve(res);
        });
      });
    });
}

endICO = async (tiimToken) => {
    await tiimToken.startPublicIco(0x0);
    await tiimToken.endPublicIco();
}

toWei = (amount) => {
    return web3.toWei(String(amount), 'ether');
};

fromWei = (amount) => {
    return web3.fromWei(amount, 'ether');
};

printGas = (x) => {
    const rate = process.env.ETH_RATE || 466.52;
    const gasUsed = x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const cost = fromWei ( x * 20000000000 );
    let usd = cost*rate;
    usd = parseFloat(Math.round(usd * 100) / 100).toFixed(2);
    // console.log('Gas used : ', gasUsed, '   cost for GAS USED in ETH ', cost, '  cost in USD: ', cost*rate, ' follow current RATE ', rate);
    return gasUsed + '   cost for GAS USED in ETH: "' + cost + '"  cost in USD: "'+usd+'"';
}

module.exports = {
    TIIM_SYMBOL,
    TIIM_NAME,
    GAS_LIMIT,
    MILLION,
    UNIT,
    COMMUNITY_RESERVED,
    CROWD_FUNDING,
    TRANSFER_GAS,
    TOTAL_SUPPLY,
    toWei,
    fromWei,
    duration,
    increaseTime,
    latestTime,
    endICO,
    printGas
}