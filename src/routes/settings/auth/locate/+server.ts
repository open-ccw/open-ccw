import { error, text } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export interface LocateRes {
  ret: number;
  data: {
    ip: string;
    country: string;
    country_code: string;
    prov: string;
    city: string;
    city_code: string;
    city_short_code: string;
    area: string;
    post_code: string;
    area_code: string;
    isp: string;
    lng: string;
    lat: string;
    long_ip: 0;
    big_area: string;
  };
  qt: 0;
}

export const POST: RequestHandler = async ({ request }) => {
  const { ip } = (await request.json()) as { ip?: string };
  if (!ip) {
    return error(500, "ip is required");
  }
  const controller = new AbortController();
  const signal = controller.signal;
  setTimeout(() => controller.abort("timeout"), 3000);
  return await fetch(`https://ip9.com.cn/get?ip=${ip}`, { signal })
    .then(async (res) => text(await res.text()))
    .catch((e) => error(e));
};
