import { boxesFromSpaceURLMap } from './geometry'

const box1 = `
  ab
  ab
`
  .replace(/\s/g, '')
  .split('')

const box2 = `
  aa
  bb
`
  .replace(/\s/g, '')
  .split('')

const box3 = `
  aac
  aaa
  dae
`
  .replace(/\s/g, '')
  .split('')

const box4 = `
  ...
  .aa
  .aa
`
  .replace(/\s/g, '')
  .split('')
  .map((c) => (c === '.' ? undefined : c))

const box5 = `
  ..a
  ..a
  .aa
`
  .replace(/\s/g, '')
  .split('')
  .map((c) => (c === '.' ? undefined : c))

describe.each([
  [
    2,
    2,
    box1,
    [
      { url: 'a', x: 0, y: 0, w: 1, h: 2, spaces: [0, 2] },
      { url: 'b', x: 1, y: 0, w: 1, h: 2, spaces: [1, 3] },
    ],
  ],
  [
    2,
    2,
    box2,
    [
      { url: 'a', x: 0, y: 0, w: 2, h: 1, spaces: [0, 1] },
      { url: 'b', x: 0, y: 1, w: 2, h: 1, spaces: [2, 3] },
    ],
  ],
  [
    3,
    3,
    box3,
    [
      { url: 'a', x: 0, y: 0, w: 2, h: 2, spaces: [0, 1, 3, 4] },
      { url: 'c', x: 2, y: 0, w: 1, h: 1, spaces: [2] },
      { url: 'a', x: 2, y: 1, w: 1, h: 1, spaces: [5] },
      { url: 'd', x: 0, y: 2, w: 1, h: 1, spaces: [6] },
      { url: 'a', x: 1, y: 2, w: 1, h: 1, spaces: [7] },
      { url: 'e', x: 2, y: 2, w: 1, h: 1, spaces: [8] },
    ],
  ],
  [3, 3, box4, [{ url: 'a', x: 1, y: 1, w: 2, h: 2, spaces: [4, 5, 7, 8] }]],
  [
    3,
    3,
    box5,
    [
      { url: 'a', x: 2, y: 0, w: 1, h: 3, spaces: [2, 5, 8] },
      { url: 'a', x: 1, y: 2, w: 1, h: 1, spaces: [7] },
    ],
  ],
])('boxesFromSpaceURLMap(%i, %i, %j)', (width, height, data, expected) => {
  test(`returns expected ${expected.length} boxes`, () => {
    const stateURLMap = new Map(data.map((v, idx) => [idx, v]))
    const result = boxesFromSpaceURLMap(width, height, stateURLMap)
    expect(result).toStrictEqual(expected)
  })
})
