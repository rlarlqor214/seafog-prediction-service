const axios = require('axios');
const dayjs = require('dayjs');
const express = require('express');
const bodyParser = require('body-parser');
const iconv = require('iconv-lite');
const app = express();


const API_KEY = 'qPwOeIrU-2406-NCTUSL-0815';

exports.renderPage = (req, res) => {
    res.render('jelly', { title: 'Express', fogProbability: 0, clearProbability: 0 });
};

exports.getJellyfish = async (req, res) => {
    try {
        const { sdate, edate } = req.body;

        const apiUrl = `https://www.nifs.go.kr/OpenAPI_json?id=jellyList&key=${API_KEY}&sdate=${sdate}&edate=${edate}`;
        console.log('API Request URL:', apiUrl);

        const response = await axios({
            url: apiUrl,
            method: 'GET',
            responseType: 'arraybuffer',
        });
        
        const decodedData = iconv.decode(Buffer.from(response.data), 'EUC-KR');
        const jsonData = JSON.parse(decodedData);

        res.json(jsonData);
    } catch (error) {
        console.error('Error in /getJellyfish:', error);
        res.status(500).json({ error: 'Error retrieving jellyfish data' });
    }
};

exports.getJellyfishInfo = async (req, res) => {
    try {
        const { scode } = req.body;

        const apiUrl = `https://www.nifs.go.kr/OpenAPI_json?id=jellyDetail&key=${API_KEY}&srcode=${scode}`;
        console.log('API Request URL:', apiUrl);

        const response = await axios({
            url: apiUrl,
            method: 'GET',
            responseType: 'arraybuffer',
        });

        const decodedData = iconv.decode(Buffer.from(response.data), 'EUC-KR');
        const jsonData = JSON.parse(decodedData);

        res.json(jsonData);
    } catch (error) {
        console.error('Error in /getJellyfishInfo:', error);
        res.status(500).json({ error: 'Error retrieving jellyfish info' });
    }
};