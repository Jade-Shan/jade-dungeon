exports.uuid = () => {
    // 长度为36的数组
    let s = [ ];
    let hexDigs = "0123456789abcdef";
    for(let i = 0; i < 36; i++) {
        s[i] = hexDigs.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[8] = s[13] = s[18] = s[23] = "-";
    //
    s[14] = "4";
    s[19] = hexDigs.substr((s[19] & 0x3) | 0x8, 1);
    return s.join("");
};
