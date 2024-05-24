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

let client;
async function connectToDatabase() {
    if (!client) {
        client = new MongoClient(mongoUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10 // 연결 풀 크기 설정
        });
        await client.connect();
    }
    return client.db('bcard').collection('bcardlist');
}

// 기본 라우트
app.get('/', (req, res) => {
    res.send('서버가 정상적으로 작동 중입니다.');
});

app.post('/onCreate', async (req, res) => {
    const { name, hpNum, company, email, image, auth } = req.body;

    try {
        const collection = await connectToDatabase();

        const result = await collection.insertOne({
            name,
            hpNum,
            company,
            email,
            image,
            auth
        });

        res.status(200).send(result);
    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).send({ error: '데이터 삽입 중 오류가 발생했습니다.' });
    }
});

app.post('/selectData', async (req, res) => {
    const { auth } = req.body;

    try {
        const collection = await connectToDatabase();

        const users = await collection.find({ auth }).toArray();
        res.status(200).send(users);
    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).send({ error: '데이터 출력 중 오류가 발생했습니다.' });
    }
});

app.listen(port, () => console.log(`Server is listening on http://localhost:${port}`));
