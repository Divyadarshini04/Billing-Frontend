export const numberToWords = (num) => {
    if (num === 0) return "Zero Rupees Only";

    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const convert = (n) => {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
        if (n < 1000) return a[Math.floor(n / 100)] + "Hundred " + (n % 100 !== 0 ? "and " + convert(n % 100) : "");
        return "";
    };

    const formattedNum = parseFloat(num).toFixed(2);
    let [rupees, paise] = formattedNum.split('.').map(Number);

    let str = "";

    // Indian Numbering System
    if (rupees >= 10000000) {
        str += convert(Math.floor(rupees / 10000000)) + "Crore ";
        rupees %= 10000000;
    }
    if (rupees >= 100000) {
        str += convert(Math.floor(rupees / 100000)) + "Lakh ";
        rupees %= 100000;
    }
    if (rupees >= 1000) {
        str += convert(Math.floor(rupees / 1000)) + "Thousand ";
        rupees %= 1000;
    }
    if (rupees > 0) {
        str += convert(rupees);
    }

    str = str.trim() + " Rupees";

    if (paise > 0) {
        str += " and " + convert(paise) + "Paise";
    }

    return "INR " + str + " Only";
};
