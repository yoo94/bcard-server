import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import dotenv from 'dotenv';

// 환경 변수 설정 파일 로드
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const mongoUrl = process.env.MONGO_URL; // .env 파일에 MONGO_URL을 설정하세요

app.use(cors());
app.use(express.json());

// 기본 라우트
app.get('/', (req, res) => {
    res.send('서버가 정상적으로 작동 중입니다.');
});

app.post('/onCreate', async (req, res) => {
    const { _id, name, hpNum, company, email, image, auth } = req.body;
    const client = new MongoClient(mongoUrl);

    try {
        await client.connect();
        const database = client.db('bcard');
        const collection = database.collection('bcardlist');
        const data = {
            name: name,
            hpNum: hpNum,
            company: company,
            email: email,
            image: image,
            auth: auth
        }
        const result = await collection.insertOne(data);

        res.status(200).send(result);
    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).send({ error: '데이터 삽입 중 오류가 발생했습니다.' });
    } finally {
        await client.close();
    }
});

app.post('/selectData', async (req, res) => {
    const { auth } = req.body;
    const client = new MongoClient(mongoUrl);
    const data = { auth: auth }
    try {
        await client.connect();
        const database = client.db('bcard');
        const collection = database.collection('bcardlist');

        const users = await collection.find(data).toArray();
        res.status(200).send(users);
    } catch (error) {
        console.error('Error retrieving data:', error); // 추가: 오류 로그
        res.status(500).send({ error: '데이터 출력 중 오류가 발생했습니다.' });
    } finally {
        await client.close();
    }
});

app.listen(port, () => console.log(`Server is listening on http://localhost:${port}`));
