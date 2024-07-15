const axios = require('axios');
const dayjs = require('dayjs');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

const API_KEY = 'mh9lM4VtDXxXrV/NYt1jew==';

const stations = [
    { code: 'SF_0001', name: '부산항', lat: 35.091, lon: 129.099 },
    { code: 'SF_0002', name: '부산항(신항)', lat: 35.023, lon: 128.808 },
    { code: 'SF_0003', name: '인천항', lat: 37.379, lon: 126.616 },
    { code: 'SF_0004', name: '평택·당진항', lat: 37.113, lon: 126.393 },
    { code: 'SF_0005', name: '군산항', lat: 35.974, lon: 126.586 },
    { code: 'SF_0006', name: '대산항', lat: 36.997, lon: 126.304 },
    { code: 'SF_0007', name: '목포항', lat: 34.751, lon: 126.309 },
    { code: 'SF_0008', name: '여수항', lat: 34.754, lon: 127.752 },
    { code: 'SF_0009', name: '해운대', lat: 35.159, lon: 129.16 },
    { code: 'SF_0010', name: '울산항', lat: 35.551, lon: 129.378 },
    { code: 'SF_0011', name: '포항항', lat: 36.051, lon: 129.378 }
];

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // 지구 반지름 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function findNearestStation(lat, lon) {
    let minDist = Infinity;
    let nearestStation = null;

    stations.forEach(station => {
        const dist = getDistance(lat, lon, station.lat, station.lon);
        console.log(`Checking station: ${station.name}, Distance: ${dist}`); // 각 관측소와의 거리 확인
        if (dist < minDist) {
            minDist = dist;
            nearestStation = station;
        }
    });

    return nearestStation;
}

exports.renderPage = (req, res) => {
    res.render('index', { title: 'Express', fogProbability: 0, clearProbability: 0 });
};

exports.getSeafog = async (req, res) => {
    try {
        const { lat1, lon1, time1 } = req.body;
        const nearestStation = findNearestStation(parseFloat(lat1), parseFloat(lon1));
        console.log('Using station:', nearestStation); // 관측소 정보 확인

        const obsCode = nearestStation.code;
        const date = dayjs().format('YYYYMMDDHH');

        const apiUrl = `http://www.khoa.go.kr/api/oceangrid/seafog/search.do?ServiceKey=${API_KEY}&ObsCode=${obsCode}&Date=${date}&ResultType=json`;
        console.log('API Request URL:', apiUrl); // API 요청 URL 확인
        const response = await axios.get(apiUrl);

        if (response.data.result.error) {
            console.log('API Error:', response.data.result.error);
            res.json({ fogProbability: 'No data available' });
        } else {
            const index = time1 === '1' ? 0 : time1 === '3' ? 1 : 2;
            const fogProbability = response.data.result.data[index] ? response.data.result.data[index].seafog_master : 'No data available';
            console.log('API Result:', response.data.result); // result 값 로그 추가
            res.json({ fogProbability });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error retrieving seafog data' });
    }
};

exports.getSeafogDissipation = async (req, res) => {
    try {
        const { lat2, lon2, time2 } = req.body;
        const nearestStation = findNearestStation(parseFloat(lat2), parseFloat(lon2));
        console.log('Using station:', nearestStation); // 관측소 정보 확인

        const obsCode = nearestStation.code;
        const sDate = dayjs().subtract(1, 'day').format('YYYYMMDDHH');
        const eDate = dayjs(sDate, 'YYYYMMDDHH').add(3, 'hour').format('YYYYMMDDHH'); // sDate에서 +3시간을 YYYYMMDDHH 형식으로

        const apiUrl = `http://www.khoa.go.kr/api/oceangrid/seafogDissipation/search.do?ServiceKey=${API_KEY}&ObsCode=${obsCode}&SDate=${sDate}&EDate=${eDate}&ResultType=json`;

        const response = await axios.get(apiUrl);

        if (response.data.result.error || response.data.result === 'no search data') {
            console.log('API Error or No Search Data:', response.data.result.error || response.data.result);
            res.json({ clearProbability: 0 });
        } else {
            const index = parseInt(time2) - 1; // 1, 2, 3 시간 옵션에 따른 index 계산
            const clearProbability = response.data.result.data[index] ? response.data.result.data[index].seafog_dissipation : 0;
            console.log('API Result:', response.data.result); // result 값 로그 추가
            res.json({ clearProbability });
        }
    } catch (error) {
        console.error('Error in /seafogDissipation:', error);
        res.status(500).json({ error: 'Error retrieving seafog dissipation data' });
    }
};





