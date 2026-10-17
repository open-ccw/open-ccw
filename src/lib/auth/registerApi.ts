import { sealedRequest, SERVER_PUB_KEYS } from '#lib/crypto/sealedRequest';
const REGISTER_API = 'https://openccw.seia0070.dpdns.org/register';
const PROFILE_API = 'https://community-web.ccw.site/students/self/detail';

export async function getStudentProfile(
  token: string,
): Promise<{ uid: string; avatar: string; name: string }> {
  const res = await fetch(PROFILE_API, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      token,
    },
    body: JSON.stringify({
      needGrade: true,
      needExtraInfo: true,
      fields: [
        'gender',
        'school',
        'qq',
        'host',
        'bio',
        'province',
        'city',
        'addressCode',
        'accountNumber',
        'createdAt',
        'updatedAt',
        'parents',
      ],
    }),
  });
  if (!res.ok) throw new Error('获取账号信息失败 ' + res.status);
  const data = (await res.json()) as {
    body?: { studentNumber?: string; avatar?: string; name?: string };
  };
  const uid = String(data?.body?.studentNumber ?? '').trim();
  if (!uid) throw new Error('账号数据异常');
  return {
    uid,
    avatar: data?.body?.avatar ?? '',
    name: data?.body?.name ?? '',
  };
}

export async function getStudentUid(token: string): Promise<string> {
  return (await getStudentProfile(token)).uid;
}

export async function registerAccount(uid: string, token: string, password: string): Promise<void> {
  const result = await sealedRequest<{ code?: string }>(SERVER_PUB_KEYS, REGISTER_API, {
    uid,
    token,
    password,
  });
  if (result.code !== '200') {
    throw new Error(String(result.code ?? '注册失败'));
  }
}
