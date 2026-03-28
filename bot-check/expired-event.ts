import axios from 'axios';
import { getAction, deleteAction } from './plugin/repository';
import { decryptToken } from './util/crypto';

export const expiredEventHandler = async (event: { id: string }): Promise<void> => {
  const record = await getAction(event.id);
  if (!record) return;

  const pat = decryptToken(record.token);
  await axios.post(
    `https://api.github.com/repos/${record.owner}/${record.repo}/dispatches`,
    {
      event_type: 'bot-check',
      client_payload: {
        ...(record.issueNumber !== undefined && { issueNumber: record.issueNumber }),
        ...(record.prNumber !== undefined && { prNumber: record.prNumber }),
        commentId: record.commentId,
        isSuccess: false,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: 'application/vnd.github+json',
      },
    },
  );

  await deleteAction(event.id);
};
