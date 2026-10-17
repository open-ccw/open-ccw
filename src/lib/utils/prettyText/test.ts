import { tokenize } from './tokenizer';

const test = `
测试文本
![](https://m.ccw.site/works-covers/1.png?t=.png)
测试文本2
https://m.ccw.site/url2 aaa
![](https://m.ccw.site/works-covers/3)
https://m.ccw.site/url4`;

tokenize(test);
// ┌─────────┬─────────┬──────────────────────────────────────────────────────────────────┐
// │ (index) │ type    │ value                                                            │
// ├─────────┼─────────┼──────────────────────────────────────────────────────────────────┤
// │ 0       │ 'plain' │ '\n测试文本\n'                                                   │
// │ 1       │ 'image' │ { url: 'https://m.ccw.site/works-covers/1.png?t=.png', alt: '' } │
// │ 2       │ 'plain' │ '\n测试文本2\n'                                                  │
// │ 3       │ 'url'   │ 'https://m.ccw.site/url2'                                        │
// │ 4       │ 'plain' │ ' aaa\n![]('                                                     │
// │ 5       │ 'url'   │ 'https://m.ccw.site/works-covers/3'                              │
// │ 6       │ 'plain' │ ')\n'                                                            │
// │ 7       │ 'url'   │ 'https://m.ccw.site/url4'                                        │
// └─────────┴─────────┴──────────────────────────────────────────────────────────────────┘
