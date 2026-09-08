const { google } = require('googleapis');
const path = require('path');

const SPREADSHEET_ID = '1EJojU3hgLpMwOwcn822DY3pTfUGeuK1eilGPl0jquMw';
const KEY_PATH = path.join(__dirname, 'plated-airline-500511-h2-1e8841587a94.json');

const auth = new google.auth.GoogleAuth({
    keyFile: KEY_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

async function createSheet() {
    try {
        const response = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID,
        });

        const sheetTitles = response.data.sheets.map(s => s.properties.title);
        if (sheetTitles.includes('시트2')) {
            console.log('시트2가 이미 존재합니다.');
        } else {
            console.log('시트2를 생성합니다...');
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId: SPREADSHEET_ID,
                requestBody: {
                    requests: [{
                        addSheet: {
                            properties: {
                                title: '시트2'
                            }
                        }
                    }]
                }
            });
            console.log('시트2 생성 완료!');
        }

        console.log('초기 데이터(헤더 및 기본값)를 설정합니다...');
        const initialData = [
            ['제목', '설명', 'URL', '아이콘', '표시여부'],
            ['연주쌤 디지털교실(블로그)', '네이버 블로그', 'https://blog.naver.com/smartyeonjusam', '📝', 'TRUE'],
            ['연주쌤 디지털교실(유튜브)', '강의 및 튜토리얼', 'https://www.youtube.com/@comitedu', '▶️', 'TRUE'],
            ['yeoncomit(인스타그램)', '일상과 인사이트', 'https://www.instagram.com/yeoncomit?igsh=MWFpc2NrdHVwbTFibg', '📸', 'TRUE'],
            ['숨겨진 링크', '이건 안보임', 'https://example.com', '🔒', 'FALSE']
        ];

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: '시트2!A1:E5',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: initialData
            }
        });

        console.log('초기 데이터 설정 완료!');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

createSheet();
