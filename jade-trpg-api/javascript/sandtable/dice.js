

let genRollResultKey = (campaignId, placeId, sceneId) => {
    return `jadedungeon::sandtable::rollDiceResult::${campaignId}::${placeId}::${sceneId}`;
};

exports.handler = {
    "/api/sandtable/roll-dice": async (context, data) => {
        let json = { status: "error", msg: "" };
        let campaignId = data.params.campaignId;
        let placeId = data.params.placeId;
        let sceneId = data.params.sceneId;
        let username = data.params.username;
        let rollCmd = data.params.rollCmd;
        if (campaignId && placeId && sceneId && username && rollCmd && //
            campaignId.length > 0 && placeId.length > 0 && sceneId.length > 0 && //
            username.length > 0 && rollCmd.length > 0) //
        {
            let rollArr = rollCmd.match(/(\d*d)?\d+/gi);
            console.log(rollArr);
            let sum = 0;
            let sumStr = '';
            if (rollArr && rollArr.length > 0) {
                for (let i = 0; i < rollArr.length; i++) {
                    let s = rollArr[i];
                    if (/^\d+$/gi.test(s)) {
                        let r = parseInt(s);
                        sum = sum + r;
                        sumStr = sumStr + '+' + s;
                    } else if (/^1?d\d+$/i.test(s)) {
                        let d = s.substring(1);
                        let r = Math.floor(Math.random(parseInt()) * d) + 1;
                        sum = sum + r;
                        sumStr = sumStr + '+' + r + `(${s})`;
                    } else if (/^\d+d\d+$/i.test(s)) {
                        let n = 0;
                        let ss = s.split(/d/i);
                        let t = parseInt(ss[0]);
                        let d = parseInt(ss[1]);
                        for (let k = 0; k < t; k++) {
                            let r = Math.floor(Math.random() * d) + 1;
                            n = n + r;
                        }
                        sum = sum + n;
                        sumStr = sumStr + '+' + n + `(${s})`;
                    }
                }
                sumStr = `${sum}`.substring(1);
                console.log(sumStr);
            } else { json.msg = 'roll command format err'; }
        } else { json.msg = 'miss params'; }
        context.response.writeHead(200, {
            'Content-Type': 'application/json;charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST',
            'Access-Control-Allow-Headers': 'x-requested-with,content-type'
        });
        context.response.end(JSON.stringify(json));
    }
}