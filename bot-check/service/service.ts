import axios from 'axios';
import { nanoid } from 'nanoid';
import { SchedulerClient, CreateScheduleCommand, DeleteScheduleCommand } from '@aws-sdk/client-scheduler';
import { saveAction, getAction, deleteAction } from '../plugin/repository';
import { encryptToken, decryptToken } from '../util/crypto';
import AppError from '../routes/exception';

const SCHEDULER_ROLE_ARN = process.env.SCHEDULER_ROLE_ARN as string;
const EXPIRED_EVENT_FUNCTION_ARN = process.env.EXPIRED_EVENT_FUNCTION_ARN as string;

const schedulerClient = new SchedulerClient({});

export interface CreateActionInput {
  token: string;
  verificationTimeout: number;
  owner: string;
  repo: string;
  issueNumber?: number;
  prNumber?: number;
  commentId: number;
}

const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET as string;

const createSchedule = async (id: string, ttl: number): Promise<void> => {
  const scheduleTime = new Date(ttl * 1000).toISOString().slice(0, 19);
  await schedulerClient.send(new CreateScheduleCommand({
    Name: `bot-check-${id}`,
    ScheduleExpression: `at(${scheduleTime})`,
    ScheduleExpressionTimezone: 'UTC',
    Target: {
      Arn: EXPIRED_EVENT_FUNCTION_ARN,
      RoleArn: SCHEDULER_ROLE_ARN,
      Input: JSON.stringify({ id }),
    },
    FlexibleTimeWindow: { Mode: 'OFF' },
    ActionAfterCompletion: 'DELETE',
  }));
};

const deleteSchedule = async (id: string): Promise<void> => {
  try {
    await schedulerClient.send(new DeleteScheduleCommand({ Name: `bot-check-${id}` }));
  } catch (e: any) {
    if (e.name !== 'ResourceNotFoundException') throw e;
  }
};

const verifyTurnstile = async (turnstileToken: string): Promise<boolean> => {
  const res = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    secret: TURNSTILE_SECRET,
    response: turnstileToken,
  });
  return res.data.success === true;
};

export const verifyAction = async (id: string, turnstileToken: string): Promise<void> => {
  const record = await getAction(id);
  if (!record) throw new AppError(409, 'Not Found');

  const isValid = await verifyTurnstile(turnstileToken);
  if (!isValid) throw new AppError(401, 'Turnstile verification failed');

  const pat = decryptToken(record.token);
  await axios.post(
    `https://api.github.com/repos/${record.owner}/${record.repo}/dispatches`,
    {
      event_type: 'bot-check',
      client_payload: {
        ...(record.issueNumber !== undefined && { issueNumber: record.issueNumber }),
        ...(record.prNumber !== undefined && { prNumber: record.prNumber }),
        commentId: record.commentId,
        isSuccess: true
      },
    },
    {
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: 'application/vnd.github+json',
      },
    },
  );

  await Promise.all([deleteAction(id), deleteSchedule(id)]);
};

export const createAction = async (input: CreateActionInput): Promise<string> => {
  const id = nanoid();
  const encryptedToken = encryptToken(input.token);
  const ttl = Math.floor(Date.now() / 1000) + input.verificationTimeout * 60;

  await saveAction({
    id,
    token: encryptedToken,
    owner: input.owner,
    repo: input.repo,
    ...(input.issueNumber !== undefined && { issueNumber: input.issueNumber }),
    ...(input.prNumber !== undefined && { prNumber: input.prNumber }),
    commentId: input.commentId,
    ttl,
  });

  await createSchedule(id, ttl);

  return id;
};
