const image = /!\[(.*)\]\((https:\/\/m\.ccw\.site\/works-covers[^\s\(\)]*\.png)\)/;
const link = /(https?:\/\/(?:\w*\.)?ccw\.site\/[^\s\(\)]*)/;
const complied = new RegExp(`${image.source}|${link.source}`, 'g');

export type TokenType = ImageToken | URLToken | PlainToken;

export function tokenize(text: string) {
  let arr: RegExpExecArray | null;
  let pos = 0;
  complied.lastIndex = pos;
  const tokens: TokenType[] = [];
  while ((arr = complied.exec(text)) !== null) {
    const plain = text.slice(pos, arr.index);
    pos = complied.lastIndex;
    if (plain) {
      tokens.push(new PlainToken(plain));
    }
    if (arr[2]) {
      tokens.push(new ImageToken(arr[2], arr[1]));
    }
    if (arr[3]) {
      tokens.push(new URLToken(arr[3]));
    }
  }
  const rest = text.slice(pos);
  if (rest) {
    tokens.push(new PlainToken(rest));
  }
  return tokens;
}

interface Token {
  type: string;
  value: any;
}

class PlainToken implements Token {
  type: 'plain' = 'plain';
  value: string;
  constructor(v: string) {
    this.value = v;
  }
}

class ImageToken implements Token {
  type: 'image' = 'image';
  value: {
    url: string;
    alt: string;
  };
  constructor(url: string, alt: string) {
    this.value = {
      url,
      alt,
    };
  }
}

class URLToken implements Token {
  type: 'url' = 'url';
  value: string;
  constructor(url: string) {
    this.value = url;
  }
}
