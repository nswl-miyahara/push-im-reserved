const puppeteer = require('puppeteer');
const push = require('./push');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
initializeApp();
const db = getFirestore();

exports.main = async (event, context) => {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--disable-dev-shm-usage'
        ]
    });
    
    let schedules;
    try {
        const page = await browser.newPage();
        // ログイン
        await page.goto('https://manage.interview-maker.com/login/');
        await page.type('#username', process.env.IM_ID);
        await page.type('#password', process.env.IM_PASS);
        await page.click('button.login-btn');
        await page.waitForSelector('div.layout-menu');

        // 週間カレンダーの表示
        await page.goto('https://manage.interview-maker.com/features/calendar/week');
        await page.waitForSelector('div.calendar-area');

        // 予約情報を取得
        schedules = await page.evaluate(() => {
            const dataList = [];
            const schedules = document.querySelectorAll('div.schedule');
            schedules.forEach(schedule => {
                const clz = schedule.className;
                if (clz.indexOf('available') == -1) {
                    const parent = schedule.parentNode;
                    const date = parent.id.replace('td-', '');
                    dataList.push(date);
                }
            });
            return dataList;
        });
    } catch (e) {
        console.error(e);
    } finally {
        browser.close();
    }

    // firestoreに予約情報を登録.
    // 未登録のスケジュールは通知.
    try {
        const reservedRef = db.collection('reserved');
        schedules.forEach(async schedule => {
            snapshot = await reservedRef.where('reservedDate', '==', schedule).get();
            if (!snapshot.empty) {
                return;
            }
            let ok = await push.exec(schedule);
            if (!ok) {
                return;
            }
            await reservedRef.add({
                reservedDate: schedule,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
            })
        });
    } catch (e) {
        console.error(e);
    }
};