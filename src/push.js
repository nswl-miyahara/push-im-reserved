const axios = require('axios');

exports.exec = async function (schedule) {
    let res = await axios.post(process.env.WEBHOOK_URL, {
        "text": "TO:リクルーターの皆様  \n以下の日程で面談の予約が入りました。  \n**" + schedule + "**  \n担当者の方はご対応よろしくお願いします。"
    }).catch((error) => {
        console.log(error);
        return false;
    });
    return true;
}