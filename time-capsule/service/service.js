import { saveSubscription } from "../repository/repository.js";

export async function createSubscription(capsuleData) {
    // TODO 후에 파일 업로드도 진행 예정
    return await saveSubscription(capsuleData);
}
