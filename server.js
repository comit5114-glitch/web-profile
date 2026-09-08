const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const path = require('path');

const app = express();
const PORT = 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// 현재 폴더의 정적 파일(HTML, CSS, JS) 제공
app.use(express.static(path.join(__dirname)));

// 구글 시트 API 설정
const SPREADSHEET_ID = '1EJojU3hgLpMwOwcn822DY3pTfUGeuK1eilGPl0jquMw';
const KEY_PATH = path.join(__dirname, 'plated-airline-500511-h2-1e8841587a94.json');

// 구글 인증 객체 생성
const auth = new google.auth.GoogleAuth({
    keyFile: KEY_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// 시트 메타데이터를 가져와서 첫 번째 탭, 두 번째 탭의 이름을 알아내는 함수
async function getSheetNames() {
    const res = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const sheetTitles = res.data.sheets.map(s => s.properties.title);
    return {
        sheet1: sheetTitles[0] || '시트1',
        sheet2: sheetTitles[1] || '시트2' // 두 번째 시트가 없으면 '시트2'로 기본값
    };
}

// 1. 문의하기 데이터 저장 API (시트 1번)
app.post('/api/contact', async (req, res) => {
    try {
        const { name, phone, email, message } = req.body;
        const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
        const rowData = [[timestamp, name || '', phone || '', email || '', message || '']];

        const { sheet1 } = await getSheetNames();

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `'${sheet1}'!A:E`, 
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: rowData },
        });

        res.json({ result: 'success', message: '성공적으로 저장되었습니다.' });
    } catch (error) {
        console.error('Error appending to sheet:', error);
        res.status(500).json({ result: 'error', message: '데이터 저장 중 오류가 발생했습니다. 구글 시트 구조를 확인해주세요.' });
    }
});

// 2. 링크 버튼 조회 API (시트 2번)
app.get('/api/links', async (req, res) => {
    try {
        const { sheet2 } = await getSheetNames();
        
        // 두 번째 시트가 존재하는지 확인
        const sheetRes = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
        if (sheetRes.data.sheets.length < 2) {
            return res.json({ result: 'success', data: [] }); // 시트가 없으면 빈 링크 반환
        }

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `'${sheet2}'!A:E`,
        });

        const rows = response.data.values || [];
        
        const links = rows.slice(1).map(row => {
            const isVisible = String(row[4] || '').toUpperCase() === 'TRUE';
            return {
                title: row[0] || '',
                description: row[1] || '',
                target_url: row[2] || '#',
                icon: row[3] || '🔗',
                is_active: isVisible
            };
        }).filter(link => link.title !== '' && link.is_active);

        res.json({ result: 'success', data: links });
    } catch (error) {
        console.error('Error reading from sheet:', error);
        res.status(500).json({ result: 'error', message: '데이터 조회 중 오류가 발생했습니다. 구글 시트 구조를 확인해주세요.' });
    }
});

// 서버 실행
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
