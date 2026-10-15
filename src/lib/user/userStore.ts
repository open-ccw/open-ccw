import { writable } from "svelte/store";
import { token } from "#lib/auth/tokenStore";
import { communityWeb, setToken } from "#lib/api.ts";

export const user = writable<SelfUser>({ loggedIn: false });

async function updateUser() {
  try {
    const {
      oid,
      name,
      bio,
      reputationScore: { rank, score },
      studentNumber,
      virtualValue,
      avatar,
    } = await communityWeb.getStudentSelfDetail(true, true, []);
    if (oid) {
      user.set({
        loggedIn: true,
        oid,
        name,
        avatar,
        bio,
        reputationScore: { rank, score },
        studentNumber: parseInt(studentNumber),
        virtualValue,
      });
    } else {
      throw "login failed, oid is not defined";
    }
  } catch (e) {
    user.set({ loggedIn: false });
    throw e;
  }
}

export async function updateToken(tok: string) {
  setToken(tok);
  token.set(tok);
  await updateUser();
}

export async function refreshUser(): Promise<void> {
  await updateUser();
}

export function clearTokenAndUser() {
  setToken("");
  user.set({ loggedIn: false });
  token.set("");
}
