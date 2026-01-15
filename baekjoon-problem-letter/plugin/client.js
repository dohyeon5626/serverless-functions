import axios from 'axios';
import AppError from '../routes/exception.js';

const base = axios.create({
    baseURL: 'https://solved.ac/api/v3',
    headers: {
        'x-solvedac-language' : 'ko'
    }
});

export const getUserInfo = async (userId) => {
    try {
        const { data } = await base.get("/user/show", {
            params: {
                handle: userId,
            },
        });
        return data;
    } catch (e) {
        if (e.response.status === 429) {
            throw new AppError(429, 'Too Many Request');
        }
        throw new AppError(404, 'User Not Found');
    }
}

export const getProblem = async (userId, tier) => {
    try {
        const minTier = tier > 1 ? tier - 4 : 1;
        const maxTier = tier < 30 ? tier + 4 : 30;
        const query = `(*${minTier}..${maxTier})(-@${userId})(lang:ko)`;

        const { data } = await base.get("/search/problem", {
            params: {
                query,
                page: 1,
                sort: "random",
                direction: "asc",
            },
        });
        return data;
    } catch (e) {
        if (e.response.status === 429) {
            throw new AppError(429, 'Too Many Request');
        }
        throw new AppError(400, 'Bad Request');
    }
}
